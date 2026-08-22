import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, set } from 'firebase/database';
import { Feeder, Incomer, FeederLog } from '../types/substation';

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

const STORAGE_KEY_FIREBASE_CONFIG = 'substation_arniya_fb_config_v4';

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
let realtimeDb: Database | null = null;

export function initFirebase(customConfig?: FirebaseConfigType) {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.apiKey) {
    return { app: null, realtimeDb: null };
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }

    const dbUrl = config.databaseURL || "https://substation-arniya-default-rtdb.firebaseio.com";
    realtimeDb = getDatabase(app, dbUrl);

    return { app, realtimeDb };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return { app: null, realtimeDb: null };
  }
}

export interface LiveStatePayload {
  feeders: Feeder[];
  incomers: Incomer[];
  logs: FeederLog[];
  updatedAt: string;
  updatedBy: string;
}

export async function syncStateToCloud(payload: LiveStatePayload) {
  try {
    const { realtimeDb } = initFirebase();
    if (realtimeDb) {
      const rtdbRef = ref(realtimeDb, 'substation_arniya/live_state');
      await set(rtdbRef, payload);
    }
  } catch (err) {
    console.error('Firebase Cloud RTDB write error:', err);
  }
}