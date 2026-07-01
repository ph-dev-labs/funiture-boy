'use client';

import { useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setFirebaseUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser({ uid: fbUser.uid, email: fbUser.email });
        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ uid: fbUser.uid, ...docSnap.data() } as any);
          }
        } catch (e) {
          console.error('Error fetching user profile', e);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setFirebaseUser, setLoading]);

  return <>{children}</>;
}
