import React, { useState } from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  Cloud, 
  Check, 
  X, 
  ExternalLink, 
  HelpCircle
} from 'lucide-react';
import { FirebaseConfigType } from '../services/firebase';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({ isOpen, onClose }) => {
  const { firebaseConfig, updateFirebaseConfig, isFirebaseConnected, language } = useSubstation();

  const [rawConfig, setRawConfig] = useState('');
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || '');
  const [databaseURL, setDatabaseURL] = useState(firebaseConfig?.databaseURL || 'https://substation-arniya-default-rtdb.firebaseio.com');
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || 'substation-arniya');
  const [authDomain, setAuthDomain] = useState(firebaseConfig?.authDomain || 'substation-arniya.firebaseapp.com');
  const [storageBucket, setStorageBucket] = useState(firebaseConfig?.storageBucket || 'substation-arniya.appspot.com');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseConfig?.appId || '');

  const [pasteMode, setPasteMode] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleParseRaw = () => {
    try {
      const extractKey = (key: string) => {
        const regex = new RegExp(`${key}['"\\s]*:['"\\s]*([^'",\\s\\n}]+)`, 'i');
        const match = rawConfig.match(regex);
        return match ? match[1].replace(/['",]/g, '') : '';
      };

      const extractedApiKey = extractKey('apiKey');
      const extractedDbUrl = extractKey('databaseURL');
      const extractedProjId = extractKey('projectId') || 'substation-arniya';
      const extractedAuthDomain = extractKey('authDomain') || `${extractedProjId}.firebaseapp.com`;
      const extractedStorageBucket = extractKey('storageBucket') || `${extractedProjId}.appspot.com`;
      const extractedMsgId = extractKey('messagingSenderId');
      const extractedAppId = extractKey('appId');

      if (extractedApiKey) setApiKey(extractedApiKey);
      if (extractedDbUrl) setDatabaseURL(extractedDbUrl);
      if (extractedProjId) setProjectId(extractedProjId);
      if (extractedAuthDomain) setAuthDomain(extractedAuthDomain);
      if (extractedStorageBucket) setStorageBucket(extractedStorageBucket);
      if (extractedMsgId) setMessagingSenderId(extractedMsgId);
      if (extractedAppId) setAppId(extractedAppId);

      setStatusMsg(language === 'hi' ? 'कॉन्फिग कीज़ पहचान ली गईं! कृपया सेव पर क्लिक करें।' : 'Config parsed successfully! Click Save.');
      setPasteMode(false);
    } catch {
      setStatusMsg(language === 'hi' ? 'पार्स करने में त्रुटि, कृपया फील्ड्स अलग से भरें।' : 'Error parsing code. Please fill fields individually.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !databaseURL) {
      alert(language === 'hi' ? 'कृपया कम से कम apiKey और databaseURL भरें।' : 'Please enter at least apiKey and databaseURL.');
      return;
    }

    const newConfig: FirebaseConfigType = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim() || 'substation-arniya',
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    updateFirebaseConfig(newConfig);
    onClose();
  };

  const handleDisconnect = () => {
    if (window.confirm(language === 'hi' ? 'क्या आप Firebase क्लाउड सिंक हटाना चाहते हैं?' : 'Disconnect Firebase Cloud Sync?')) {
      updateFirebaseConfig(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>{language === 'hi' ? 'Firebase रीयल-टाइम क्लाउड डेटाबेस सेटअप' : 'Firebase Realtime Cloud Database Setup'}</span>
              {isFirebaseConnected && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  CONNECTED
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'सभी मोबाइल और कंप्यूटर पर रियल-टाइम लाइव फीडर स्थिति सिंक करें'
                : 'Sync live feeder statuses across all devices instantly with zero reload'}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 mb-4">
          <div className="flex items-center justify-between font-semibold text-amber-400">
            <span className="flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>{language === 'hi' ? 'Firebase कंसोल से कॉन्फ़िगरेशन कैसे प्राप्त करें:' : 'How to get Firebase config in 2 steps:'}</span>
            </span>
            <a
              href="https://console.firebase.google.com/project/substation-arniya/overview"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 underline flex items-center space-x-1"
            >
              <span>Open Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
            <li>
              Firebase Console में <strong>Project Settings (⚙️)</strong> $\rightarrow$ <strong>Your Apps</strong> में Web icon <code>&lt;/&gt;</code> पर क्लिक करके ऐप रजिस्टर करें।
            </li>
            <li>
              Firebase Console के बाएँ मेनू में <strong>Build $\rightarrow$ Realtime Database $\rightarrow$ Create Database</strong> करके <strong>Test Mode</strong> चालू करें।
            </li>
            <li>
              नीचे दिया गया <code>firebaseConfig</code> कोड यहाँ पेस्ट कर दें।
            </li>
          </ol>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <button
            type="button"
            onClick={() => setPasteMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              pasteMode ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'Paste Code Block (आसान)' : 'Paste Code Snippet (Quick)'}
          </button>
          <button
            type="button"
            onClick={() => setPasteMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !pasteMode ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'मैन्युअल फ़ील्ड्स (Manual)' : 'Individual Fields'}
          </button>
        </div>

        {pasteMode ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'hi' ? 'Firebase Console से firebaseConfig पेस्ट करें:' : 'Paste firebaseConfig object from Firebase Console:'}
              </label>
              <textarea
                rows={6}
                value={rawConfig}
                onChange={(e) => setRawConfig(e.target.value)}
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "substation-arniya.firebaseapp.com",\n  databaseURL: "https://substation-arniya-default-rtdb.firebaseio.com",\n  projectId: "substation-arniya",\n  ...\n};`}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {statusMsg && (
              <p className="text-xs text-emerald-400 font-semibold">{statusMsg}</p>
            )}

            <button
              type="button"
              onClick={handleParseRaw}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              {language === 'hi' ? 'कॉन्फिग पढ़ें व लोड करें (Extract Keys)' : 'Extract Config Keys'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">API Key *</label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Database URL (RTDB) *</label>
                <input
                  type="text"
                  required
                  value={databaseURL}
                  onChange={(e) => setDatabaseURL(e.target.value)}
                  placeholder="https://substation-arniya-default-rtdb.firebaseio.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="substation-arniya"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">App ID</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {firebaseConfig ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 transition"
                >
                  {language === 'hi' ? 'क्लाउड डिस्कनेक्ट करें' : 'Disconnect Cloud'}
                </button>
              ) : <div />}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'hi' ? 'क्लाउड से कनेक्ट करें' : 'Connect to Firebase'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};