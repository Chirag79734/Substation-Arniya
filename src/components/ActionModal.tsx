import React, { useState } from 'react';
import { Feeder, Language } from '../types/substation';
import { AlertTriangle, Power, X, Check } from 'lucide-react';

interface ActionModalProps {
  feeder: Feeder;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  language: Language;
}

const COMMON_REASONS_HI = [
  '?????? ????????? / ??? ?????',
  '????? ?? ???? (PTW) / ???? ?? ???',
  '?????? / ????? ????? / ???????? ?????',
  '?????? ?? ????? (Tree Trimming)',
  '?????? ??????? ????',
  '??????? ?? / ????? ???? ???'
];

const COMMON_REASONS_EN = [
  'Scheduled Rostering / Load Shedding',
  'Permit To Work (PTW) / Maintenance',
  'Emergency Repair / Jumper Fix',
  'Tree Trimming / Clearance',
  'Overload Precaution',
  'Normal Charging / Supply Restored'
];

export const ActionModal: React.FC<ActionModalProps> = ({
  feeder,
  isOpen,
  onClose,
  onConfirm,
  language
}) => {
  const isTurningOff = feeder.status === 'ON';
  const defaultReason = isTurningOff
    ? (language === 'hi' ? '?????? ?????????' : 'Scheduled Rostering')
    : (language === 'hi' ? '??????? ?????? ????' : 'Normal Supply Restored');

  const [selectedReason, setSelectedReason] = useState(defaultReason);
  const [customRemark, setCustomRemark] = useState('');

  if (!isOpen) return null;

  const quickReasons = language === 'hi' ? COMMON_REASONS_HI : COMMON_REASONS_EN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customRemark.trim() ? `${selectedReason} - ${customRemark.trim()}` : selectedReason;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isTurningOff ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            <Power className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {language === 'hi'
                ? `${feeder.hindiName} ?? ${isTurningOff ? '??? (OFF)' : '???? (ON)'} ????`
                : `Switch ${isTurningOff ? 'OFF' : 'ON'} ${feeder.name}`}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? '???? ?????? ???????? ?? ?????? ????' : 'Confirm feeder breaker switching operation'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {language === 'hi' ? '???? / ???? ????? (Quick Reasons):' : 'Select Reason / Category:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickReasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    selectedReason === r
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {language === 'hi' ? '???????? ??????? / ??????? (????????):' : 'Additional Remark / Note (Optional):'}
            </label>
            <input
              type="text"
              value={customRemark}
              onChange={(e) => setCustomRemark(e.target.value)}
              placeholder={language === 'hi' ? '????: ??? ???? ?? ?????????????, ??? ?????? 14' : 'e.g. As per JE instructions, pole #14'}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-start space-x-2 text-xs text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              {language === 'hi'
                ? '?? ???????? ????? ????? ??? ?? ???? ???? ?????? ??? ???? ?? ????? ?? ?????????? ?? ???? ???????'
                : 'This operation will immediately be recorded in the live logbook with exact timestamp and duration.'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {language === 'hi' ? '???? ????' : 'Cancel'}
            </button>
            
            <button
              type="submit"
              className={`flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-lg text-white shadow-lg transition ${
                isTurningOff
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isTurningOff
                  ? (language === 'hi' ? '?????? ???? - ???? ??? ????' : 'Confirm - Switch OFF')
                  : (language === 'hi' ? '?????? ???? - ???? ???? ????' : 'Confirm - Switch ON')}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
