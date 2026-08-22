import React, { useState, useEffect, useMemo } from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  Clock, Save, FileSpreadsheet, Copy, CheckCircle2, 
  AlertCircle, Layers, Calendar, Check, TrendingUp 
} from 'lucide-react';
import { FeederHourlyReading, HourlySubstationLog } from '../types/substation';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i + 1;
  const period = h === 24 ? 'AM' : h >= 12 ? 'PM' : 'AM';
  const displayHour = h > 12 && h < 24 ? h - 12 : (h === 24 ? 12 : h);
  const formatted24 = h.toString().padStart(2, '0') + ':00';
  return { hour: h, label: `${displayHour}:00 ${period} (${formatted24} बजे)`, formatted24 };
});
export const HourlyLoadSheet: React.FC = () => {
  const { 
    feeders, role, language, operatorName, hourlyLogs, saveHourlyLog, now 
  } = useSubstation();

  const currentRealHour = now.getHours() === 0 ? 24 : now.getHours();
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedHour, setSelectedHour] = useState<number>(currentRealHour);
  const [viewMode, setViewMode] = useState<'form' | 'table'>('form');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const [formReadings, setFormReadings] = useState<Record<string, { rAmp: number; yAmp: number; bAmp: number }>>({});

  const currentLogId = `hourly-${selectedDate}-${selectedHour}`;
  const existingLog = hourlyLogs[currentLogId];

  useEffect(() => {
    if (existingLog && existingLog.readings) {
      const initialMap: Record<string, { rAmp: number; yAmp: number; bAmp: number }> = {};
      feeders.forEach(f => {
        const r = existingLog.readings[f.id];
        if (r) {
          initialMap[f.id] = { rAmp: r.rAmp || 0, yAmp: r.yAmp || 0, bAmp: r.bAmp || 0 };
        } else {
          const defaultAmp = f.status === 'ON' ? f.currentAmp : 0;
          initialMap[f.id] = { rAmp: defaultAmp, yAmp: defaultAmp, bAmp: defaultAmp };
        }
      });
      setFormReadings(initialMap);
    } else {
      const initialMap: Record<string, { rAmp: number; yAmp: number; bAmp: number }> = {};
      feeders.forEach(f => {
        const defaultAmp = f.status === 'ON' ? (f.currentAmp || 60) : 0;
        initialMap[f.id] = { rAmp: defaultAmp, yAmp: defaultAmp, bAmp: defaultAmp };
      });
      setFormReadings(initialMap);
    }
  }, [selectedHour, selectedDate, existingLog, feeders]);

  const handleInputChange = (feederId: string, phase: 'rAmp' | 'yAmp' | 'bAmp', value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setFormReadings(prev => ({
      ...prev,
      [feederId]: { ...prev[feederId], [phase]: num }
    }));
  };

  const handleSetZero = (feederId: string) => {
    setFormReadings(prev => ({
      ...prev,
      [feederId]: { rAmp: 0, yAmp: 0, bAmp: 0 }
    }));
  };

  const handleCopyPreviousHour = () => {
    const prevHour = selectedHour === 1 ? 24 : selectedHour - 1;
    const prevLogId = `hourly-${selectedDate}-${prevHour}`;
    const prevLog = hourlyLogs[prevLogId];

    if (prevLog && prevLog.readings) {
      const copied: Record<string, { rAmp: number; yAmp: number; bAmp: number }> = {};
      feeders.forEach(f => {
        const r = prevLog.readings[f.id];
        if (r) copied[f.id] = { rAmp: r.rAmp, yAmp: r.yAmp, bAmp: r.bAmp };
      });
      setFormReadings(copied);
      alert(language === 'hi' ? `${prevHour}:00 बजे का लोड कॉपी कर लिया गया है!` : `Copied readings from ${prevHour}:00!`);
    } else {
      alert(language === 'hi' ? `पिछले घंटे (${prevHour}:00) का कोई लोड रिकॉर्ड नहीं मिला।` : `No records found for ${prevHour}:00.`);
    }
  };
  const handleSave = async () => {
    const finalReadings: Record<string, FeederHourlyReading> = {};
    let totalMw = 0;
    let inc1Mw = 0;
    let inc2Mw = 0;

    feeders.forEach(f => {
      const currentVals = formReadings[f.id] || { rAmp: 0, yAmp: 0, bAmp: 0 };
      const avgAmp = Math.round((currentVals.rAmp + currentVals.yAmp + currentVals.bAmp) / 3);
      const isStillOn = avgAmp > 0;
      const voltage = isStillOn ? 11.0 : 0;
      const mw = isStillOn ? +(avgAmp * 11.0 * 1.732 * 0.92 / 1000).toFixed(2) : 0;

      finalReadings[f.id] = {
        feederId: f.id,
        feederName: f.name,
        feederHindiName: f.hindiName,
        incomerId: f.incomerId,
        status: isStillOn ? 'ON' : 'OFF',
        rAmp: currentVals.rAmp,
        yAmp: currentVals.yAmp,
        bAmp: currentVals.bAmp,
        avgAmp,
        voltageKv: voltage,
        powerMw: mw
      };

      totalMw += mw;
      if (f.incomerId === 'inc-1') inc1Mw += mw;
      if (f.incomerId === 'inc-2') inc2Mw += mw;
    });

    const hourObj = HOURS.find(h => h.hour === selectedHour);
    const newLog: HourlySubstationLog = {
      id: currentLogId,
      date: selectedDate,
      hour: selectedHour,
      hourLabel: hourObj ? hourObj.label : `${selectedHour}:00`,
      recordedAt: new Date().toISOString(),
      operatorName: operatorName || 'ऑपरेटर (SSO)',
      readings: finalReadings,
      incomer1Mw: +inc1Mw.toFixed(2),
      incomer2Mw: +inc2Mw.toFixed(2),
      totalSubstationMw: +totalMw.toFixed(2)
    };

    await saveHourlyLog(newLog);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const exportToCSV = () => {
    const rows = [
      ['समय (Hour)', 'ऑपरेटर', ...feeders.map(f => `${f.hindiName} (R-Y-B Amp / MW)`), 'कुल लोड (MW)'].join(',')
    ];

    HOURS.forEach(h => {
      const logId = `hourly-${selectedDate}-${h.hour}`;
      const log = hourlyLogs[logId];
      if (log && log.readings) {
        const feederCols = feeders.map(f => {
          const r = log.readings[f.id];
          return r ? `"${r.rAmp}/${r.yAmp}/${r.bAmp} (${r.powerMw}MW)"` : '"-"';
        });
        rows.push([`"${h.formatted24}"`, `"${log.operatorName}"`, ...feederCols, `"${log.totalSubstationMw || 0} MW"`].join(','));
      }
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Substation_Arniya_Hourly_Load_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCalculatedMw = useMemo(() => {
    let sum = 0;
    feeders.forEach(f => {
      const vals = formReadings[f.id] || { rAmp: 0, yAmp: 0, bAmp: 0 };
      const avg = (vals.rAmp + vals.yAmp + vals.bAmp) / 3;
      if (avg > 0) sum += (avg * 11.0 * 1.732 * 0.92) / 1000;
    });
    return +sum.toFixed(2);
  }, [feeders, formReadings]);

  const inc1Feeders = feeders.filter(f => f.incomerId === 'inc-1');
  const inc2Feeders = feeders.filter(f => f.incomerId === 'inc-2');
  return (
    <div className="space-y-6">
      {/* Top Banner & Date Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white font-tech">
                {language === 'hi' ? 'प्रति घंटा फीडर लोड शीट (R-Y-B फेज)' : 'Hourly Feeder Load Sheet (R-Y-B Phase)'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'hi' 
                ? 'सबस्टेशन के सभी 8 फीडरों का घंटेवार R, Y, B करंट (Amp) दर्ज करें' 
                : 'Record and monitor hourly R-Y-B phase amperes for all 8 feeders with auto-calculated load (MW)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Calendar className="w-4 h-4 text-amber-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setViewMode('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'form' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'hi' ? '📝 लोड एंट्री फॉर्म' : '📝 Entry Form'}
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'hi' ? '📋 24 घंटे का रजिस्टर' : '📋 24h Register'}
              </button>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded-xl text-xs font-semibold transition shadow-sm"
              title="Download Excel / CSV Log Sheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'Excel शीट डाउनलोड' : 'Export Excel'}</span>
            </button>
          </div>
        </div>

        {/* 24-Hours Selector Pills */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <span>{language === 'hi' ? 'समय (घंटा) चुनें:' : 'Select Hour Slot:'}</span>
              <span className="text-amber-400 font-mono-scada font-semibold">
                {HOURS.find(h => h.hour === selectedHour)?.label}
              </span>
            </span>

            {existingLog ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {language === 'hi' ? 'इस घंटे का लोड दर्ज है' : 'Logged by ' + existingLog.operatorName}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
                <AlertCircle className="w-3 h-3 mr-1" />
                {language === 'hi' ? 'लोड भरना बाकी है' : 'Pending Entry'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
            {HOURS.map((h) => {
              const isSelected = selectedHour === h.hour;
              const isCurrent = currentRealHour === h.hour;
              const logId = `hourly-${selectedDate}-${h.hour}`;
              const hasData = !!hourlyLogs[logId];

              return (
                <button
                  key={h.hour}
                  onClick={() => setSelectedHour(h.hour)}
                  className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center border relative ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/20 scale-105 z-10'
                      : hasData
                      ? 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60'
                      : 'bg-slate-950/70 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-mono font-bold leading-none">{h.formatted24}</span>
                  <div className="flex items-center space-x-0.5 mt-1">
                    {hasData && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-emerald-400'}`} />}
                    {isCurrent && (
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${isSelected ? 'text-slate-900' : 'text-amber-400 animate-pulse'}`}>
                        NOW
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* VIEW MODE 1: ENTRY FORM */}
      {viewMode === 'form' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">{language === 'hi' ? 'कुल अनुमानित सबस्टेशन लोड' : 'Total Estimated Substation Load'}</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-white font-mono-scada">{totalCalculatedMw}</span>
                  <span className="text-xs text-amber-400 font-bold">MW (11kV Outgoing)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {role === 'operator' && (
                <button
                  onClick={handleCopyPreviousHour}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
                  title="Copy readings from previous hour"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'hi' ? 'पिछला लोड कॉपी करें' : 'Copy Previous'}</span>
                </button>
              )}

              {role === 'operator' && (
                <button
                  onClick={handleSave}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                    saveSuccess
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{language === 'hi' ? 'सफलतापूर्वक सेव हुआ!' : 'Saved Successfully!'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{language === 'hi' ? 'लोड सबमिट करें (Save)' : 'Submit Hourly Load'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* INCOMING 1 FEEDERS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  {language === 'hi' ? '1. इनकमिंग 1st (33kV इनकूमर-1) - 5 फीडर' : '1. Incoming 1st (33kV Incomer-1) - 5 Feeders'}
                </h3>
              </div>
              <span className="text-xs font-mono-scada text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                PTR-1 (10 MVA)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inc1Feeders.map(feeder => {
                const vals = formReadings[feeder.id] || { rAmp: 0, yAmp: 0, bAmp: 0 };
                const avgAmp = Math.round((vals.rAmp + vals.yAmp + vals.bAmp) / 3);
                const calcMw = +(avgAmp * 11.0 * 1.732 * 0.92 / 1000).toFixed(2);
                const isZero = vals.rAmp === 0 && vals.yAmp === 0 && vals.bAmp === 0;

                return (
                  <div key={feeder.id} className={`p-4 rounded-xl border transition ${isZero ? 'bg-slate-950/60 border-rose-900/40' : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{language === 'hi' ? feeder.hindiName : feeder.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">11kV • {feeder.category}</span>
                      </div>
                      {role === 'operator' && (
                        <button onClick={() => handleSetZero(feeder.id)} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition">
                          0 A (OFF)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-rose-400 flex items-center justify-center space-x-1 mb-1 bg-rose-950/40 py-0.5 rounded border border-rose-900/50">
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                          <span>R (लाल)</span>
                        </label>
                        <input type="number" min="0" max="600" disabled={role !== 'operator'} value={vals.rAmp} onChange={(e) => handleInputChange(feeder.id, 'rAmp', e.target.value)} className="w-full text-center bg-slate-900 border border-rose-500/40 focus:border-rose-400 rounded-lg py-1.5 text-sm font-mono-scada font-bold text-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:opacity-80" />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-amber-400 flex items-center justify-center space-x-1 mb-1 bg-amber-950/40 py-0.5 rounded border border-amber-900/50">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          <span>Y (पीला)</span>
                        </label>
                        <input type="number" min="0" max="600" disabled={role !== 'operator'} value={vals.yAmp} onChange={(e) => handleInputChange(feeder.id, 'yAmp', e.target.value)} className="w-full text-center bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-lg py-1.5 text-sm font-mono-scada font-bold text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-80" />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-sky-400 flex items-center justify-center space-x-1 mb-1 bg-sky-950/40 py-0.5 rounded border border-sky-900/50">
                          <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                          <span>B (नीला)</span>
                        </label>
                        <input type="number" min="0" max="600" disabled={role !== 'operator'} value={vals.bAmp} onChange={(e) => handleInputChange(feeder.id, 'bAmp', e.target.value)} className="w-full text-center bg-slate-900 border border-sky-500/40 focus:border-sky-400 rounded-lg py-1.5 text-sm font-mono-scada font-bold text-sky-200 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-80" />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono-scada">
                      <span className="text-slate-400">{language === 'hi' ? 'औसत करंट:' : 'Avg:'} <strong className="text-white">{avgAmp} A</strong></span>
                      <span className="text-amber-400 font-bold">{calcMw} MW</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INCOMING 2 FEEDERS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  {language === 'hi' ? '2. इनकमिंग 2nd (33kV इनकूमर-2) - 3 फीडर' : '2. Incoming 2nd (33kV Incomer-2) - 3 Feeders'}
                </h3>
              </div>
              <span className="text-xs font-mono-scada text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                PTR-2 (10 MVA)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inc2Feeders.map(feeder => {
                const vals = formReadings[feeder.id] || { rAmp: 0, yAmp: 0, bAmp: 0 };
                const avgAmp = Math.round((vals.rAmp + vals.yAmp + vals.bAmp) / 3);
                const calcMw = +(avgAmp * 11.0 * 1.732 * 0.92 / 1000).toFixed(2);
                const isZero = vals.rAmp === 0 && vals.yAmp === 0 && vals.bAmp === 0;

                return (
                  <div key={feeder.id} className={`p-4 rounded-xl border transition ${isZero ? 'bg-slate-950/60 border-rose-900/40' : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{language === 'hi' ? feeder.hindiName : feeder.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">11kV • {feeder.category}</span>
                      </div>
                      {role === 'operator' && (
                        <button onClick={() => handleSetZero(feeder.id)} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition">
                          0 A (OFF)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-rose-400 flex items-center justify-center space-x-1 mb-1 bg-rose-950/40 py-0.5 rounded border border-rose-900/50">
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                          <span>R (लाल)</span>
                        </label>
                        <input type="number" min="0" max="600" disabled={role !== 'operator'} value={vals.rAmp} onChange={(e) => handleInputChange(feeder.id, 'rAmp', e.target.value)} className="w-full text-center bg-slate-900 border border-rose-500/40 focus:border-rose-400 rounded-lg py-1.5 text-sm font-mono-scada font-bold text-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:opacity-80" />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-amber-400 flex items-center justify-center space-x-1 mb-1 bg-amber-950/40 py-0.5 rounded border border-amber-900/50">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          <span>Y (पीला)</span>
                        </label>
                        <input type="number" min="0" max="600" disabled={role !== 'operator'} value={vals.yAmp} onChange={(e) => handleInputChange(feeder.id, 'yAmp', e.target.value)} className="w-full text-center bg-slate-900 border border-amber-500/40 focus:border-amber-400 rounded-lg py-1.5 text-sm font-mono-scada font-bold text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-80" />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-sky-400 flex items-center justify-center space-x-1 mb-1 bg-sky-950/40 py-0.5 rounded border border-sky-900/50">
                          <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                          <span>B (नीला)</span>
                        </label>
                        <input type="number" min="0" max="600" disabled={role !== 'operator'} value={vals.bAmp} onChange={(e) => handleInputChange(feeder.id, 'bAmp', e.target.value)} className="w-full text-center bg-slate-900 border border-sky-500/40 focus:border-sky-400 rounded-lg py-1.5 text-sm font-mono-scada font-bold text-sky-200 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-80" />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono-scada">
                      <span className="text-slate-400">{language === 'hi' ? 'औसत करंट:' : 'Avg:'} <strong className="text-white">{avgAmp} A</strong></span>
                      <span className="text-amber-400 font-bold">{calcMw} MW</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: TABLE */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>{language === 'hi' ? `24 घंटे का संपूर्ण लोड रजिस्टर (${selectedDate})` : `Complete 24-Hour Load Register (${selectedDate})`}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hi' ? 'हर घंटे के R/Y/B फेज करंट (Amp) और कुल लोड का ब्यौरा' : 'Hourly logs of phase currents and total substation load'}
              </p>
            </div>
            <button onClick={exportToCSV} className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-xl text-xs font-semibold transition">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'CSV डाउनलोड' : 'Export CSV'}</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300 font-mono-scada">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">समय (Time)</th>
                  <th className="py-3 px-3">ऑपरेटर</th>
                  {feeders.map(f => (
                    <th key={f.id} className="py-3 px-3 whitespace-nowrap">{f.hindiName.replace(' फीडर', '')}</th>
                  ))}
                  <th className="py-3 px-3 text-amber-400 font-bold whitespace-nowrap">कुल लोड (MW)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {HOURS.map(h => {
                  const logId = `hourly-${selectedDate}-${h.hour}`;
                  const log = hourlyLogs[logId];
                  const isCurrent = currentRealHour === h.hour;

                  return (
                    <tr key={h.hour} className={`hover:bg-slate-800/40 transition ${isCurrent ? 'bg-amber-500/10' : log ? '' : 'opacity-60'}`}>
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span>{h.formatted24}</span>
                          {isCurrent && <span className="px-1.5 py-0.2 text-[9px] rounded bg-amber-400 text-slate-950 font-bold">NOW</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">{log ? log.operatorName : '-'}</td>
                      {feeders.map(f => {
                        const reading = log?.readings?.[f.id];
                        if (!reading) return <td key={f.id} className="py-2.5 px-3 text-slate-600">-</td>;
                        if (reading.rAmp === 0 && reading.yAmp === 0 && reading.bAmp === 0) {
                          return <td key={f.id} className="py-2.5 px-3 text-rose-400 whitespace-nowrap"><span className="px-1.5 py-0.5 rounded bg-rose-950 text-[10px] font-bold">OFF</span></td>;
                        }
                        return (
                          <td key={f.id} className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-rose-300 font-bold">{reading.rAmp}</span>/
                            <span className="text-amber-300 font-bold">{reading.yAmp}</span>/
                            <span className="text-sky-300 font-bold">{reading.bAmp}</span>
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 font-bold text-amber-400 whitespace-nowrap">{log ? `${log.totalSubstationMw || 0} MW` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};