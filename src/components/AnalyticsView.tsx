import React from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Clock, ShieldCheck } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const { feeders, language, now } = useSubstation();

  // Prepare chart data
  const chartData = feeders.map(f => {
    const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(f.lastStatusChange).getTime()) / 1000));
    const upSec = f.status === 'ON' ? f.totalUptimeSecondsToday + elapsed : f.totalUptimeSecondsToday;
    const downSec = f.status !== 'ON' ? f.totalDowntimeSecondsToday + elapsed : f.totalDowntimeSecondsToday;
    const totalSec = upSec + downSec;
    const uptimePercent = totalSec > 0 ? +((upSec / totalSec) * 100).toFixed(1) : 100;

    return {
      name: language === 'hi' ? f.hindiName.replace(' ????', '') : f.name.replace(' Feeder', ''),
      fullName: language === 'hi' ? f.hindiName : f.name,
      uptimeHours: +(upSec / 3600).toFixed(2),
      downtimeHours: +(downSec / 3600).toFixed(2),
      uptimePercent,
      loadMw: f.status === 'ON' ? f.powerMw : 0,
      currentAmp: f.status === 'ON' ? f.currentAmp : 0,
      status: f.status,
      tripCount: f.tripCountToday,
      upSec,
      downSec
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-tech flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span>
                {language === 'hi'
                  ? '???? ?????? ? ???????? ???????? (Officer Analytics)'
                  : 'Feeder Runtime & Performance Analytics'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'hi'
                ? '??? 8 ?????? ?? ?? ?? ??? ???? ?? ??? ???? ?? ????? ?? ????????? ?????'
                : 'Comparative report of uptime hours, downtime hours and load across all 8 feeders'}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Uptime vs Downtime Chart */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? '?? ???? vs ??? ???? ?? ???? (Hours)' : 'Today Uptime vs Downtime (Hours)'}</span>
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={11} 
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#64748b" fontSize={11} unit="h" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="uptimeHours" name={language === 'hi' ? '???? ??? (Uptime Hrs)' : 'Uptime (Hrs)'} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="downtimeHours" name={language === 'hi' ? '??? ??? (Downtime Hrs)' : 'Downtime (Hrs)'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Active Load Chart */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? '??????? ???? ??? ????? (Active Load in MW)' : 'Feeder Power Load Distribution (MW)'}</span>
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={11} 
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#64748b" fontSize={11} unit="MW" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="loadMw" name={language === 'hi' ? '??? (MW)' : 'Power (MW)'} fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'ON' ? '#f59e0b' : '#475569'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Detailed Performance & Reliability Table */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>{language === 'hi' ? '????? ???? ???????? ? ??????????? ???????' : 'Overall Feeder Availability & Reliability Index'}</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{language === 'hi' ? '???? ?? ???' : 'Feeder Name'}</th>
                  <th className="py-3 px-4">{language === 'hi' ? '??????? ??????' : 'Current Status'}</th>
                  <th className="py-3 px-4">{language === 'hi' ? '??? ???? ??? (Today)' : 'Total Uptime'}</th>
                  <th className="py-3 px-4">{language === 'hi' ? '??? ??? ??? (Today)' : 'Total Downtime'}</th>
                  <th className="py-3 px-4">{language === 'hi' ? '???????? %' : 'Availability %'}</th>
                  <th className="py-3 px-4">{language === 'hi' ? '???????? ??????' : 'Trip Count'}</th>
                  <th className="py-3 px-4">{language === 'hi' ? '??????' : 'Status Score'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {chartData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {item.fullName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        item.status === 'ON'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {item.status === 'ON' ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-mono-scada whitespace-nowrap">
                      {formatDuration(item.upSec, language)}
                    </td>
                    <td className="py-3 px-4 text-rose-400 font-mono-scada whitespace-nowrap">
                      {formatDuration(item.downSec, language)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-mono-scada">{item.uptimePercent}%</span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.uptimePercent >= 90 ? 'bg-emerald-500' : item.uptimePercent >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${item.uptimePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-scada whitespace-nowrap">
                      <span className={item.tripCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        {item.tripCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.uptimePercent >= 90 
                          ? 'bg-emerald-900/60 text-emerald-200' 
                          : item.uptimePercent >= 75 
                          ? 'bg-amber-900/60 text-amber-200' 
                          : 'bg-rose-900/60 text-rose-200'
                      }`}>
                        {item.uptimePercent >= 90 ? 'EXCELLENT' : item.uptimePercent >= 75 ? 'GOOD' : 'ATTENTION'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
