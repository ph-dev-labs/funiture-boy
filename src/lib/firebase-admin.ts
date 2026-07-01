import { App, initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Lazy initialization: the Admin SDK is only instantiated when first called at
// runtime. Eager initialization (top-level) causes Next.js build to crash during
// static page-data collection because env vars aren't present in the build env.
function getAdminApp(): App {
  if (getApps().length > 0) return getApp();

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel stores the key with literal \n — replace them with real newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = {
  get instance() { return getAuth(getAdminApp()); },
  generateEmailVerificationLink: (...args: Parameters<ReturnType<typeof getAuth>['generateEmailVerificationLink']>) =>
    getAuth(getAdminApp()).generateEmailVerificationLink(...args),
  verifyIdToken: (...args: Parameters<ReturnType<typeof getAuth>['verifyIdToken']>) =>
    getAuth(getAdminApp()).verifyIdToken(...args),
  getUser: (...args: Parameters<ReturnType<typeof getAuth>['getUser']>) =>
    getAuth(getAdminApp()).getUser(...args),
  updateUser: (...args: Parameters<ReturnType<typeof getAuth>['updateUser']>) =>
    getAuth(getAdminApp()).updateUser(...args),
  deleteUser: (...args: Parameters<ReturnType<typeof getAuth>['deleteUser']>) =>
    getAuth(getAdminApp()).deleteUser(...args),
};

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop) {
    const db = getFirestore(getAdminApp());
    const val = (db as any)[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  },
});
