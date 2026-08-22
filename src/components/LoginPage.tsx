import React, { useState } from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  Zap, 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  Shield,
  ChevronRight
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
        setErrorMsg('अमान्य आईडी या पिन! आपकी आईडी व्हाइटलिस्टेड सूची में नहीं है या पासवर्ड गलत है।');
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleQuickLogin = (id: string, quickPin: string) => {
    setUserId(id);
    setPin(quickPin);
    setErrorMsg(null);
    login(id, quickPin);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden font-sans">
      {/* High-tech animated ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Substation Header Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 shadow-xl shadow-amber-500/10 mb-2">
            <Zap className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-tech">
            33/11 KV सबस्टेशन अरनिया
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            सुरक्षित एससीएडीए ऑटोमेशन व लोड मॉनिटरिंग पोर्टल
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-slate-200">
                सुरक्षित लॉगिन (Authentication)
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              RBAC PROTECTED
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* User ID Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>उपयोगकर्ता आईडी (User ID)</span>
                <span className="text-[10px] text-slate-500">उदा. sso1, xen, aen</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="अपनी अधिकृत आईडी दर्ज करें..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 font-medium placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            {/* PIN / Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>सुरक्षा पिन / पासवर्ड (PIN)</span>
                <span className="text-[10px] text-slate-500">4-अंकों का पिन</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={12}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition transform active:scale-95 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'प्रमाणीकरण हो रहा है...' : 'सुरक्षित लॉगिन करें (Sign In)'}</span>
            </button>
          </form>

          {/* Quick Demo Access Pills */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block text-center">
              त्वरित डेमो टेस्ट लॉगिन (Quick Login):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('sso1', '1234')}
                className="p-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition group flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">ऑपरेटर (SSO)</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">आईडी: <strong className="text-slate-300">sso1</strong> (पिन: 1234)</span>
                <span className="text-[9px] text-emerald-400 font-semibold mt-1">✓ ऑन/ऑफ व लोड एडिट एक्सेस</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('xen', '5678')}
                className="p-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition group flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">अधिकारी (XEN)</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">आईडी: <strong className="text-slate-300">xen</strong> (पिन: 5678)</span>
                <span className="text-[9px] text-indigo-300 font-semibold mt-1">👁️ केवल लाइव मॉनिटर (View Only)</span>
              </button>
            </div>
          </div>

          {/* Role Access Guidance */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] space-y-1 text-slate-400">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>रोल आधारित अनुमतियाँ (Role Permissions):</span>
            </div>
            <p>• <strong>ऑपरेटर (Operator):</strong> फीडर ऑन/ऑफ स्विच, घंटेवार RYB लोड एंट्री, ट्रिपिंग सिमुलेशन।</p>
            <p>• <strong>अधिकारी (Officer/Viewer):</strong> लाइव लोड मॉनिटरिंग, SLD डायग्राम, 24 घंटे का रजिस्टर व Excel डाउनलोड (नियंत्रण बटन लॉक रहेंगे)।</p>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500">
          33/11 KV Substation Arniya SCADA Automation System • Restricted Access
        </p>

      </div>
    </div>
  );
};