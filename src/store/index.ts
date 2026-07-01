import { create } from 'zustand';

// ---- Types ----

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  balance: number;
  tradingProfit: number;
  stakingProfit: number;
  referralCode?: string;
  kycVerified: boolean;
  kycStatus?: 'unverified' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// ---- Auth Store ----
// NOTE: Intentionally NOT persisted to localStorage.
// Persisting auth data causes stale data from a previous user to appear before
// Firebase resolves the new session. All state is sourced fresh from Firestore
// on every session via AuthProvider.
interface AuthState {
  user: UserProfile | null;
  firebaseUser: { uid: string; email: string | null } | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setFirebaseUser: (fbUser: { uid: string; email: string | null } | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setFirebaseUser: (fbUser) => set({ firebaseUser: fbUser }),
  setLoading: (isLoading) => set({ isLoading }),
  // Atomically wipe both user and firebaseUser so no stale data remains
  logout: () => set({ user: null, firebaseUser: null, isLoading: false }),
}));

// ---- UI Store ----
interface UIState {
  sidebarOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setNotifications: (notifications: Notification[]) => void;
  markAllRead: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  notifications: [],
  unreadCount: 0,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
