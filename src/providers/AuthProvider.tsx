'use client';

import { useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setFirebaseUser, setLoading, logout } = useAuthStore();

  // One-time: purge the old Zustand-persisted 'auth-storage' key that was left
  // in localStorage by a previous version of the app. Without this, a returning
  // user would have stale role/balance data hydrated before Firebase resolves.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // ── Step 1: Immediately clear any stale previous user profile.
        // This prevents a previous user's data from being visible while
        // we fetch the new user's Firestore document.
        setUser(null);
        setLoading(true);

        // ── Step 2: Record the new Firebase identity
        setFirebaseUser({ uid: fbUser.uid, email: fbUser.email });

        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            // ── Step 3: Populate with fresh data for the new user
            setUser({ uid: fbUser.uid, ...docSnap.data() } as any);
          } else {
            // Profile doc doesn't exist — treat as unsigned-in state
            setUser(null);
          }
        } catch (e) {
          console.error('Error fetching user profile', e);
          setUser(null);
        }
      } else {
        // Signed out — wipe everything atomically
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setFirebaseUser, setLoading, logout]);

  return <>{children}</>;
}

