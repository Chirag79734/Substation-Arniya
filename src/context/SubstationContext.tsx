import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incomer, Feeder, FeederLog, UserRole, Language, IncomerId, SubstationStats, FeederStatus } from '../types/substation';
import { INITIAL_INCOMERS, INITIAL_FEEDERS, INITIAL_LOGS } from '../data/initialData';
import { 
  initFirebase, 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  FirebaseConfigType,
  syncStateToCloud
} from '../services/firebase';
import { ref, onValue, set } from 'firebase/database';

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

const STORAGE_KEY_FEEDERS = 'substation_arniya_feeders_v7';
const STORAGE_KEY_INCOMERS = 'substation_arniya_incomers_v7';
const STORAGE_KEY_LOGS = 'substation_arniya_logs_v7';
const STORAGE_KEY_ROLE = 'substation_arniya_role_v7';
const STORAGE_KEY_LANG = 'substation_arniya_lang_v7';
const STORAGE_KEY_OPERATOR = 'substation_arniya_operator_v7';

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
  
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfigType | null>(() => getSavedFirebaseConfig());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  const [incomers, setIncomers] = useState<Incomer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INCOMERS);
    return saved ? normalizeIncomers(JSON.parse(saved)) : INITIAL_INCOMERS;
  });

  const [feeders, setFeeders] = useState<Feeder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FEEDERS);
    return saved ? normalizeFeeders(JSON.parse(saved)) : INITIAL_FEEDERS;
  });

  const [logs, setLogs] = useState<FeederLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole;
    return saved || 'operator';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG) as Language;
    return saved || 'hi';
  });

  const [operatorName, setOperatorNameState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OPERATOR);
    return saved || 'रमेश कुमार (SSO)';
  });

  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dedicated Firebase Realtime Database Stream Listener
  useEffect(() => {
    if (!firebaseConfig) {
      setIsFirebaseConnected(false);
      return;
    }

    const { realtimeDb } = initFirebase(firebaseConfig);
    if (!realtimeDb) {
      setIsFirebaseConnected(false);
      return;
    }

    const handleLivePayload = (payload: any) => {
      if (!payload) return;
      setIsFirebaseConnected(true);
      setCloudSyncError(null);
      setLastCloudSyncTime(new Date().toLocaleTimeString('en-IN'));

      if (payload.feeders && Array.isArray(payload.feeders)) {
        setFeeders(normalizeFeeders(payload.feeders));
      }
      if (payload.incomers && Array.isArray(payload.incomers)) {
        setIncomers(normalizeIncomers(payload.incomers));
      }
      if (payload.logs && Array.isArray(payload.logs)) {
        setLogs(payload.logs);
      }
    };

    let unsubRTDB: (() => void) | null = null;

    try {
      const rtdbRef = ref(realtimeDb, 'substation_arniya/live_state');
      unsubRTDB = onValue(rtdbRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          handleLivePayload(val);
        } else {
          // Initialize DB immediately
          set(rtdbRef, {
            feeders: INITIAL_FEEDERS,
            incomers: INITIAL_INCOMERS,
            logs: INITIAL_LOGS,
            updatedAt: new Date().toISOString(),
            updatedBy: 'System Auto-Init'
          });
          setIsFirebaseConnected(true);
        }
      }, (err) => {
        console.error('Firebase RTDB subscription error:', err);
        setCloudSyncError(err.message);
      });
    } catch (e: any) {
      console.error('RTDB connection error:', e);
      setCloudSyncError(e?.message || 'Connection error');
    }

    return () => {
      if (unsubRTDB) unsubRTDB();
    };
  }, [firebaseConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FEEDERS, JSON.stringify(feeders));
  }, [feeders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INCOMERS, JSON.stringify(incomers));
  }, [incomers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  const updateFirebaseConfig = (config: FirebaseConfigType | null) => {
    if (config) {
      saveFirebaseConfig(config);
      setFirebaseConfigState(config);
    } else {
      clearFirebaseConfig();
      setFirebaseConfigState(null);
      setIsFirebaseConnected(false);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(STORAGE_KEY_ROLE, newRole);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const setOperatorName = (name: string) => {
    setOperatorNameState(name);
    localStorage.setItem(STORAGE_KEY_OPERATOR, name);
  };

  const toggleFeeder = (feederId: string, reason?: string, customOperator?: string) => {
    const op = customOperator || operatorName;
    const currentTime = new Date().toISOString();

    setFeeders(prevFeeders => {
      const nextFeeders: Feeder[] = prevFeeders.map(feeder => {
        if (feeder.id !== feederId) return feeder;

        const isCurrentlyOn = feeder.status === 'ON';
        const nextStatus: FeederStatus = isCurrentlyOn ? 'OFF' : 'ON';
        const previousStatus = feeder.status;
        
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

        const incomerObj = incomers.find(i => i.id === feeder.incomerId);
        const newLog: FeederLog = {
          id: `log-${Date.now()}`,
          feederId: feeder.id,
          feederName: feeder.name,
          feederHindiName: feeder.hindiName,
          incomerId: feeder.incomerId,
          incomerName: incomerObj ? incomerObj.name : feeder.incomerId,
          previousStatus,
          newStatus: nextStatus,
          durationSecondsInPreviousState: elapsedSec,
          timestamp: currentTime,
          operatorName: op,
          reason: reason || (nextStatus === 'ON' ? 'फीडर चार्ज / चालू किया गया' : 'फीडर बंद / शटडाउन')
        };

        setLogs(prevLogs => {
          const updatedLogs = [newLog, ...prevLogs];
          // Sync directly to Firebase Realtime Database
          syncStateToCloud({
            feeders: nextFeeders,
            incomers,
            logs: updatedLogs,
            updatedAt: currentTime,
            updatedBy: op
          });
          return updatedLogs;
        });

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

      syncStateToCloud({
        feeders: nextFeeders,
        incomers,
        logs,
        updatedAt: currentTime,
        updatedBy: op
      });

      return nextFeeders;
    });
  };

  const tripFeeder = (feederId: string, reason?: string) => {
    const currentTime = new Date().toISOString();

    setFeeders(prevFeeders => {
      const nextFeeders: Feeder[] = prevFeeders.map(feeder => {
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

        const incomerObj = incomers.find(i => i.id === feeder.incomerId);
        const newLog: FeederLog = {
          id: `log-${Date.now()}`,
          feederId: feeder.id,
          feederName: feeder.name,
          feederHindiName: feeder.hindiName,
          incomerId: feeder.incomerId,
          incomerName: incomerObj ? incomerObj.name : feeder.incomerId,
          previousStatus,
          newStatus: nextStatus,
          durationSecondsInPreviousState: elapsedSec,
          timestamp: currentTime,
          operatorName: operatorName,
          reason: reason || 'ओवरकरंट / अर्थ फॉल्ट रिले ट्रिप'
        };

        setLogs(prevLogs => {
          const updatedLogs = [newLog, ...prevLogs];
          syncStateToCloud({
            feeders: nextFeeders,
            incomers,
            logs: updatedLogs,
            updatedAt: currentTime,
            updatedBy: operatorName
          });
          return updatedLogs;
        });

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

      syncStateToCloud({
        feeders: nextFeeders,
        incomers,
        logs,
        updatedAt: currentTime,
        updatedBy: operatorName
      });

      return nextFeeders;
    });
  };

  const toggleIncomer = (incomerId: IncomerId) => {
    const currentTime = new Date().toISOString();
    setIncomers(prevIncomers => {
      const nextIncomers: Incomer[] = prevIncomers.map(inc => {
        if (inc.id !== incomerId) return inc;
        const newStatus: 'ON' | 'OFF' = inc.status === 'ON' ? 'OFF' : 'ON';
        return {
          ...inc,
          status: newStatus,
          voltageKv: newStatus === 'ON' ? 33.1 : 0,
          lastStatusChange: currentTime
        };
      });

      syncStateToCloud({
        feeders,
        incomers: nextIncomers,
        logs,
        updatedAt: currentTime,
        updatedBy: operatorName
      });

      return nextIncomers;
    });
  };

  const updateFeederRemark = (feederId: string, remark: string) => {
    setFeeders(prevFeeders => {
      const nextFeeders = prevFeeders.map(f => f.id === feederId ? { ...f, remarks: remark } : f);
      syncStateToCloud({
        feeders: nextFeeders,
        incomers,
        logs,
        updatedAt: new Date().toISOString(),
        updatedBy: operatorName
      });
      return nextFeeders;
    });
  };

  const resetAllData = () => {
    setFeeders(INITIAL_FEEDERS);
    setIncomers(INITIAL_INCOMERS);
    setLogs(INITIAL_LOGS);
    localStorage.removeItem(STORAGE_KEY_FEEDERS);
    localStorage.removeItem(STORAGE_KEY_INCOMERS);
    localStorage.removeItem(STORAGE_KEY_LOGS);

    syncStateToCloud({
      feeders: INITIAL_FEEDERS,
      incomers: INITIAL_INCOMERS,
      logs: INITIAL_LOGS,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Reset'
    });
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    syncStateToCloud({
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
        firebaseConfig,
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