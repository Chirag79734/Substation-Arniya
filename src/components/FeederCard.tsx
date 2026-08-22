import React, { useState } from 'react';
import { Feeder } from '../types/substation';
import { useSubstation } from '../context/SubstationContext';
import { 
  Power, 
  Clock, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { formatDuration, formatShortDuration, formatTime } from '../utils/formatters';
import { ActionModal } from './ActionModal';

interface FeederCardProps {
  feeder: Feeder;
}

export const FeederCard: React.FC<FeederCardProps> = ({ feeder }) => {
  const { role, language, toggleFeeder, tripFeeder, now } = useSubstation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isRunning = feeder.status === 'ON';
  const isTripped = feeder.status === 'TRIPPED';

  const elapsedSec = Math.max(0, Math.floor((now.getTime() - new Date(feeder.lastStatusChange).getTime()) / 1000));
  
  const totalUptimeSec = isRunning ? feeder.totalUptimeSecondsToday + elapsedSec : feeder.totalUptimeSecondsToday;
  const totalDowntimeSec = !isRunning ? feeder.totalDowntimeSecondsToday + elapsedSec : feeder.totalDowntimeSecondsToday;
  const totalTrackedSec = totalUptimeSec + totalDowntimeSec;
  const uptimePercent = totalTrackedSec > 0 ? Math.round((totalUptimeSec / totalTrackedSec) * 100) : 100;

  const handleToggleClick = () => {
    if (role !== 'operator') return;
    setIsModalOpen(true);
  };

  const handleConfirmToggle = (reason: string) => {
    toggleFeeder(feeder.id, reason);
    setIsModalOpen(false);
  };

  const handleTripClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(language === 'hi' ? `${feeder.hindiName} को आपातकालीन ट्रिप (Trip) करें?` : `Trigger Emergency Trip on ${feeder.name}?`)) {
      tripFeeder(feeder.id, 'आपातकालीन / ओवरकरंट रिले ट्रिप');
    }
  };

  return (
    <>
      <div 
        className={`relative rounded-2xl border transition-all duration-300 overflow-hidden shadow-md ${
          isRunning 
            ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-500/80 hover:shadow-emerald-950/40' 
            : isTripped
            ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-500/80 hover:shadow-amber-950/40'
            : 'bg-slate-900/80 border-rose-500/30 hover:border-rose-500/70 hover:shadow-rose-950/40'
        }`}
      >
        <div className={`h-1.5 w-full ${
          isRunning ? 'bg-emerald-500 glow-active' : isTripped ? 'bg-amber-500' : 'bg-rose-500'
        }`} />

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {language === 'hi' ? feeder.hindiName : feeder.name}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  11 kV
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hi' ? feeder.name : feeder.hindiName} • <span className="text-slate-500">{feeder.category}</span>
              </p>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-sm ${
              isRunning
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                : isTripped
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 animate-pulse'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
            }`}>
              {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />}
              {isRunning ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'hi' ? 'सप्लाई चालू (ON)' : 'RUNNING (ON)'}</span>
                </>
              ) : isTripped ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'hi' ? 'ट्रिप्ड (TRIPPED)' : 'TRIPPED'}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'hi' ? 'बंद (OFF)' : 'SHUTDOWN (OFF)'}</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isRunning 
                    ? (language === 'hi' ? 'वर्तमान में चल रहा है:' : 'Currently Running for:')
                    : (language === 'hi' ? 'वर्तमान में बंद है:' : 'Currently Stopped since:')}
                </span>
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'hi' ? 'पिछला बदलाव:' : 'Since:'} {formatTime(feeder.lastStatusChange)}
              </span>
            </div>

            <div className="mt-1.5 flex items-baseline justify-between">
              <span className={`text-xl sm:text-2xl font-bold font-mono-scada tracking-wider ${
                isRunning ? 'text-emerald-400' : isTripped ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {formatShortDuration(elapsedSec)}
              </span>
              <span className="text-xs text-slate-400">
                {formatDuration(elapsedSec, language)}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-scada">
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'hi' ? 'आज चला:' : 'Uptime:'} {formatDuration(totalUptimeSec, language)}</span>
              </span>
              <span className="text-rose-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>{language === 'hi' ? 'आज बंद:' : 'Downtime:'} {formatDuration(totalDowntimeSec, language)}</span>
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${uptimePercent}%` }}
                title={`Uptime: ${uptimePercent}%`}
              />
              <div 
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${100 - uptimePercent}%` }}
                title={`Downtime: ${100 - uptimePercent}%`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {language === 'hi' ? 'वोल्टेज' : 'Voltage'}
              </span>
              <span className="text-sm font-bold text-white font-mono-scada">
                {feeder.voltageKv} <span className="text-[10px] text-slate-400">kV</span>
              </span>
            </div>

            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {language === 'hi' ? 'करंट' : 'Current'}
              </span>
              <span className="text-sm font-bold text-white font-mono-scada">
                {feeder.currentAmp} <span className="text-[10px] text-slate-400">A</span>
              </span>
            </div>

            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {language === 'hi' ? 'लोड' : 'Power Load'}
              </span>
              <span className="text-sm font-bold text-amber-400 font-mono-scada">
                {feeder.powerMw} <span className="text-[10px] text-slate-400">MW</span>
              </span>
            </div>
          </div>

          {/* R-Y-B Phase Current Display */}
          <div className="mt-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono-scada">
            <span className="text-slate-400 font-sans font-medium text-[10px]">{language === 'hi' ? 'फेज करंट:' : 'Phase Current:'}</span>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-rose-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                <span>R: {feeder.rAmp !== undefined ? feeder.rAmp : (isRunning ? Math.round(feeder.currentAmp * 1.02) : 0)}A</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                <span>Y: {feeder.yAmp !== undefined ? feeder.yAmp : (isRunning ? Math.round(feeder.currentAmp * 0.98) : 0)}A</span>
              </span>
              <span className="flex items-center space-x-1 text-sky-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
                <span>B: {feeder.bAmp !== undefined ? feeder.bAmp : (isRunning ? feeder.currentAmp : 0)}A</span>
              </span>
            </div>
          </div>

          {feeder.remarks && (
            <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-slate-400 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Info className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
              <span className="truncate" title={feeder.remarks}>
                <strong className="text-slate-300">{language === 'hi' ? 'रिमार्क:' : 'Note:'}</strong> {feeder.remarks}
              </span>
            </div>
          )}

          {role === 'operator' ? (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
              <button
                onClick={handleToggleClick}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition shadow-lg ${
                  isRunning
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>
                  {isRunning
                    ? (language === 'hi' ? 'फीडर बंद करें (OFF)' : 'SWITCH OFF FEEDER')
                    : (language === 'hi' ? 'फीडर चालू करें (ON)' : 'SWITCH ON FEEDER')}
                </span>
              </button>

              {isRunning && (
                <button
                  onClick={handleTripClick}
                  className="px-3 py-2.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 hover:text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold transition"
                  title={language === 'hi' ? 'ट्रिप सिमुलेशन' : 'Trip Relay Simulation'}
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <span className="text-[11px] text-indigo-300/80 font-medium flex items-center justify-center space-x-1">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span>{language === 'hi' ? 'अधिकारी मॉनिटरिंग स्ट्रीम (लाइव अपडेट)' : 'Officer Monitoring Stream (Live)'}</span>
              </span>
            </div>
          )}

        </div>
      </div>

      <ActionModal
        feeder={feeder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmToggle}
        language={language}
      />
    </>
  );
};