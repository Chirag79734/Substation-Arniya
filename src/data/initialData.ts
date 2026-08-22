import { Incomer, Feeder, FeederLog } from '../types/substation';

export const INITIAL_INCOMERS: Incomer[] = [
  {
    id: 'inc-1',
    name: 'Incoming 1 (33kV Incomer-1)',
    hindiName: '??????? ?????? (33kV ??????-1)',
    status: 'ON',
    voltageKv: 33.2,
    currentAmp: 345,
    frequencyHz: 50.02,
    transformerMva: 10,
    oilTempC: 58.4,
    windingTempC: 64.2,
    lastStatusChange: new Date(Date.now() - 3600 * 1000 * 6.5).toISOString(),
  },
  {
    id: 'inc-2',
    name: 'Incoming 2 (33kV Incomer-2)',
    hindiName: '??????? ????? (33kV ??????-2)',
    status: 'ON',
    voltageKv: 33.1,
    currentAmp: 280,
    frequencyHz: 50.01,
    transformerMva: 10,
    oilTempC: 54.1,
    windingTempC: 60.8,
    lastStatusChange: new Date(Date.now() - 3600 * 1000 * 8.2).toISOString(),
  }
];

export const INITIAL_FEEDERS: Feeder[] = [
  // Incoming 1 Feeders
  {
    id: 'f-raniyawali',
    name: 'Raniyawali Feeder',
    hindiName: '???????? ????',
    incomerId: 'inc-1',
    status: 'ON',
    nominalVoltageKv: 11.0,
    voltageKv: 11.2,
    currentAmp: 82,
    powerMw: 1.45,
    powerFactor: 0.92,
    lastStatusChange: new Date(Date.now() - 3600 * 1000 * 4.2).toISOString(), // 4.2 hours ago
    totalUptimeSecondsToday: 28800, // 8 hrs
    totalDowntimeSecondsToday: 1800, // 30 min
    tripCountToday: 0,
    category: 'Rural',
    remarks: 'Normal Supply'
  },
  {
    id: 'f-kairola',
    name: 'Kairola Feeder',
    hindiName: '?????? ????',
    incomerId: 'inc-1',
    status: 'ON',
    nominalVoltageKv: 11.0,
    voltageKv: 11.1,
    currentAmp: 64,
    powerMw: 1.12,
    powerFactor: 0.91,
    lastStatusChange: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString(), // 2.5 hours ago
    totalUptimeSecondsToday: 25200, // 7 hrs
    totalDowntimeSecondsToday: 3600, // 1 hr
    tripCountToday: 1,
    category: 'Rural',
    remarks: 'Running smoothly'
  },
  {
    id: 'f-ghatal-2',
    name: 'Ghatal Second Feeder',
    hindiName: '???? ????? ????',
    incomerId: 'inc-1',
    status: 'ON',
    nominalVoltageKv: 11.0,
    voltageKv: 11.3,
    currentAmp: 95,
    powerMw: 1.72,
    powerFactor: 0.93,
    lastStatusChange: new Date(Date.now() - 3600 * 1000 * 5.8).toISOString(),
    totalUptimeSecondsToday: 30600,
    totalDowntimeSecondsToday: 900,
    tripCountToday: 0,
    category: 'Rural',
    remarks: 'Normal'
  },
  {
    id: 'f-muni',
    name: 'Muni Feeder',
    hindiName: '???? ????',
    incomerId: 'inc-1',
    status: 'OFF',
    nominalVoltageKv: 11.0,
    voltageKv: 0,
    currentAmp: 0,
    powerMw: 0,
    powerFactor: 0,
    lastStatusChange: new Date(Date.now() - 60 * 1000 * 45).toISOString(), // 45 mins ago
    totalUptimeSecondsToday: 21600, // 6 hrs
    totalDowntimeSecondsToday: 5400, // 1.5 hrs
    tripCountToday: 1,
    category: 'Rural',
    remarks: 'Load Rostering / Scheduled Outage'
  },
  {
    id: 'f-ghatal-ptw',
    name: 'Ghatal PTW Feeder',
    hindiName: '???? ??????????? ????',
    incomerId: 'inc-1',
    status: 'ON',
    nominalVoltageKv: 11.0,
    voltageKv: 11.0,
    currentAmp: 110,
    powerMw: 1.95,
    powerFactor: 0.90,
    lastStatusChange: new Date(Date.now() - 3600 * 1000 * 3.1).toISOString(),
    totalUptimeSecondsToday: 27000,
    totalDowntimeSecondsToday: 2400,
    tripCountToday: 0,
    category: 'Agriculture/PTW',
    remarks: 'Agricultural Peak Schedule'
  },

  // Incoming 2 Feeders
  {
    id: 'f-surjawali',
    name: 'Surjawali Feeder',
    hindiName: '???????? ????',
    incomerId: 'inc-2',
    status: 'ON',
    nominalVoltageKv: 11.0,
    voltageKv: 11.2,
    currentAmp: 88,
    powerMw: 1.55,
    powerFactor: 0.92,
    lastStatusChange: new Date(Date.now() - 3600 * 1000 * 6.0).toISOString(),
    totalUptimeSecondsToday: 31200,
    totalDowntimeSecondsToday: 600,
    tripCountToday: 0,
    category: 'Rural',
    remarks: 'Normal Supply'
  },
  {
    id: 'f-arniya',
    name: 'Arniya Feeder',
    hindiName: '?????? ????',
    incomerId: 'inc-2',
    status: 'ON',
    nominalVoltageKv: 11.0,
    voltageKv: 11.3,
    currentAmp: 104,
    powerMw: 1.88,
    powerFactor: 0.94,
    lastStatusChange: new Date(Date.now() - 3600 * 1000 * 7.5).toISOString(),
    totalUptimeSecondsToday: 32400,
    totalDowntimeSecondsToday: 0,
    tripCountToday: 0,
    category: 'Town/Urban',
    remarks: 'Substation Town Feeder - Active'
  },
  {
    id: 'f-dussehra',
    name: 'Dussehra Feeder',
    hindiName: '????? ????',
    incomerId: 'inc-2',
    status: 'OFF',
    nominalVoltageKv: 11.0,
    voltageKv: 0,
    currentAmp: 0,
    powerMw: 0,
    powerFactor: 0,
    lastStatusChange: new Date(Date.now() - 60 * 1000 * 20).toISOString(), // 20 mins ago
    totalUptimeSecondsToday: 24000,
    totalDowntimeSecondsToday: 4200,
    tripCountToday: 1,
    category: 'Rural',
    remarks: 'Maintenance / Line Patrol'
  }
];

