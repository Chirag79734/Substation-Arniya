import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incomer, Feeder, FeederLog, UserRole, Language, IncomerId, SubstationStats, FeederStatus } from '../types/substation';
import { INITIAL_INCOMERS, INITIAL_FEEDERS, INITIAL_LOGS } from '../data/initialData';
import { 
  initFirebase, 
  DEFAULT_FIREBASE_CONFIG,
  FirebaseConfigType,
  syncStateToCloud
} from '../services/firebase';
import { ref, onValue } from 'firebase/database';

interface SubstationContextType {
  incomers: Incomer[];
  feeders: Feeder[];
  logs: FeederLog[];
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
  setRole: (role: UserRole) => void;
  setLanguage: (lang: Language) => void;
  setOperatorName: (name: string) => void;
  setActiveTab: (tab: string) => void;
  updateFirebaseConfig: (config: FirebaseConfigType | null) => void;
  toggleFeeder: (feederId: string, reason?: string, customOperator?: string) => void;
  tripFeeder: (feederId: string, reason?: string) => void;
  toggleIncomer: (incomerId: IncomerId) => void;
  updateFeederRemark: (feederId: string, remark: string) => void;
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
        remarks: existing.remarks || initF.remarks
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
  
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  const [incomers, setIncomers] = useState<Incomer[]>(INITIAL_INCOMERS);
  const [feeders, setFeeders] = useState<Feeder[]>(INITIAL_FEEDERS);
  const [logs, setLogs] = useState<FeederLog[]>(INITIAL_LOGS);

  const [role, setRole] = useState<UserRole>('operator');
  const [language, setLanguage] = useState<Language>('hi');
  const [operatorName, setOperatorName] = useState<string>('रमेश कुमार (SSO)');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dedicated Live Realtime Database Listener
  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      const { realtimeDb } = initFirebase();
      const liveRef = ref(realtimeDb, 'substation_arniya/live_state');

      unsub = onValue(liveRef, (snapshot) => {
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
        } else {
          // Push initial data
          syncStateToCloud({
            feeders: INITIAL_FEEDERS,
            incomers: INITIAL_INCOMERS,
            logs: INITIAL_LOGS,
            updatedAt: new Date().toISOString(),
            updatedBy: 'System Init'
          });
        }
      }, (err) => {
        console.error('Realtime Database listener error:', err);
        setCloudSyncError(err.message);
      });
    } catch (e: any) {
      console.error('Firebase init error:', e);
      setCloudSyncError(e?.message || 'Connection error');
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const updateFirebaseConfig = () => {};

  const toggleFeeder = async (feederId: string, reason?: string, customOperator?: string) => {
    const op = customOperator || operatorName;
    const currentTime = new Date().toISOString();

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

      return {
        ...feeder,
        status: nextStatus,
        voltageKv: newVoltage,
        currentAmp: newCurrent,
        powerMw: newPower,
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

    // Update local immediately
    setFeeders(nextFeeders);
    setLogs(nextLogs);

    // Push to Firebase Realtime Database
    await syncStateToCloud({
      feeders: nextFeeders,
      incomers,
      logs: nextLogs,
      updatedAt: currentTime,
      updatedBy: op
    });
  };

  const tripFeeder = async (feederId: string, reason?: string) => {
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
      feeders,
      incomers: nextIncomers,
      logs,
      updatedAt: currentTime,
      updatedBy: operatorName
    });
  };

  const updateFeederRemark = async (feederId: string, remark: string) => {
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
    setLogs([]);
    await syncStateToCloud({
      feeders,
      incomers,
      logs: [],
      updatedAt: new Date().toISOString(),
      updatedBy: 'Clear Logs'
    });
  };

  const activeFeeders = feeders.filter(f => f.status === 'ON').length;
  const inactiveFeeders = feeders.length - activeFeeders;
  const totalLoadMw = +(feeders.reduce((sum, f) => sum + (f.status === 'ON' ? f.powerMw : 0), 0)).toFixed(2);
  const totalTrippingsToday = feeders.reduce((sum, f) => sum + f.tripCountToday, 0);

  let totalUpSeconds = 0;
  let totalDownSeconds = 0;
  feeders.forEach(f => {
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
    totalFeeders: feeders.length,
    activeFeeders,
    inactiveFeeders,
    totalLoadMw,
    substationUptimePercentage,
    totalTrippingsToday
  };

  return (
    <SubstationContext.Provider
      value={{
        incomers,
        feeders,
        logs,
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
        setRole,
        setLanguage,
        setOperatorName,
        setActiveTab,
        updateFirebaseConfig,
        toggleFeeder,
        tripFeeder,
        toggleIncomer,
        updateFeederRemark,
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