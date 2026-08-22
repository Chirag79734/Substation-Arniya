export type FeederStatus = 'ON' | 'OFF' | 'TRIPPED' | 'MAINTENANCE';

export type IncomerId = 'inc-1' | 'inc-2';

export interface Feeder {
  id: string;
  name: string;
  hindiName: string;
  incomerId: IncomerId;
  status: FeederStatus;
  nominalVoltageKv: number; // 11 kV
  voltageKv: number;
  currentAmp: number;
  powerMw: number;
  powerFactor: number;
  lastStatusChange: string; // ISO string
  totalUptimeSecondsToday: number;
  totalDowntimeSecondsToday: number;
  tripCountToday: number;
  remarks?: string;
  category: 'Rural' | 'Agriculture/PTW' | 'Town/Urban' | 'Industrial';
}

export interface Incomer {
  id: IncomerId;
  name: string;
  hindiName: string;
  status: 'ON' | 'OFF';
  voltageKv: number; // 33 kV
  currentAmp: number;
  frequencyHz: number;
  transformerMva: number;
  oilTempC: number;
  windingTempC: number;
  lastStatusChange: string;
}

export interface FeederLog {
  id: string;
  feederId: string;
  feederName: string;
  feederHindiName: string;
  incomerId: IncomerId;
  incomerName: string;
  previousStatus: FeederStatus;
  newStatus: FeederStatus;
  durationSecondsInPreviousState: number;
  timestamp: string; // ISO string
  operatorName: string;
  reason?: string;
}

export interface FeederHourlyReading {
  feederId: string;
  feederName: string;
  feederHindiName: string;
  incomerId: IncomerId;
  status: FeederStatus;
  rAmp: number;
  yAmp: number;
  bAmp: number;
  avgAmp: number;
  voltageKv: number;
  powerMw: number;
}

export interface HourlySubstationLog {
  id: string;
  date: string;
  hour: number;
  hourLabel: string;
  recordedAt: string;
  operatorName: string;
  readings: Record<string, FeederHourlyReading>;
  incomer1Mw?: number;
  incomer2Mw?: number;
  totalSubstationMw?: number;
}

export type UserRole = 'operator' | 'officer';
export type Language = 'hi' | 'en';

export interface SubstationStats {
  totalFeeders: number;
  activeFeeders: number;
  inactiveFeeders: number;
  totalLoadMw: number;
  substationUptimePercentage: number;
  totalTrippingsToday: number;
}