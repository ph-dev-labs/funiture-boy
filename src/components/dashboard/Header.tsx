'use client';

import { useAuthStore } from '@/store';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MenuIcon from '@mui/icons-material/Menu';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useState, useEffect } from 'react';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: any;
};

export default function Header() {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, `users/${user.uid}/notifications`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!user?.uid) return;
    await updateDoc(doc(db, `users/${user.uid}/notifications`, id), {
      read: true
    });
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach((n) => {
      const ref = doc(db, `users/${user.uid}/notifications`, n.id);
      batch.update(ref, { read: true });
    });
    await batch.commit();
  };

  return (
    <header className="h-16 flex-shrink-0 border-b border-white/10 bg-[#0a0b10] flex items-center justify-between px-4 lg:px-8 relative z-50">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-white/70 hover:text-white transition-colors">
          <MenuIcon />
        </button>
        <span className="font-bold text-white">TrendyTrades</span>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden lg:block flex-1" />

      {/* Right Side */}
      <div className="flex items-center gap-4 relative">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-all relative"
          >
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
            {/* Unread dot indicator */}
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#ff0055] shadow-[0_0_8px_#ff0055] flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0055] opacity-75"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Invisible overlay to close dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 bg-[#12131a] border border-white/10 rounded-xl shadow-2xl p-4 z-50 max-h-96 flex flex-col">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-sm font-semibold text-white">Notifications ({unreadCount})</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
                    >
                      <DoneAllIcon sx={{ fontSize: 14 }} /> Mark all read
                    </button>
                  )}
                </div>
                
                <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-white/40 text-sm">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.read && markAsRead(n.id)}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          n.read 
                            ? 'bg-transparent border-white/5 opacity-60' 
                            : 'bg-[#d4af37]/5 border-[#d4af37]/20 hover:bg-[#d4af37]/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className={`text-sm font-medium ${n.read ? 'text-white/70' : 'text-white'}`}>
                            {n.title}
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1 shrink-0" />}
                        </div>
                        <div className="text-xs text-white/50">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-white">{user?.displayName || 'Trader'}</div>
            <div className="text-xs text-[#d4af37]">Verified Level 1</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a8810b] to-[#d4af37] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(168,129,11,0.3)] shrink-0">
            {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'TR'}
          </div>
        </div>
      </div>
    </header>
  );
}
