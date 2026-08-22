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

let app: FirebaseApp | null = null;
let realtimeDb: Database | null = null;

export function initFirebase(): { app: FirebaseApp; realtimeDb: Database } {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(DEFAULT_FIREBASE_CONFIG);
    } else {
      app = getApps()[0];
    }
  }

  if (!realtimeDb) {
    realtimeDb = getDatabase(app, DEFAULT_FIREBASE_CONFIG.databaseURL);
  }

  return { app, realtimeDb };
}

export interface LiveStatePayload {
  feeders: Feeder[];
  incomers: Incomer[];
  logs: FeederLog[];
  updatedAt: string;
  updatedBy: string;
}

export async function syncStateToCloud(payload: LiveStatePayload): Promise<boolean> {
  try {
    const { realtimeDb: db } = initFirebase();
    const rtdbRef = ref(db, 'substation_arniya/live_state');
    await set(rtdbRef, payload);
    return true;
  } catch (err) {
    console.error('Firebase RTDB write error:', err);
    return false;
  }
}