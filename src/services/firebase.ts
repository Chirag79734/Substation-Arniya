import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY_FIREBASE_CONFIG = 'substation_arniya_fb_config_v1';

export function getSavedFirebaseConfig(): FirebaseConfigType | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading firebase config from storage', e);
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseConfigType) {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

let app: FirebaseApp | null = null;
let db: Database | null = null;

export function initFirebase(customConfig?: FirebaseConfigType): { app: FirebaseApp | null; db: Database | null } {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.databaseURL || !config.apiKey) {
    return { app: null, db: null };
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    db = getDatabase(app);
    return { app, db };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return { app: null, db: null };
  }
}