export const INITIAL_LOGS: FeederLog[] = [
  {
    id: 'log-1',
    feederId: 'f-muni',
    feederName: 'Muni Feeder',
    feederHindiName: '???? ????',
    incomerId: 'inc-1',
    incomerName: 'Incoming 1',
    previousStatus: 'ON',
    newStatus: 'OFF',
    durationSecondsInPreviousState: 21600, // 6 hrs
    timestamp: new Date(Date.now() - 60 * 1000 * 45).toISOString(),
    operatorName: 'Ramesh Kumar (SSO)',
    reason: 'Rostering - Agricultural slot change'
  },
  {
    id: 'log-2',
    feederId: 'f-dussehra',
    feederName: 'Dussehra Feeder',
    feederHindiName: '????? ????',
    incomerId: 'inc-2',
    incomerName: 'Incoming 2',
    previousStatus: 'ON',
    newStatus: 'OFF',
    durationSecondsInPreviousState: 24000, // 6.6 hrs
    timestamp: new Date(Date.now() - 60 * 1000 * 20).toISOString(),
    operatorName: 'Ramesh Kumar (SSO)',
    reason: 'Line clearance / Maintenance requested by Lineman'
  },
  {
    id: 'log-3',
    feederId: 'f-kairola',
    feederName: 'Kairola Feeder',
    feederHindiName: '?????? ????',
    incomerId: 'inc-1',
    incomerName: 'Incoming 1',
    previousStatus: 'OFF',
    newStatus: 'ON',
    durationSecondsInPreviousState: 3600, // 1 hr
    timestamp: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString(),
    operatorName: 'Suresh Sharma (SSO)',
    reason: 'Restored after jumper replacement'
  }
];
