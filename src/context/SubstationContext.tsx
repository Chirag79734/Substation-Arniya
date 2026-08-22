import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Incomer, Feeder, FeederLog, UserRole, Language, IncomerId, SubstationStats, FeederStatus, HourlySubstationLog } from '../types/substation';
import { INITIAL_INCOMERS, INITIAL_FEEDERS, INITIAL_LOGS } from '../data/initialData';
import { AuthorizedUser, INITIAL_WHITELISTED_USERS } from '../data/authorizedUsers';
import { 
  initFirebase, 
  DEFAULT_FIREBASE_CONFIG,
  FirebaseConfigType,
  syncStateToCloud
} from '../services/firebase';
import { ref, onValue, set } from 'firebase/database';

interface SubstationContextType {
  currentUser: AuthorizedUser | null;
  whitelistedUsers: AuthorizedUser[];
  incomers: Incomer[];
  feeders: Feeder[];
  logs: FeederLog[];
  hourlyLogs: Record<string, HourlySubstationLog>;
  activeHourlyLogTimeLabel: string;
  role: UserRole;
  language: Language;
  operatorName: string;
  activeTab: string;
  stats: SubstationStats;
  now: Date;
  isFirebaseConnected: boolean;
  cloudSyncError: string | null;
  lastCloudSyncTime: string | null;
  firebaseConfig: FirebaseConfigType | null;
  login: (id: string, pin: string) => boolean;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setLanguage: (lang: Language) => void;
  setOperatorName: (name: string) => void;
  setActiveTab: (tab: string) => void;
  updateFirebaseConfig: (config: FirebaseConfigType | null) => void;
  toggleFeeder: (feederId: string, reason?: string, customOperator?: string, operationTimeIso?: string) => void;
  tripFeeder: (feederId: string, reason?: string) => void;
  toggleIncomer: (incomerId: IncomerId) => void;
  updateFeederRemark: (feederId: string, remark: string) => void;
  saveHourlyLog: (log: HourlySubstationLog) => Promise<void>;
  resetAllData: () => void;
  clearLogs: () => void;
}

const SubstationContext = createContext<SubstationContextType | undefined>(undefined);

function normalizeFeeders(incomingList: Feeder[]): Feeder[] {
  if (!incomingList || !Array.isArray(incomingList)) return INITIAL_FEEDERS;
  
  const incomingMap = new Map<string, Feeder>();
  incomingList.forEach(f => {
    if (f && f.id) {
      incomingMap.set(f.id, f);
      if (f.id === 'f-kairola') incomingMap.set('f-kaherola', f);
      if (f.id === 'f-dussehra') incomingMap.set('f-dashera', f);
    }
  });

  return INITIAL_FEEDERS.map((initF) => {
    const existing = incomingMap.get(initF.id);
    if (existing) {
      return {
        ...initF,
        status: (existing.status === 'ON' || existing.status === 'OFF' || existing.status === 'TRIPPED' || existing.status === 'MAINTENANCE') ? existing.status : initF.status,
        voltageKv: typeof existing.voltageKv === 'number' ? existing.voltageKv : initF.voltageKv,
        currentAmp: typeof existing.currentAmp === 'number' ? existing.currentAmp : initF.currentAmp,
        powerMw: typeof existing.powerMw === 'number' ? existing.powerMw : initF.powerMw,
        powerFactor: typeof existing.powerFactor === 'number' ? existing.powerFactor : initF.powerFactor,
        lastStatusChange: existing.lastStatusChange || initF.lastStatusChange,
        totalUptimeSecondsToday: typeof existing.totalUptimeSecondsToday === 'number' ? existing.totalUptimeSecondsToday : initF.totalUptimeSecondsToday,
        totalDowntimeSecondsToday: typeof existing.totalDowntimeSecondsToday === 'number' ? existing.totalDowntimeSecondsToday : initF.totalDowntimeSecondsToday,
        tripCountToday: typeof existing.tripCountToday === 'number' ? existing.tripCountToday : initF.tripCountToday,
        remarks: existing.remarks || initF.remarks,
        rAmp: typeof existing.rAmp === 'number' ? existing.rAmp : undefined,
        yAmp: typeof existing.yAmp === 'number' ? existing.yAmp : undefined,
        bAmp: typeof existing.bAmp === 'number' ? existing.bAmp : undefined
      };
    }
    return initF;
  });
}

