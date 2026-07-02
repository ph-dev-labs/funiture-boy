import { App, initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const key = process.env.FIREBASE_PRIVATE_KEY;

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: key?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop) {
    const db = getFirestore(getAdminApp());
    const val = (db as any)[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  },
});
