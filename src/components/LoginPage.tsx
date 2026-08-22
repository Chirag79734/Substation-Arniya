import React, { useState } from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Radio
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useSubstation();

  const [userId, setUserId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId.trim()) {
      setErrorMsg('कृपया अपनी उपयोगकर्ता आईडी (User ID) दर्ज करें।');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('कृपया अपना सुरक्षा पिन / पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(userId.trim().toLowerCase(), pin.trim());
      if (!success) {
        setErrorMsg('अमान्य आईडी या पिन! आपकी आईडी अधिकृत सूची में नहीं है या पासवर्ड गलत है।');
        setIsSubmitting(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#0b1322] text-slate-100 flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden font-sans select-none">
      
      {/* Background High-Tech Ambient Grid & Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      {/* TOP HEADER BRANDING */}
      <header className="w-full max-w-5xl z-10 pt-2 flex items-center space-x-4 sm:space-x-5">
        {/* Power Corporation Official Emblem / High Voltage Tower Crest */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/90 border-2 border-slate-600/80 p-1 flex-shrink-0 flex items-center justify-center shadow-xl shadow-black/60 relative group">
          <div className="w-full h-full rounded-full border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-1 relative overflow-hidden">
            {/* Transmission Tower SVG */}
            <svg viewBox="0 0 100 100" className="w-10 h-10 text-slate-200 fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50 12 L32 88 M50 12 L68 88" />
              <path d="M22 36 L78 36" />
              <path d="M28 54 L72 54" />
              <path d="M34 72 L66 72" />
              <path d="M32 36 L68 54 M68 36 L32 54" />
              <path d="M32 54 L68 72 M68 54 L32 72" />
              <circle cx="50" cy="12" r="3" className="fill-amber-400 stroke-none" />
              <path d="M18 36 L12 44 M82 36 L88 44" />
            </svg>
            <span className="text-[6px] font-bold text-slate-300 uppercase tracking-tighter text-center leading-none mt-0.5">
              उ.प्र. पावर कॉर्पो.
            </span>
          </div>
        </div>

        {/* Header Texts */}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>३३/११ केवी विद्युत उपकेन्द्र — अरनिया</span>
            <span className="text-base sm:text-lg md:text-xl font-normal text-slate-400">
              (33/11 KV Substation - Arnia)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5 flex items-center space-x-2">
            <span className="text-amber-400 font-semibold">SCADA सुरक्षा लॉगिन एवं लोड मॉनिटरिंग सिस्टम</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>RTU Online</span>
            </span>
          </p>
        </div>
      </header>

      {/* CENTER AUTHENTICATION CARD */}
      <main className="w-full max-w-lg z-10 my-6">
        <div className="bg-[#121c2d]/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-md relative overflow-hidden">
          
          {/* Card Top Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                सुरक्षित लॉगिन <span className="text-slate-400 font-normal text-sm">(Authentication)</span>
              </h2>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono-scada font-bold text-emerald-400 tracking-wider shadow-sm shadow-emerald-950">
              SCADA PROTECTED
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            
            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl flex items-center space-x-2.5 text-xs text-rose-300 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Field 1: User ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200">
                  उपयोगकर्ता आईडी <span className="text-slate-400 font-normal">(User ID)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">उदा. 1011, 1012, 1021...</span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="अपनी अधिकृत आईडी दर्ज करें..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a101b] border border-slate-700/80 focus:border-amber-500 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Field 2: PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200">
                  सुरक्षा पिन / पासवर्ड <span className="text-slate-400 font-normal">(PIN)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">4-अंकों का पिन</span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={12}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0a101b] border border-slate-700/80 focus:border-amber-500 rounded-xl text-sm font-mono tracking-widest text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'प्रमाणीकरण हो रहा है...' : 'सुरक्षित प्रवेश करें'}</span>
            </button>
          </form>

        </div>
      </main>

      {/* BOTTOM ADMINISTRATIVE INFORMATION & ACCESS RIGHTS CARD */}
      <footer className="w-full max-w-4xl z-10">
        <div className="bg-[#0e1726]/90 border border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xl shadow-black/50 text-xs sm:text-sm text-slate-300 space-y-2.5">
          
          <h3 className="text-center text-amber-400 font-extrabold tracking-wider text-xs sm:text-sm uppercase pb-1 border-b border-amber-500/20">
            ** आवश्यक प्रशासनिक सूचना एवं पहुँच अधिकार **
          </h3>

          <ul className="space-y-1.5 text-slate-300 leading-relaxed text-[11px] sm:text-xs">
            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold text-base leading-none">•</span>
              <span>
                <strong className="text-slate-100">अधिकृत लॉगिन:</strong> यह पोर्टल केवल अधिकृत विद्युत विभाग के कार्मिकों (SSO, JE, AE) हेतु है। अनधिकृत पहुँच प्रतिबंधित और दंडनीय है।
              </span>
            </li>

            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold text-base leading-none">•</span>
              <span>
                <strong className="text-slate-100">कर्मचारी आईडी:</strong> अपनी वैध कर्मचारी आईडी (Employee ID) और गोपनीय 'सुरक्षा पिन (4-Digit PIN)' का उपयोग करें।
              </span>
            </li>

            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold text-base leading-none">•</span>
              <div>
                <strong className="text-slate-100">पहुँच अधिकार (Role-Based Access):</strong>
                <div className="pl-3 sm:pl-4 mt-1 space-y-1 text-slate-400">
                  <p>
                    • <strong className="text-amber-300">परिचालक (Operator):</strong> सबस्टेशन नियंत्रण, स्विच गियर ऑपरेशन, लॉग शीट डेटा प्रविष्टि।
                  </p>
                  <p>
                    • <strong className="text-cyan-300">अधिकारी (Officer):</strong> केवल-पठन (Read-Only) मॉनिटरिंग व्यू, रिपोर्ट डाउनलोड, SLD डायग्राम।
                  </p>
                </div>
              </div>
            </li>

            <li className="flex items-start space-x-2">
              <span className="text-amber-400 font-bold text-base leading-none">•</span>
              <span>
                <strong className="text-slate-100">सुरक्षा चेतावनी:</strong> लॉग-इन जानकारी किसी के साथ साझा न करें। सिस्टम ऑडिट के लिए सभी लॉग-इन क्रियाएँ रिकॉर्ड की जाती हैं।
              </span>
            </li>
          </ul>

        </div>
      </footer>

    </div>
  );
};