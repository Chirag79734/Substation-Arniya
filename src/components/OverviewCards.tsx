import React from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  Activity, 
  AlertOctagon, 
  TrendingUp, 
  Gauge, 
  ShieldAlert, 
  Clock
} from 'lucide-react';

export const OverviewCards: React.FC = () => {
  const { stats, feeders, language, now, activeHourlyLogTimeLabel } = useSubstation();

  let totalUpSeconds = 0;
  feeders.forEach(f => {
    const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(f.lastStatusChange).getTime()) / 1000));
    totalUpSeconds += f.status === 'ON' ? (f.totalUptimeSecondsToday + elapsed) : f.totalUptimeSecondsToday;
  });

  const totalUpHours = (totalUpSeconds / 3600).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-5 rounded-2xl border border-emerald-500/30 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            {language === 'hi' ? 'चालू फीडर (सक्रिय)' : 'Active Feeders (Running)'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-bold text-white font-mono-scada">
            {stats.activeFeeders}
          </span>
          <span className="text-sm font-semibold text-slate-400">
            / {stats.totalFeeders} {language === 'hi' ? 'कुल' : 'Total'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mr-2">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(stats.activeFeeders / stats.totalFeeders) * 100}%` }}
            />
          </div>
          <span className="text-emerald-400 font-mono-scada font-bold">
            {Math.round((stats.activeFeeders / stats.totalFeeders) * 100)}%
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 p-5 rounded-2xl border border-rose-500/30 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
            {language === 'hi' ? 'बंद फीडर (आउटेज/रोस्टरिंग)' : 'Offline Feeders (Outage)'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-bold text-white font-mono-scada">
            {stats.inactiveFeeders}
          </span>
          <span className="text-xs font-medium text-rose-400/80">
            {stats.inactiveFeeders === 0 ? (language === 'hi' ? 'सभी फीडर चालू हैं' : 'All feeders ON') : (language === 'hi' ? 'लाइन बंद है' : 'Lines shutdown')}
          </span>
        </div>
        <div className="mt-3 flex items-center text-xs text-slate-400 space-x-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {language === 'hi' ? 'आज कुल ट्रिपिंग:' : 'Trippings today:'} <strong className="text-amber-300 font-mono-scada">{stats.totalTrippingsToday}</strong>
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-5 rounded-2xl border border-amber-500/30 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            {language === 'hi' ? 'कुल सबस्टेशन लोड' : 'Total Substation Load'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Gauge className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-bold text-white font-mono-scada">
            {stats.totalLoadMw}
          </span>
          <span className="text-sm font-semibold text-amber-400">MW</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-amber-300/90 font-medium">🕒 {activeHourlyLogTimeLabel}</span>
          <span className="text-amber-300 font-mono-scada">~{((stats.totalLoadMw / 16) * 100).toFixed(0)}% Load</span>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-5 rounded-2xl border border-cyan-500/30 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            {language === 'hi' ? 'उपलब्धता (Uptime Rate)' : 'Substation Availability'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-bold text-white font-mono-scada">
            {stats.substationUptimePercentage}%
          </span>
        </div>
        <div className="mt-3 flex items-center text-xs text-slate-400 space-x-1">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {language === 'hi' ? 'संचयी आपूर्ति समय:' : 'Cumulative Supply:'} <strong className="text-cyan-300 font-mono-scada">{totalUpHours} hrs</strong>
          </span>
        </div>
      </div>

    </div>
  );
};