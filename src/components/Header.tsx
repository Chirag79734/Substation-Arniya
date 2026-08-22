import React, { useState } from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  Radio, 
  FileText, 
  Activity, 
  Cloud,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { FirebaseModal } from './FirebaseModal';

export const Header: React.FC = () => {
  const { 
    currentUser,
    logout,
    role, 
    language, 
    setLanguage, 
    operatorName, 
    activeTab, 
    setActiveTab, 
    now, 
    isFirebaseConnected,
    cloudSyncError,
    lastCloudSyncTime
  } = useSubstation();

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = now.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 text-white font-bold text-xl ring-2 ring-amber-400/30">
                <Zap className="w-7 h-7 text-amber-100 fill-amber-300" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-slate-900"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-tech">
                    {language === 'hi' ? '33/11 KV विद्युत सबस्टेशन अरनिया' : '33/11 KV Substation Arniya'}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                    <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE SCADA
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'hi' 
                    ? 'फीडर नियंत्रण, परिचालन एवं वास्तविक समय निगरानी प्रणाली' 
                    : 'Feeder Control, Operation & Real-Time Monitoring System'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Cloud Sync Status Badge */}
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  cloudSyncError
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700 hover:bg-rose-900 animate-pulse'
                    : isFirebaseConnected
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title={cloudSyncError || "Multi-Device Cloud Sync Status"}
              >
                {cloudSyncError ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Cloud className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                )}
                <span>
                  {cloudSyncError
                    ? (language === 'hi' ? 'क्लाउड रूल्स चेक करें' : 'Check DB Rules')
                    : isFirebaseConnected
                    ? (language === 'hi' ? `क्लाउड लाइव ${lastCloudSyncTime ? `(${lastCloudSyncTime})` : ''}` : `Cloud: LIVE ${lastCloudSyncTime ? `(${lastCloudSyncTime})` : ''}`)
                    : (language === 'hi' ? 'क्लाउड कनेक्ट करें' : 'Connect Cloud')}
                </span>
              </button>

              <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2 text-slate-300 text-xs sm:text-sm font-mono-scada">
                <Clock className="w-4 h-4 text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-amber-400 font-semibold">{formattedTime}</span>
                  <span className="text-[10px] text-slate-400">{formattedDate}</span>
                </div>
              </div>

              <button
                onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Change Language"
              >
                {language === 'hi' ? 'English (EN)' : 'हिंदी (HI)'}
              </button>

              <div className="bg-slate-950/90 px-3 py-1 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white flex items-center justify-end space-x-1">
                    <span>{currentUser?.name || operatorName}</span>
                    <span className={`w-2 h-2 rounded-full ${role === 'operator' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentUser?.designation || (role === 'operator' ? 'ऑपरेटर (Edit Access)' : 'अधिकारी (View Only)')}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(language === 'hi' ? 'क्या आप पोर्टल से लॉगआउट करना चाहते हैं?' : 'Are you sure you want to log out?')) {
                      logout();
                    }
                  }}
                  className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition flex items-center space-x-1 text-xs"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-semibold">{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </div>

            </div>
          </div>

          {cloudSyncError && (
            <div className="mt-3 py-2 px-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  <strong>{language === 'hi' ? 'Firebase डेटाबेस सुरक्षा नियम:' : 'Firebase Security Rules:'}</strong> {language === 'hi' ? 'मल्टी-डिवाइस लाइव सिंक के लिए Firebase Console में Database Rules को "Test Mode" में ऑन करें।' : 'Enable test mode in Firebase Console -> Database -> Rules for multi-device sync.'}
                </span>
              </div>
              <a
                href="https://console.firebase.google.com/project/substation-arniya/database"
                target="_blank"
                rel="noreferrer"
                className="underline text-rose-300 hover:text-white font-bold"
              >
                Open Rules
              </a>
            </div>
          )}

          {role === 'operator' && (
            <div className="mt-3 py-1 px-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span className="font-semibold">
                  {language === 'hi' ? 'ऑपरेटर मोड एक्टिव (नियंत्रण सक्षम)' : 'Operator Mode Active (Control Enabled)'}:
                </span>
                <span className="bg-slate-900 border border-amber-500/40 rounded px-2 py-0.5 text-xs text-amber-200 font-bold">
                  {operatorName}
                </span>
              </div>
              <span className="text-slate-400 hidden sm:inline text-[11px]">
                {language === 'hi' ? 'क्लिक करके किसी भी फीडर को तुरंत चालू या बंद करें' : 'Click on any feeder switch to instantly turn ON or OFF'}
              </span>
            </div>
          )}

          {role === 'officer' && (
            <div className="mt-3 py-1 px-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center justify-between text-xs text-indigo-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold">
                  {language === 'hi' ? 'उच्चाधिकारी निगरानी मोड (केवल अवलोकन)' : 'Supervisor Monitoring Mode (Read-Only Live Stream)'}
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {language === 'hi' ? 'वास्तविक समय में देखें कौन सा फीडर कितना समय चला / बंद रहा' : 'Real-time monitoring of runtimes, downtimes and load status'}
              </span>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
            {[
              { id: 'overview', labelHi: 'डैशबोर्ड ओवरव्यू', labelEn: 'Dashboard Overview', icon: Activity },
              { id: 'hourly', labelHi: '📊 प्रति घंटा लोड शीट (R-Y-B)', labelEn: 'Hourly Load (R-Y-B)', icon: Clock },
              { id: 'diagram', labelHi: 'सिंगल लाइन डायग्राम (SLD)', labelEn: 'Single Line Diagram', icon: Zap },
              { id: 'logs', labelHi: 'इवेंट लॉगबुक', labelEn: 'Logbook & History', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </>
  );
};