import React, { useState, useEffect } from 'react';
import { Feeder, Language } from '../types/substation';
import { Power, X, Check, Clock, User } from 'lucide-react';
import { useSubstation } from '../context/SubstationContext';

interface ActionModalProps {
  feeder: Feeder;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, operationTimeIso?: string) => void;
  language: Language;
}

const COMMON_REASONS_HI = [
  'नियमित रोस्टरिंग / लोड कटौती',
  'लाइनमैन अनुरोध पर मेंटेनेंस / काम',
  'परमिट टू वर्क (PTW) / शटडाउन',
  'मरम्मत / जम्पर सुधार / इंसुलेटर कार्य',
  'पेड़ों की छंटाई (Tree Trimming)',
  'सामान्य आपूर्ति चालू / चार्ज किया गया'
];

const COMMON_REASONS_EN = [
  'Scheduled Rostering / Load Shedding',
  'Lineman Maintenance Request',
  'Permit To Work (PTW) / Shutdown',
  'Emergency Repair / Jumper Fix',
  'Tree Trimming / Clearance',
  'Normal Charging / Supply Restored'
];

export const ActionModal: React.FC<ActionModalProps> = ({
  feeder,
  isOpen,
  onClose,
  onConfirm,
  language
}) => {
  const { operatorName } = useSubstation();
  const isTurningOff = feeder.status === 'ON';
  
  const defaultReason = isTurningOff
    ? (language === 'hi' ? 'नियमित रोस्टरिंग' : 'Scheduled Rostering')
    : (language === 'hi' ? 'सामान्य आपूर्ति चालू' : 'Normal Supply Restored');

  const [selectedReason, setSelectedReason] = useState(defaultReason);
  const [customRemark, setCustomRemark] = useState('');
  
  // Time input (HH:MM)
  const [timeString, setTimeString] = useState<string>(() => {
    const d = new Date();
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  });

  useEffect(() => {
    if (isOpen) {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      setTimeString(`${hh}:${mm}`);
      setSelectedReason(
        isTurningOff
          ? (language === 'hi' ? 'नियमित रोस्टरिंग' : 'Scheduled Rostering')
          : (language === 'hi' ? 'सामान्य आपूर्ति चालू' : 'Normal Supply Restored')
      );
      setCustomRemark('');
    }
  }, [isOpen, isTurningOff, language]);

  if (!isOpen) return null;

  const quickReasons = language === 'hi' ? COMMON_REASONS_HI : COMMON_REASONS_EN;

  const setNowTime = () => {
    const d = new Date();
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    setTimeString(`${hh}:${mm}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customRemark.trim() ? `${selectedReason} - ${customRemark.trim()}` : selectedReason;
    
    // Construct ISO string from selected time for today
    let operationIso = new Date().toISOString();
    if (timeString && timeString.includes(':')) {
      const [h, m] = timeString.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(h, m, 0, 0);
      operationIso = targetDate.toISOString();
    }

    onConfirm(finalReason, operationIso);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5 border-b border-slate-800 pb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
            isTurningOff 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/10' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10'
          }`}>
            <Power className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-tech">
              {language === 'hi'
                ? `${feeder.hindiName} को ${isTurningOff ? 'बंद (OFF)' : 'चालू (ON)'} करें`
                : `Switch ${isTurningOff ? 'OFF' : 'ON'} ${feeder.name}`}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? 'समय और कारण दर्ज करके स्विचिंग की पुष्टि करें' : 'Confirm switching operation with time and reason'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. TIMING CHECK (समय पुष्टि) */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{isTurningOff ? (language === 'hi' ? 'फीडर बंद करने का समय:' : 'Time of Shutdown:') : (language === 'hi' ? 'फीडर चालू करने का समय:' : 'Time of Charging:')}</span>
              </label>
              <button
                type="button"
                onClick={setNowTime}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/80 transition"
              >
                {language === 'hi' ? 'अभी का समय (Current Time)' : 'Set Now'}
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="time"
                required
                value={timeString}
                onChange={(e) => setTimeString(e.target.value)}
                className="bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2 text-base font-mono-scada font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-xs text-slate-400">
                {language === 'hi' ? '(लॉगबुक में यही समय दर्ज होगा)' : '(Recorded in Logbook)'}
              </span>
            </div>
          </div>

          {/* 2. OPERATOR NAME BADGE */}
          <div className="flex items-center justify-between bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'hi' ? 'ऑपरेटर:' : 'Operator:'}</span>
            </span>
            <span className="text-slate-200 font-bold font-mono">
              {operatorName}
            </span>
          </div>

          {/* 3. REASONS SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {language === 'hi' ? 'कारण चुनें (Quick Reasons):' : 'Select Reason / Category:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickReasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    selectedReason === r
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 4. CUSTOM REMARKS */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {language === 'hi' ? 'अतिरिक्त टिप्पणी / लाइनमैन का नाम (वैकल्पिक):' : 'Additional Remark / Lineman Name (Optional):'}
            </label>
            <input
              type="text"
              value={customRemark}
              onChange={(e) => setCustomRemark(e.target.value)}
              placeholder={language === 'hi' ? 'जैसे: लाइनमैन सोहन लाल के अनुरोध पर' : 'e.g. As requested by Lineman'}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            
            <button
              type="submit"
              className={`flex items-center space-x-1.5 px-6 py-2.5 text-xs font-bold rounded-xl text-white shadow-xl transition transform active:scale-95 ${
                isTurningOff
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isTurningOff
                  ? (language === 'hi' ? 'पुष्टि करें - फीडर बंद करें' : 'Confirm - Switch OFF')
                  : (language === 'hi' ? 'पुष्टि करें - फीडर चालू करें' : 'Confirm - Switch ON')}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};