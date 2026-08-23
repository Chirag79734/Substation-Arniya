import React, { useState, useEffect } from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  AlertTriangle, 
  Zap, 
  X, 
  Check, 
  Clock, 
  User, 
  ShieldAlert
} from 'lucide-react';

interface Supply33KvModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFailing: boolean; // true = Trigger Failure, false = Restore Supply
}

const FAIL_REASONS_HI = [
  '33 KV मेन ग्रिड सप्लाई फेल / ब्लैकआउट',
  '33 KV इनकमिंग लाइन ट्रिपिंग',
  'ऊपरी ग्रिड सबस्टेशन से आपातकालीन शटडाउन',
  'आंधी-तूफान / मौसम खराबी के कारण ब्रेकडाउन',
  '33 KV बसबार फॉल्ट / प्रोटेक्शन ट्रिप'
];

const FAIL_REASONS_EN = [
  '33 KV Main Grid Supply Failure / Blackout',
  '33 KV Incoming Line Tripping',
  'Emergency Shutdown from Grid Substation',
  'Severe Weather / Storm Breakdown',
  '33 KV Busbar Fault / Protection Trip'
];

const RESTORE_REASONS_HI = [
  '33 KV ग्रिड सप्लाई सामान्य / चार्ज की गई',
  '33 KV मेन लाइन क्लीयरेंस प्राप्त / सप्लाई बहाल',
  'ग्रिड सबस्टेशन द्वारा आपूर्ति पुनः प्रारंभ',
  'फॉल्ट समाधान उपरांत 33 KV चार्ज'
];

const RESTORE_REASONS_EN = [
  '33 KV Grid Supply Restored / Charged',
  '33 KV Line Clearance Received / Power Restored',
  'Power Resumed by Grid Substation',
  'Post-Fault 33 KV Energization'
];

