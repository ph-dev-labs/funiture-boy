'use client';

import { useState, useEffect, useCallback } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';

const NAMES = [
  'James R.', 'Sofia M.', 'Liam K.', 'Amara O.', 'Noah B.',
  'Isabella C.', 'Carlos V.', 'Priya S.', 'Ethan W.', 'Yuki T.',
  'Fatima A.', 'Lucas P.', 'Emma D.', 'Mohamed H.', 'Chloe N.',
];

const LOCATIONS = [
  // 🇺🇸 USA — all 50 states
  '🇺🇸 Alabama, USA', '🇺🇸 Alaska, USA', '🇺🇸 Arizona, USA', '🇺🇸 Arkansas, USA',
  '🇺🇸 California, USA', '🇺🇸 Colorado, USA', '🇺🇸 Connecticut, USA', '🇺🇸 Delaware, USA',
  '🇺🇸 Florida, USA', '🇺🇸 Georgia, USA', '🇺🇸 Hawaii, USA', '🇺🇸 Idaho, USA',
  '🇺🇸 Illinois, USA', '🇺🇸 Indiana, USA', '🇺🇸 Iowa, USA', '🇺🇸 Kansas, USA',
  '🇺🇸 Kentucky, USA', '🇺🇸 Louisiana, USA', '🇺🇸 Maine, USA', '🇺🇸 Maryland, USA',
  '🇺🇸 Massachusetts, USA', '🇺🇸 Michigan, USA', '🇺🇸 Minnesota, USA', '🇺🇸 Mississippi, USA',
  '🇺🇸 Missouri, USA', '🇺🇸 Montana, USA', '🇺🇸 Nebraska, USA', '🇺🇸 Nevada, USA',
  '🇺🇸 New Hampshire, USA', '🇺🇸 New Jersey, USA', '🇺🇸 New Mexico, USA', '🇺🇸 New York, USA',
  '🇺🇸 North Carolina, USA', '🇺🇸 North Dakota, USA', '🇺🇸 Ohio, USA', '🇺🇸 Oklahoma, USA',
  '🇺🇸 Oregon, USA', '🇺🇸 Pennsylvania, USA', '🇺🇸 Rhode Island, USA', '🇺🇸 South Carolina, USA',
  '🇺🇸 South Dakota, USA', '🇺🇸 Tennessee, USA', '🇺🇸 Texas, USA', '🇺🇸 Utah, USA',
  '🇺🇸 Vermont, USA', '🇺🇸 Virginia, USA', '🇺🇸 Washington, USA', '🇺🇸 West Virginia, USA',
  '🇺🇸 Wisconsin, USA', '🇺🇸 Wyoming, USA',
  // 🇬🇧 United Kingdom
  '🇬🇧 England, UK', '🇬🇧 Scotland, UK',
  // 🇨🇦 Canada — provinces
  '🇨🇦 Ontario, Canada', '🇨🇦 British Columbia, Canada', '🇨🇦 Alberta, Canada',
  '🇨🇦 Quebec, Canada', '🇨🇦 Manitoba, Canada', '🇨🇦 Saskatchewan, Canada',
  '🇨🇦 Nova Scotia, Canada', '🇨🇦 New Brunswick, Canada',
];

const PLANS = ['Starter Plan', 'Growth Plan', 'Premium Plan', 'Elite Plan'];

const AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000, 50000];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function timeAgo(): string {
  const mins = Math.floor(Math.random() * 8) + 1;
  return mins === 1 ? 'just now' : `${mins} minutes ago`;
}

type Notification = {
  id: number;
  name: string;
  location: string;
  plan: string;
  amount: number;
  time: string;
};

export default function InvestmentPopup() {
  const [visible, setVisible] = useState(false);
  const [notif, setNotif] = useState<Notification | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const showNext = useCallback(() => {
    if (dismissed) return;
    const next: Notification = {
      id: Date.now(),
      name: randomFrom(NAMES),
      location: randomFrom(LOCATIONS),
      plan: randomFrom(PLANS),
      amount: randomFrom(AMOUNTS),
      time: timeAgo(),
    };
    setNotif(next);
    setVisible(true);

    // Auto-hide after 5 seconds
    setTimeout(() => setVisible(false), 5000);
  }, [dismissed]);

  useEffect(() => {
    // First popup after 4 seconds
    const initial = setTimeout(showNext, 4000);

    // Then repeat every 12–20 seconds
    const interval = setInterval(() => {
      const delay = Math.random() * 8000 + 12000;
      setTimeout(showNext, delay);
    }, 20000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [showNext]);

  if (!notif || !visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 max-w-[320px] transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative bg-[#0f1117] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 backdrop-blur-md">
        {/* Close button */}
        <button
          onClick={() => { setVisible(false); setDismissed(true); }}
          className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </button>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#a8810b] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(212,175,55,0.3)]">
            <TrendingUpIcon sx={{ color: 'white', fontSize: 18 }} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name & location */}
            <p className="text-white font-semibold text-sm leading-tight">{notif.name}</p>
            <p className="text-white/40 text-xs">{notif.location}</p>

            {/* Investment detail */}
            <p className="text-white/70 text-xs mt-1.5 leading-relaxed">
              Just invested{' '}
              <span className="text-[#00e676] font-bold">
                ${notif.amount.toLocaleString()}
              </span>{' '}
              in the{' '}
              <span className="text-[#d4af37] font-semibold">{notif.plan}</span>
            </p>

            <p className="text-white/30 text-[11px] mt-1">{notif.time}</p>
          </div>
        </div>

        {/* Progress bar auto-dismiss */}
        <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#d4af37] to-[#a8810b] rounded-full"
            style={{ animation: 'shrink 5s linear forwards' }}
          />
        </div>

        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to   { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
}