function normalizeIncomers(incomingList: Incomer[]): Incomer[] {
  if (!incomingList || !Array.isArray(incomingList)) return INITIAL_INCOMERS;
  const incomingMap = new Map<string, Incomer>();
  incomingList.forEach(i => {
    if (i && i.id) incomingMap.set(i.id, i);
  });

  return INITIAL_INCOMERS.map((initInc) => {
    const existing = incomingMap.get(initInc.id);
    if (existing) {
      return {
        ...initInc,
        status: existing.status || initInc.status,
        voltageKv: typeof existing.voltageKv === 'number' ? existing.voltageKv : initInc.voltageKv,
        currentAmp: typeof existing.currentAmp === 'number' ? existing.currentAmp : initInc.currentAmp,
        oilTempC: typeof existing.oilTempC === 'number' ? existing.oilTempC : initInc.oilTempC,
        windingTempC: typeof existing.windingTempC === 'number' ? existing.windingTempC : initInc.windingTempC,
        lastStatusChange: existing.lastStatusChange || initInc.lastStatusChange
      };
    }
    return initInc;
  });
}

export const SubstationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [now, setNow] = useState<Date>(new Date());
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthorizedUser | null>(() => {
    try {
      const saved = localStorage.getItem('substation_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [whitelistedUsers] = useState<AuthorizedUser[]>(INITIAL_WHITELISTED_USERS);

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  const [incomers, setIncomers] = useState<Incomer[]>(INITIAL_INCOMERS);
  const [feeders, setFeeders] = useState<Feeder[]>(INITIAL_FEEDERS);
  const [logs, setLogs] = useState<FeederLog[]>(INITIAL_LOGS);
  const [hourlyLogs, setHourlyLogs] = useState<Record<string, HourlySubstationLog>>({});

  const [language, setLanguage] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Role & Operator name derived from logged in user
  const role: UserRole = useMemo(() => {
    if (!currentUser) return 'officer';
    return (currentUser.role === 'operator' || currentUser.role === 'admin') ? 'operator' : 'officer';
  }, [currentUser]);

  const operatorName: string = useMemo(() => {
    if (!currentUser) return 'ऑपरेटर';
    return currentUser.name;
  }, [currentUser]);

  const login = (id: string, pin: string): boolean => {
    const user = whitelistedUsers.find(
      u => u.id.toLowerCase() === id.trim().toLowerCase() && u.pin === pin.trim()
    );
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('substation_auth_user', JSON.stringify(user));
      } catch (e) {
        console.error('LocalStorage error:', e);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('substation_auth_user');
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Dedicated Live Realtime Database Listener
  useEffect(() => {
    let unsubLive: (() => void) | null = null;
    let unsubHourly: (() => void) | null = null;

    try {
      const { realtimeDb } = initFirebase();

      // 1. Live state listener (Feeders, Incomers, Logs)
      const liveRef = ref(realtimeDb, 'substation_arniya/live_state');
      unsubLive = onValue(liveRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setIsFirebaseConnected(true);
          setCloudSyncError(null);
          setLastCloudSyncTime(new Date().toLocaleTimeString('en-IN'));

          if (val.feeders && Array.isArray(val.feeders)) {
            setFeeders(normalizeFeeders(val.feeders));
          }
          if (val.incomers && Array.isArray(val.incomers)) {
            setIncomers(normalizeIncomers(val.incomers));
          }
          if (val.logs && Array.isArray(val.logs)) {
            setLogs(val.logs);
          }
        }
      }, (err) => {
        console.error('Realtime Database listener error:', err);
        setCloudSyncError(err.message);
      });

      // 2. Hourly load logs listener
      const hourlyRef = ref(realtimeDb, 'substation_arniya/hourly_logs');
      unsubHourly = onValue(hourlyRef, (snapshot) => {
        const val = snapshot.val();
        if (val && typeof val === 'object') {
          setHourlyLogs(val);
        }
      });
    } catch (e: any) {
      console.error('Firebase init error:', e);
      setCloudSyncError(e?.message || 'Connection error');
    }

    return () => {
      if (unsubLive) unsubLive();
      if (unsubHourly) unsubHourly();
    };
  }, []);

  // Compute Current Hour Log
  const todayDateStr = now.toISOString().split('T')[0];
  const currentHourNum = now.getHours() === 0 ? 24 : now.getHours();

  const { activeHourlyLog, activeHourlyLogTimeLabel } = useMemo(() => {
    const currentKey = `hourly-${todayDateStr}-${currentHourNum}`;
    if (hourlyLogs[currentKey] && hourlyLogs[currentKey].readings) {
      const hObj = hourlyLogs[currentKey];
      return {
        activeHourlyLog: hObj,
        activeHourlyLogTimeLabel: `${currentHourNum.toString().padStart(2, '0')}:00 बजे का लोड (चालू घंटा)`
      };
    }

    // Check recent hours of today
    for (let h = currentHourNum - 1; h >= 1; h--) {
      const key = `hourly-${todayDateStr}-${h}`;
      if (hourlyLogs[key] && hourlyLogs[key].readings) {
        return {
          activeHourlyLog: hourlyLogs[key],
          activeHourlyLogTimeLabel: `${h.toString().padStart(2, '0')}:00 बजे का लोड`
        };
      }
    }

    return {
      activeHourlyLog: null,
      activeHourlyLogTimeLabel: `${currentHourNum.toString().padStart(2, '0')}:00 बजे (लाइव)`
    };
  }, [hourlyLogs, todayDateStr, currentHourNum]);

  // Feeders with Realtime Switch Priority & Hourly Load Telemetry
  const effectiveFeeders: Feeder[] = useMemo(() => {
    return feeders.map(feeder => {
      // 1. If feeder circuit breaker is switched OFF or TRIPPED, respect that strictly!
      if (feeder.status === 'OFF' || feeder.status === 'TRIPPED') {
        return {
          ...feeder,
          currentAmp: 0,
          powerMw: 0,
          rAmp: 0,
          yAmp: 0,
          bAmp: 0,
          voltageKv: 0
        };
      }

      // 2. If feeder is ON, apply active hourly reading if present
      if (activeHourlyLog && activeHourlyLog.readings && activeHourlyLog.readings[feeder.id]) {
        const reading = activeHourlyLog.readings[feeder.id];
        const r = typeof reading.rAmp === 'number' ? reading.rAmp : 0;
        const y = typeof reading.yAmp === 'number' ? reading.yAmp : 0;
        const b = typeof reading.bAmp === 'number' ? reading.bAmp : 0;
        const avg = typeof reading.avgAmp === 'number' ? reading.avgAmp : Math.round((r + y + b) / 3);
        const mw = typeof reading.powerMw === 'number' ? reading.powerMw : +(avg * 11 * 1.732 * 0.92 / 1000).toFixed(2);

        return {
          ...feeder,
          status: 'ON',
          currentAmp: avg,
          powerMw: mw,
          rAmp: r,
          yAmp: y,
          bAmp: b,
          voltageKv: 11.0
        };
      }

      // 3. Fallback for ON feeder
      const r = feeder.rAmp !== undefined ? feeder.rAmp : Math.round((feeder.currentAmp || 60) * 1.02);
      const y = feeder.yAmp !== undefined ? feeder.yAmp : Math.round((feeder.currentAmp || 60) * 0.98);
      const b = feeder.bAmp !== undefined ? feeder.bAmp : (feeder.currentAmp || 60);
      return {
        ...feeder,
        status: 'ON',
        currentAmp: feeder.currentAmp || 60,
        powerMw: feeder.powerMw || +(60 * 11 * 1.732 * 0.92 / 1000).toFixed(2),
        rAmp: r,
        yAmp: y,
        bAmp: b,
        voltageKv: 11.0
      };
    });
  }, [feeders, activeHourlyLog]);

  const updateFirebaseConfig = () => {};

  const saveHourlyLog = async (newLog: HourlySubstationLog) => {
    const updatedHourly = {
      ...hourlyLogs,
      [newLog.id]: newLog
    };
    setHourlyLogs(updatedHourly);

    // Also update live feeders
    const nextFeeders: Feeder[] = feeders.map(f => {
      const reading = newLog.readings?.[f.id];
      if (reading) {
        const isOff = reading.rAmp === 0 && reading.yAmp === 0 && reading.bAmp === 0;
        const newStatus: FeederStatus = isOff 
          ? (f.status === 'TRIPPED' ? 'TRIPPED' : 'OFF') 
          : (f.status === 'TRIPPED' ? 'TRIPPED' : 'ON');
        return {
          ...f,
          status: newStatus,
          currentAmp: reading.avgAmp,
          powerMw: reading.powerMw,
          rAmp: reading.rAmp,
          yAmp: reading.yAmp,
          bAmp: reading.bAmp,
          voltageKv: isOff ? 0 : 11.0
        };
      }
      return f;
    });

    setFeeders(nextFeeders);

    try {
      const { realtimeDb } = initFirebase();
      const logRef = ref(realtimeDb, `substation_arniya/hourly_logs/${newLog.id}`);
      await set(logRef, newLog);

      await syncStateToCloud({
        feeders: nextFeeders,
        incomers,
        logs,
        updatedAt: new Date().toISOString(),
        updatedBy: newLog.operatorName || operatorName
      });
    } catch (err) {
      console.error('Failed to save hourly log to cloud:', err);
    }
  };

  const toggleFeeder = async (feederId: string, reason?: string, customOperator?: string, operationTimeIso?: string) => {
    if (role !== 'operator') return;

    const op = customOperator || operatorName;
    const currentTime = operationTimeIso || new Date().toISOString();

    const nextFeeders: Feeder[] = feeders.map(feeder => {
      if (feeder.id !== feederId) return feeder;

      const isCurrentlyOn = feeder.status === 'ON';
      const nextStatus: FeederStatus = isCurrentlyOn ? 'OFF' : 'ON';
      
      const elapsedSec = Math.max(0, Math.floor((new Date(currentTime).getTime() - new Date(feeder.lastStatusChange).getTime()) / 1000));
      
      let newUptime = feeder.totalUptimeSecondsToday;
      let newDowntime = feeder.totalDowntimeSecondsToday;

      if (isCurrentlyOn) {
        newUptime += elapsedSec;
      } else {
        newDowntime += elapsedSec;
      }

      const newVoltage = nextStatus === 'ON' ? +(11.1 + Math.random() * 0.3).toFixed(2) : 0;
      const newCurrent = nextStatus === 'ON' ? Math.floor(60 + Math.random() * 60) : 0;
      const newPower = nextStatus === 'ON' ? +(newCurrent * 11.2 * 1.732 * 0.92 / 1000).toFixed(2) : 0;
      const r = nextStatus === 'ON' ? Math.round(newCurrent * 1.02) : 0;
      const y = nextStatus === 'ON' ? Math.round(newCurrent * 0.98) : 0;
      const b = nextStatus === 'ON' ? newCurrent : 0;

      return {
        ...feeder,
        status: nextStatus,
        voltageKv: newVoltage,
        currentAmp: newCurrent,
        powerMw: newPower,
        rAmp: r,
        yAmp: y,
        bAmp: b,
        lastStatusChange: currentTime,
        totalUptimeSecondsToday: newUptime,
        totalDowntimeSecondsToday: newDowntime,
        remarks: reason || (nextStatus === 'ON' ? 'सामान्य चालू' : 'मैन्युअल बंद')
      };
    });

    const targetFeeder = nextFeeders.find(f => f.id === feederId)!;
    const incomerObj = incomers.find(i => i.id === targetFeeder.incomerId);
    const elapsedSec = Math.max(0, Math.floor((new Date(currentTime).getTime() - new Date(targetFeeder.lastStatusChange).getTime()) / 1000));

    const newLog: FeederLog = {
      id: `log-${Date.now()}`,
      feederId: targetFeeder.id,
      feederName: targetFeeder.name,
      feederHindiName: targetFeeder.hindiName,
      incomerId: targetFeeder.incomerId,
      incomerName: incomerObj ? incomerObj.name : targetFeeder.incomerId,
      previousStatus: targetFeeder.status === 'ON' ? 'OFF' : 'ON',
      newStatus: targetFeeder.status,
      durationSecondsInPreviousState: elapsedSec,
      timestamp: currentTime,
      operatorName: op,
      reason: reason || (targetFeeder.status === 'ON' ? 'फीडर चार्ज / चालू किया गया' : 'फीडर बंद / शटडाउन')
    };

    const nextLogs = [newLog, ...logs];

    setFeeders(nextFeeders);
    setLogs(nextLogs);

    await syncStateToCloud({
      feeders: nextFeeders,
      incomers,
      logs: nextLogs,
      updatedAt: currentTime,
      updatedBy: op
    });
  };

  const tripFeeder = async (feederId: string, reason?: string) => {
    if (role !== 'operator') return;

    const currentTime = new Date().toISOString();

    const nextFeeders: Feeder[] = feeders.map(feeder => {
      if (feeder.id !== feederId) return feeder;

      const previousStatus = feeder.status;
      const nextStatus: FeederStatus = 'TRIPPED';
      const elapsedSec = Math.max(0, Math.floor((new Date(currentTime).getTime() - new Date(feeder.lastStatusChange).getTime()) / 1000));
      
      let newUptime = feeder.totalUptimeSecondsToday;
      let newDowntime = feeder.totalDowntimeSecondsToday;
      if (previousStatus === 'ON') {
        newUptime += elapsedSec;
      } else {
        newDowntime += elapsedSec;
      }

      return {
        ...feeder,
        status: nextStatus,
        voltageKv: 0,
        currentAmp: 0,
        powerMw: 0,
        rAmp: 0,
        yAmp: 0,
        bAmp: 0,
        lastStatusChange: currentTime,
        totalUptimeSecondsToday: newUptime,
        totalDowntimeSecondsToday: newDowntime,
        tripCountToday: feeder.tripCountToday + 1,
        remarks: reason || 'प्रोटेक्शन रिले ट्रिप'
      };
    });

    const targetFeeder = nextFeeders.find(f => f.id === feederId)!;
    const incomerObj = incomers.find(i => i.id === targetFeeder.incomerId);
    const elapsedSec = Math.max(0, Math.floor((new Date(currentTime).getTime() - new Date(targetFeeder.lastStatusChange).getTime()) / 1000));

    const newLog: FeederLog = {
      id: `log-${Date.now()}`,
      feederId: targetFeeder.id,
      feederName: targetFeeder.name,
      feederHindiName: targetFeeder.hindiName,
      incomerId: targetFeeder.incomerId,
      incomerName: incomerObj ? incomerObj.name : targetFeeder.incomerId,
      previousStatus: 'ON',
      newStatus: 'TRIPPED',
      durationSecondsInPreviousState: elapsedSec,
      timestamp: currentTime,
      operatorName: operatorName,
      reason: reason || 'ओवरकरंट / अर्थ फॉल्ट रिले ट्रिप'
    };

    const nextLogs = [newLog, ...logs];

    setFeeders(nextFeeders);
    setLogs(nextLogs);

    await syncStateToCloud({
      feeders: nextFeeders,
      incomers,
      logs: nextLogs,
      updatedAt: currentTime,
      updatedBy: operatorName
    });
  };

  const toggleIncomer = async (incomerId: IncomerId) => {
    if (role !== 'operator') return;

    const currentTime = new Date().toISOString();
    const nextIncomers: Incomer[] = incomers.map(inc => {
      if (inc.id !== incomerId) return inc;
      const newStatus: 'ON' | 'OFF' = inc.status === 'ON' ? 'OFF' : 'ON';
      return {
        ...inc,
        status: newStatus,
        voltageKv: newStatus === 'ON' ? 33.1 : 0,
        lastStatusChange: currentTime
      };
    });

    setIncomers(nextIncomers);

    await syncStateToCloud({
      feeders: effectiveFeeders,
      incomers: nextIncomers,
      logs,
      updatedAt: currentTime,
      updatedBy: operatorName
    });
  };

  const updateFeederRemark = async (feederId: string, remark: string) => {
    if (role !== 'operator') return;

    const nextFeeders = feeders.map(f => f.id === feederId ? { ...f, remarks: remark } : f);
    setFeeders(nextFeeders);

    await syncStateToCloud({
      feeders: nextFeeders,
      incomers,
      logs,
      updatedAt: new Date().toISOString(),
      updatedBy: operatorName
    });
  };

  const resetAllData = async () => {
    if (role !== 'operator') return;

    setFeeders(INITIAL_FEEDERS);
    setIncomers(INITIAL_INCOMERS);
    setLogs(INITIAL_LOGS);

    await syncStateToCloud({
      feeders: INITIAL_FEEDERS,
      incomers: INITIAL_INCOMERS,
      logs: INITIAL_LOGS,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Reset'
    });
  };

  const clearLogs = async () => {
    if (role !== 'operator') return;

    setLogs([]);
    await syncStateToCloud({
      feeders: effectiveFeeders,
      incomers,
      logs: [],
      updatedAt: new Date().toISOString(),
      updatedBy: 'Clear Logs'
    });
  };

  const setRole = () => {};
  const setOperatorName = () => {};

  const activeFeeders = effectiveFeeders.filter(f => f.status === 'ON').length;
  const inactiveFeeders = effectiveFeeders.length - activeFeeders;
  const totalLoadMw = +(effectiveFeeders.reduce((sum, f) => sum + (f.status === 'ON' ? f.powerMw : 0), 0)).toFixed(2);
  const totalTrippingsToday = effectiveFeeders.reduce((sum, f) => sum + f.tripCountToday, 0);

  let totalUpSeconds = 0;
  let totalDownSeconds = 0;
  effectiveFeeders.forEach(f => {
    const currentElapsed = Math.max(0, Math.floor((now.getTime() - new Date(f.lastStatusChange).getTime()) / 1000));
    if (f.status === 'ON') {
      totalUpSeconds += f.totalUptimeSecondsToday + currentElapsed;
      totalDownSeconds += f.totalDowntimeSecondsToday;
    } else {
      totalUpSeconds += f.totalUptimeSecondsToday;
      totalDownSeconds += f.totalDowntimeSecondsToday + currentElapsed;
    }
  });

  const totalTime = totalUpSeconds + totalDownSeconds;
  const substationUptimePercentage = totalTime > 0 ? +((totalUpSeconds / totalTime) * 100).toFixed(1) : 100;

  const stats: SubstationStats = {
    totalFeeders: effectiveFeeders.length,
    activeFeeders,
    inactiveFeeders,
    totalLoadMw,
    substationUptimePercentage,
    totalTrippingsToday
  };

  return (
    <SubstationContext.Provider
      value={{
        currentUser,
        whitelistedUsers,
        incomers,
        feeders: effectiveFeeders,
        logs,
        hourlyLogs,
        activeHourlyLogTimeLabel,
        role,
        language,
        operatorName,
        activeTab,
        stats,
        now,
        isFirebaseConnected,
        cloudSyncError,
        lastCloudSyncTime,
        firebaseConfig: DEFAULT_FIREBASE_CONFIG,
        login,
        logout,
        setRole,
        setLanguage,
        setOperatorName,
        setActiveTab,
        updateFirebaseConfig,
        toggleFeeder,
        tripFeeder,
        toggleIncomer,
        updateFeederRemark,
        saveHourlyLog,
        resetAllData,
        clearLogs
      }}
    >
      {children}
    </SubstationContext.Provider>
  );
};

export const useSubstation = () => {
  const context = useContext(SubstationContext);
  if (!context) {
    throw new Error('useSubstation must be used within a SubstationProvider');
  }
  return context;
};