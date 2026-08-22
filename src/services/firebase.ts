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
  measurementId?: string;
}

// Pre-configured Firebase keys for Substation Arniya
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigType = {
  apiKey: "AIzaSyAUDjJRphY2pyr7tLvfeZa8zQZFF-x8Q_4",
  authDomain: "substation-arniya.firebaseapp.com",
  databaseURL: "https://substation-arniya-default-rtdb.firebaseio.com",
  projectId: "substation-arniya",
  storageBucket: "substation-arniya.firebasestorage.app",
  messagingSenderId: "475840216238",
  appId: "1:475840216238:web:b3b9d4d71f81acfd41013f",
  measurementId: "G-RHE89SGR5R"
};

const STORAGE_KEY_FIREBASE_CONFIG = 'substation_arniya_fb_config_v2';

export function getSavedFirebaseConfig(): FirebaseConfigType {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading firebase config from storage', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
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
  if (!config || !config.apiKey) {
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
    console.warn('Firebase initialization note (RTDB might need Create Database in Console):', err);
    return { app: null, db: null };
  }
}