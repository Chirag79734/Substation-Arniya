import React, { useState } from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  Zap, 
  ShieldAlert
} from 'lucide-react';
import { Supply33KvModal } from './Supply33KvModal';

export const Supply33KvBanner: React.FC = () => {
  const { 
    is33KvHealthy, 
    incomers, 
    role, 
    language 
  } = useSubstation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActionFailing, setModalActionFailing] = useState(true);

  const avgVoltage = incomers.length > 0 
    ? (incomers.reduce((sum, i) => sum + i.voltageKv, 0) / incomers.length).toFixed(1)
    : '0.0';

  const handleFailClick = () => {
    if (role !== 'operator') return;
    setModalActionFailing(true);
    setIsModalOpen(true);
  };

  const handleRestoreClick = () => {
    if (role !== 'operator') return;
    setModalActionFailing(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`mb-6 p-4 sm:p-5 rounded-3xl border transition-all duration-300 shadow-xl relative overflow-hidden ${
        is33KvHealthy
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/40 shadow-emerald-950/20'
          : 'bg-gradient-to-r from-slate-900 via-rose-950/50 to-slate-900 border-rose-500/60 shadow-rose-950/40 animate-pulse'
      }`}>
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-full pointer-events-none opacity-20">
          <div className={`w-full h-full rounded-full blur-3xl ${is33KvHealthy ? 'bg-emerald-500' : 'bg-rose-600'}`} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Status Label & Details */}
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
              is33KvHealthy
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/30 text-rose-300 border border-rose-500/60 animate-bounce'
            }`}>
              {is33KvHealthy ? <Zap className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-tech flex items-center gap-2">
                  <span>{language === 'hi' ? '33 KV मेन ग्रिड आपूर्ति' : '33 KV Main Grid Supply'}</span>
                </h2>
                
                <span className={`inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold ${
                  is33KvHealthy
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60'
                    : 'bg-rose-950/90 text-rose-200 border border-rose-500/80 animate-pulse'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${is33KvHealthy ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'}`} />
                  <span>
                    {is33KvHealthy 
                      ? (language === 'hi' ? 'सामान्य / उपलब्ध (33kV CHARGED)' : 'HEALTHY / CHARGED')
                      : (language === 'hi' ? 'सप्लाई फेल / ब्लैकआउट (0 kV OUTAGE)' : '33kV FAILED / BLACKOUT')}
                  </span>
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                <span>
                  {is33KvHealthy
                    ? (language === 'hi' 
                        ? `33kV बसबार वोल्टेज: ${avgVoltage} kV • दोनों इनकमर सक्रिय` 
                        : `33kV Bus Voltage: ${avgVoltage} kV • Both Incomers Active`)
                    : (language === 'hi'
                        ? '33 KV मेन ग्रिड आपूर्ति बंद होने से सभी 8 फीडर स्वतः बंद (OFF) हैं।'
                        : 'Main 33kV Grid Outage - All 8 feeders switched OFF.')}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons for Operator */}
          <div className="flex items-center space-x-3">
            {role === 'operator' ? (
              is33KvHealthy ? (
                <button
                  onClick={handleFailClick}
                  className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-2xl border border-rose-500/60 shadow-lg shadow-rose-600/30 transition transform active:scale-95 cursor-pointer"
                  title="Trigger 33 KV Supply Failure (Turns OFF all feeders)"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{language === 'hi' ? '⚠️ 33 KV सप्लाई फेल करें' : '⚠️ 33 KV Supply Fail'}</span>
                </button>
              ) : (
                <button
                  onClick={handleRestoreClick}
                  className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs sm:text-sm font-extrabold rounded-2xl border border-emerald-400 shadow-lg shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer"
                  title="Restore 33 KV Supply (Feeders will remain OFF for safe manual charging)"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{language === 'hi' ? '⚡ 33 KV सप्लाई बहाल / चार्ज करें' : '⚡ Restore 33 KV Supply'}</span>
                </button>
              )
            ) : (
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span>{language === 'hi' ? '👁️ केवल अवलोकन (View Only)' : '👁️ View Only Mode'}</span>
              </div>
            )}
          </div>

        </div>

      </div>

      <Supply33KvModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isFailing={modalActionFailing}
      />
    </>
  );
};