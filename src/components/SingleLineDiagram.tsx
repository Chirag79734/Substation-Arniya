import React from 'react';
import { useSubstation } from '../context/SubstationContext';
import { Zap, CheckCircle2, XCircle } from 'lucide-react';

export const SingleLineDiagram: React.FC = () => {
  const { incomers, feeders, role, language, toggleFeeder } = useSubstation();

  const inc1 = incomers.find(i => i.id === 'inc-1');
  const inc2 = incomers.find(i => i.id === 'inc-2');

  const inc1Feeders = feeders.filter(f => f.incomerId === 'inc-1');
  const inc2Feeders = feeders.filter(f => f.incomerId === 'inc-2');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-tech flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>
              {language === 'hi'
                ? 'सबस्टेशन अरनिया - सिंगल लाइन डायग्राम (SLD)'
                : 'Substation Arniya - Single Line Diagram (SLD)'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? '33kV ग्रिड सप्लाई -> 10MVA ट्रांसफार्मर -> 11kV बस -> 8 आउटगोइंग फीडर पावर फ्लो'
              : '33kV Grid Supply -> 10MVA PTR -> 11kV Bus -> 8 Outgoing Distribution Feeders'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-slate-300">{language === 'hi' ? 'चार्ज / चालू (ON)' : 'Energized (ON)'}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="text-slate-300">{language === 'hi' ? 'बंद / ट्रिप्ड (OFF)' : 'De-energized (OFF)'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BUS 1 */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 relative">
          <div className="flex flex-col items-center">
            <div className="px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-300 text-xs font-bold font-mono-scada">
              33kV INCOMING GRID LINE - 1
            </div>
            <div className={`w-1 h-6 ${inc1?.status === 'ON' ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-slate-700'}`} />
            
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center shadow-md w-48">
              <span className="text-xs font-bold text-white block">PTR - 1 (10 MVA)</span>
              <span className="text-[10px] text-slate-400 font-mono">33kV / 11kV Dyn11</span>
              <div className="mt-1 flex justify-center space-x-2 text-[10px] font-mono-scada">
                <span className="text-amber-400">{inc1?.voltageKv || 0} kV</span>
                <span className="text-emerald-400">{inc1?.oilTempC}°C</span>
              </div>
            </div>

            <div className={`w-1 h-6 ${inc1?.status === 'ON' ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-slate-700'}`} />
          </div>

          <div className="my-2">
            <div className="w-full h-2.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 rounded shadow-md relative">
              <span className="absolute -top-4 left-2 text-[10px] font-bold text-emerald-400 font-mono-scada">
                11kV BUS-1 (5 FEEDERS)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-6">
            {inc1Feeders.map((feeder) => {
              const isOn = feeder.status === 'ON';
              return (
                <div key={feeder.id} className="flex flex-col items-center">
                  <div className={`w-1 h-4 ${isOn ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  
                  <div 
                    onClick={() => role === 'operator' && toggleFeeder(feeder.id)}
                    className={`w-full p-2.5 rounded-xl border text-center transition ${
                      role === 'operator' ? 'cursor-pointer hover:scale-105 shadow-lg' : ''
                    } ${
                      isOn 
                        ? 'bg-slate-900 border-emerald-500/60 shadow-emerald-950/50' 
                        : 'bg-slate-900 border-rose-500/60 shadow-rose-950/50'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {isOn ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white block leading-tight">
                      {language === 'hi' ? feeder.hindiName.replace(' फीडर', '') : feeder.name.replace(' Feeder', '')}
                    </span>
                    <span className={`text-[10px] font-mono-scada font-bold block mt-1 ${isOn ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isOn ? `${feeder.currentAmp} A` : 'OPEN'}
                    </span>
                    {role === 'operator' && (
                      <span className="text-[9px] text-amber-400 block mt-1">
                        {isOn ? 'Click to OFF' : 'Click to ON'}
                      </span>
                    )}
                  </div>
                  
                  <div className={`w-1 h-4 ${isOn ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <span className="text-[9px] text-slate-500 font-mono">11kV Line</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BUS 2 */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 relative">
          <div className="flex flex-col items-center">
            <div className="px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-300 text-xs font-bold font-mono-scada">
              33kV INCOMING GRID LINE - 2
            </div>
            <div className={`w-1 h-6 ${inc2?.status === 'ON' ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-slate-700'}`} />
            
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center shadow-md w-48">
              <span className="text-xs font-bold text-white block">PTR - 2 (10 MVA)</span>
              <span className="text-[10px] text-slate-400 font-mono">33kV / 11kV Dyn11</span>
              <div className="mt-1 flex justify-center space-x-2 text-[10px] font-mono-scada">
                <span className="text-amber-400">{inc2?.voltageKv || 0} kV</span>
                <span className="text-emerald-400">{inc2?.oilTempC}°C</span>
              </div>
            </div>

            <div className={`w-1 h-6 ${inc2?.status === 'ON' ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-slate-700'}`} />
          </div>

          <div className="my-2">
            <div className="w-full h-2.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 rounded shadow-md relative">
              <span className="absolute -top-4 left-2 text-[10px] font-bold text-emerald-400 font-mono-scada">
                11kV BUS-2 (3 FEEDERS)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            {inc2Feeders.map((feeder) => {
              const isOn = feeder.status === 'ON';
              return (
                <div key={feeder.id} className="flex flex-col items-center">
                  <div className={`w-1 h-4 ${isOn ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  
                  <div 
                    onClick={() => role === 'operator' && toggleFeeder(feeder.id)}
                    className={`w-full p-3 rounded-xl border text-center transition ${
                      role === 'operator' ? 'cursor-pointer hover:scale-105 shadow-lg' : ''
                    } ${
                      isOn 
                        ? 'bg-slate-900 border-emerald-500/60 shadow-emerald-950/50' 
                        : 'bg-slate-900 border-rose-500/60 shadow-rose-950/50'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {isOn ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {language === 'hi' ? feeder.hindiName : feeder.name}
                    </span>
                    <span className={`text-[10px] font-mono-scada font-bold block mt-1 ${isOn ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isOn ? `${feeder.currentAmp} A • ${feeder.powerMw} MW` : 'OPEN'}
                    </span>
                    {role === 'operator' && (
                      <span className="text-[9px] text-amber-400 block mt-1">
                        {isOn ? 'Click to OFF' : 'Click to ON'}
                      </span>
                    )}
                  </div>
                  
                  <div className={`w-1 h-4 ${isOn ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <span className="text-[9px] text-slate-500 font-mono">11kV Line</span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};