export const Supply33KvModal: React.FC<Supply33KvModalProps> = ({
  isOpen,
  onClose,
  isFailing
}) => {
  const { 
    operatorName, 
    language, 
    trigger33KvSupplyFail, 
    restore33KvSupply 
  } = useSubstation();

  const defaultReason = isFailing
    ? (language === 'hi' ? '33 KV मेन ग्रिड सप्लाई फेल / ब्लैकआउट' : '33 KV Main Grid Supply Failure')
    : (language === 'hi' ? '33 KV ग्रिड सप्लाई सामान्य / चार्ज की गई' : '33 KV Grid Supply Restored');

  const [selectedReason, setSelectedReason] = useState(defaultReason);
  const [customRemark, setCustomRemark] = useState('');
  const [isManualTimeChanged, setIsManualTimeChanged] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      setIsManualTimeChanged(false);
      setSelectedReason(
        isFailing
          ? (language === 'hi' ? '33 KV मेन ग्रिड सप्लाई फेल / ब्लैकआउट' : '33 KV Main Grid Supply Failure')
          : (language === 'hi' ? '33 KV ग्रिड सप्लाई सामान्य / चार्ज की गई' : '33 KV Grid Supply Restored')
      );
      setCustomRemark('');
      setIsSubmitting(false);
    }
  }, [isOpen, isFailing, language]);

  if (!isOpen) return null;

  const quickReasons = isFailing
    ? (language === 'hi' ? FAIL_REASONS_HI : FAIL_REASONS_EN)
    : (language === 'hi' ? RESTORE_REASONS_HI : RESTORE_REASONS_EN);

  const setNowTime = () => {
    const d = new Date();
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    setTimeString(`${hh}:${mm}`);
    setIsManualTimeChanged(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalReason = customRemark.trim() ? `${selectedReason} - ${customRemark.trim()}` : selectedReason;
    
    let operationIso = new Date().toISOString();
    if (isManualTimeChanged && timeString && timeString.includes(':')) {
      const [h, m] = timeString.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(h, m, 0, 0);
      operationIso = targetDate.toISOString();
    }

    try {
      if (isFailing) {
        await trigger33KvSupplyFail(finalReason, operationIso);
      } else {
        await restore33KvSupply(finalReason, operationIso);
      }
      onClose();
    } catch (err) {
      console.error('Error during 33kv action:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5 border-b border-slate-800 pb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
            isFailing 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/10' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10'
          }`}>
            {isFailing ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <Zap className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-tech">
              {isFailing 
                ? (language === 'hi' ? '⚠️ 33 KV ग्रिड सप्लाई फेल दर्ज करें' : '⚠️ Record 33 KV Grid Supply Failure')
                : (language === 'hi' ? '⚡ 33 KV ग्रिड सप्लाई बहाल / चार्ज करें' : '⚡ Restore 33 KV Grid Supply')}
            </h3>
            <p className="text-xs text-slate-400">
              {isFailing 
                ? (language === 'hi' ? '33/11 KV सबस्टेशन अरनिया - संपूर्ण सबस्टेशन ब्लैकआउट' : 'Substation Arniya - Total 33kV Outage')
                : (language === 'hi' ? '33 KV सप्लाई सामान्य स्थिति में वापस चार्ज की जा रही है' : 'Re-energizing 33kV Busbars')}
            </p>
          </div>
        </div>

        {/* Safety Rule Callout Alert */}
        <div className={`p-3.5 rounded-2xl border mb-4 text-xs ${
          isFailing 
            ? 'bg-rose-950/70 border-rose-800/80 text-rose-200' 
            : 'bg-amber-950/60 border-amber-800/80 text-amber-200'
        }`}>
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isFailing ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              {isFailing ? (
                <span>
                  <strong>{language === 'hi' ? 'महत्वपूर्ण प्रभाव:' : 'Immediate Impact:'}</strong>{' '}
                  {language === 'hi' 
                    ? '33 KV सप्लाई फेल की पुष्टि करते ही दोनों 33kV इनकमर (0 kV) और सभी 8 11kV फीडर तुरंत बंद (OFF / 0A, 0MW) हो जाएंगे।'
                    : 'Confirming 33kV Failure will instantly drop Incomers to 0kV and switch OFF all 8 11kV feeders.'}
                </span>
              ) : (
                <span>
                  <strong>{language === 'hi' ? 'सुरक्षा नियम (SOP):' : 'Safety SOP Rule:'}</strong>{' '}
                  {language === 'hi'
                    ? '33 KV बहाल होने के बाद कोई भी फीडर अपने आप चालू नहीं होगा। ऑपरेटर द्वारा फीडर लोड देखकर एक-एक करके मैन्युअल चालू किए जाएंगे।'
                    : 'Restoring 33kV will NOT auto-energize feeders. All feeders will remain OFF for manual charging.'}
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Time Check Input */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>
                  {isFailing 
                    ? (language === 'hi' ? '33 KV फेल होने का समय:' : 'Time of Failure:') 
                    : (language === 'hi' ? '33 KV बहाल होने का समय:' : 'Time of Restoration:')}
                </span>
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
                onChange={(e) => {
                  setTimeString(e.target.value);
                  setIsManualTimeChanged(true);
                }}
                className="bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2 text-base font-mono-scada font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-xs text-slate-400">
                {language === 'hi' ? '(इवेंट लॉगबुक में दर्ज होगा)' : '(Logged to History)'}
              </span>
            </div>
          </div>

          {/* Operator Badge */}
          <div className="flex items-center justify-between bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'hi' ? 'लॉगिन ऑपरेटर:' : 'Operator:'}</span>
            </span>
            <span className="text-slate-200 font-bold font-mono">
              {operatorName}
            </span>
          </div>

          {/* Reasons List */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {language === 'hi' ? 'कारण चुनें (Quick Reasons):' : 'Select Reason:'}
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {quickReasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    selectedReason === r
                      ? (isFailing 
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold' 
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold')
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {language === 'hi' ? 'अतिरिक्त विवरण / ग्रिड नोट (वैकल्पिक):' : 'Additional Grid Note (Optional):'}
            </label>
            <input
              type="text"
              value={customRemark}
              onChange={(e) => setCustomRemark(e.target.value)}
              placeholder={language === 'hi' ? 'जैसे: 220kV जहांगीरपुर से सप्लाई ट्रिप' : 'e.g. Tripped from 220kV Grid'}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-xl text-white shadow-xl transition transform active:scale-95 disabled:opacity-50 ${
                isFailing
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (language === 'hi' ? 'प्रक्रिया हो रही है...' : 'Processing...')
                  : isFailing
                  ? (language === 'hi' ? 'पुष्टि करें - 33 KV फेल व सभी 8 फीडर बंद करें' : 'Confirm - Fail 33kV & Turn OFF Feeders')
                  : (language === 'hi' ? 'पुष्टि करें - 33 KV बहाल करें (फीडर बंद रहेंगे)' : 'Confirm - Restore 33kV (Feeders Stay OFF)')}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};