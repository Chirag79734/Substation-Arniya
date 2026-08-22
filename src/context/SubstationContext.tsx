import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incomer, Feeder, FeederLog, UserRole, Language, IncomerId, SubstationStats, FeederStatus } from '../types/substation';
import { INITIAL_INCOMERS, INITIAL_FEEDERS, INITIAL_LOGS } from '../data/initialData';

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
  setRole: (role: UserRole) => void;
  setLanguage: (lang: Language) => void;
  setOperatorName: (name: string) => void;
  setActiveTab: (tab: string) => void;
  toggleFeeder: (feederId: string, reason?: string, customOperator?: string) => void;
  tripFeeder: (feederId: string, reason?: string) => void;
  toggleIncomer: (incomerId: IncomerId) => void;
  updateFeederRemark: (feederId: string, remark: string) => void;
  resetAllData: () => void;
  clearLogs: () => void;
}

const SubstationContext = createContext<SubstationContextType | undefined>(undefined);

const STORAGE_KEY_FEEDERS = 'substation_arniya_feeders_v2';
const STORAGE_KEY_INCOMERS = 'substation_arniya_incomers_v2';
const STORAGE_KEY_LOGS = 'substation_arniya_logs_v2';
const STORAGE_KEY_ROLE = 'substation_arniya_role_v2';
const STORAGE_KEY_LANG = 'substation_arniya_lang_v2';
const STORAGE_KEY_OPERATOR = 'substation_arniya_operator_v2';

export const SubstationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [now, setNow] = useState<Date>(new Date());
  
  const [incomers, setIncomers] = useState<Incomer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INCOMERS);
    return saved ? JSON.parse(saved) : INITIAL_INCOMERS;
  });

  const [feeders, setFeeders] = useState<Feeder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FEEDERS);
    return saved ? JSON.parse(saved) : INITIAL_FEEDERS;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FEEDERS, JSON.stringify(feeders));
  }, [feeders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INCOMERS, JSON.stringify(incomers));
  }, [incomers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

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
      return prevFeeders.map(feeder => {
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

        setLogs(prev => [newLog, ...prev]);

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
    });
  };

  const tripFeeder = (feederId: string, reason?: string) => {
    const currentTime = new Date().toISOString();
    setFeeders(prevFeeders => {
      return prevFeeders.map(feeder => {
        if (feeder.id !== feederId) return feeder;

        const previousStatus = feeder.status;
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
          newStatus: 'TRIPPED',
          durationSecondsInPreviousState: elapsedSec,
          timestamp: currentTime,
          operatorName: operatorName,
          reason: reason || 'ओवरकरंट / अर्थ फॉल्ट रिले ट्रिप'
        };

        setLogs(prev => [newLog, ...prev]);

        return {
          ...feeder,
          status: 'TRIPPED',
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
    });
  };

  const toggleIncomer = (incomerId: IncomerId) => {
    const currentTime = new Date().toISOString();
    setIncomers(prev => {
      return prev.map(inc => {
        if (inc.id !== incomerId) return inc;
        const newStatus = inc.status === 'ON' ? 'OFF' : 'ON';
        return {
          ...inc,
          status: newStatus,
          voltageKv: newStatus === 'ON' ? 33.1 : 0,
          lastStatusChange: currentTime
        };
      });
    });
  };

  const updateFeederRemark = (feederId: string, remark: string) => {
    setFeeders(prev => prev.map(f => f.id === feederId ? { ...f, remarks: remark } : f));
  };

  const resetAllData = () => {
    setFeeders(INITIAL_FEEDERS);
    setIncomers(INITIAL_INCOMERS);
    setLogs(INITIAL_LOGS);
    localStorage.removeItem(STORAGE_KEY_FEEDERS);
    localStorage.removeItem(STORAGE_KEY_INCOMERS);
    localStorage.removeItem(STORAGE_KEY_LOGS);
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY_LOGS);
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
        setRole,
        setLanguage,
        setOperatorName,
        setActiveTab,
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