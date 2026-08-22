import React from 'react';
import { IncomerId } from '../types/substation';
import { useSubstation } from '../context/SubstationContext';
import { FeederCard } from './FeederCard';
import { Layers, Thermometer, Power } from 'lucide-react';

interface IncomerSectionProps {
  incomerId: IncomerId;
}

export const IncomerSection: React.FC<IncomerSectionProps> = ({ incomerId }) => {
  const { incomers, feeders, role, language, toggleIncomer } = useSubstation();

  const incomer = incomers.find(i => i.id === incomerId);
  const incomerFeeders = feeders.filter(f => f.incomerId === incomerId);

  if (!incomer) return null;

  const isIncOn = incomer.status === 'ON';
  const activeCount = incomerFeeders.filter(f => f.status === 'ON').length;
  const totalLoad = incomerFeeders
    .filter(f => f.status === 'ON')
    .reduce((sum, f) => sum + f.powerMw, 0)
    .toFixed(2);

  return (
    <div className="space-y-4 mb-8">
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
        isIncOn 
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/30'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border-rose-500/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
              isIncOn 
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20' 
                : 'bg-rose-700 shadow-rose-700/20'
            }`}>
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-tech">
                  {language === 'hi' ? incomer.hindiName : incomer.name}
                </h2>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  isIncOn 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {isIncOn ? '33kV CHARGED' : '33kV OUTAGE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'hi' 
                  ? `ट्रांसफार्मर क्षमता: ${incomer.transformerMva} MVA • कुल फीडर: ${incomerFeeders.length} (${activeCount} चालू)` 
                  : `Transformer Capacity: ${incomer.transformerMva} MVA • Total Feeders: ${incomerFeeders.length} (${activeCount} Active)`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">33kV Voltage</span>
              <span className="text-sm font-bold text-amber-400 font-mono-scada">
                {incomer.voltageKv} <span className="text-[10px] text-slate-400">kV</span>
              </span>
            </div>

            <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Total Incomer Load</span>
              <span className="text-sm font-bold text-white font-mono-scada">
                {totalLoad} <span className="text-[10px] text-amber-400">MW</span>
              </span>
            </div>

            <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-1.5">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block uppercase">Oil / Winding Temp</span>
                <span className="text-xs font-bold text-slate-200 font-mono-scada">
                  {incomer.oilTempC}°C / {incomer.windingTempC}°C
                </span>
              </div>
            </div>

            {role === 'operator' && (
              <button
                onClick={() => {
                  if (window.confirm(language === 'hi' ? `क्या आप ${incomer.hindiName} मेन 33kV ब्रेकर को बदलना चाहते हैं?` : `Toggle 33kV Master Breaker for ${incomer.name}?`)) {
                    toggleIncomer(incomer.id);
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow ${
                  isIncOn 
                    ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700' 
                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700'
                }`}
                title="Toggle Main Incomer Breaker"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isIncOn ? '33kV Breaker Trip' : '33kV Breaker Close'}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incomerFeeders.map(feeder => (
          <FeederCard key={feeder.id} feeder={feeder} />
        ))}
      </div>
    </div>
  );
};