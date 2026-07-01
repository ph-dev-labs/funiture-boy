'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type CopyTrade = {
  id: string;
  title: string;
  traderName: string;
  description: string;
  price: number;
  returnRate: string;
  winRate: string;
  minBalance: number;
  active: boolean;
};

type Subscription = {
  id: string;
  copyTradeId: string;
  tradeTitle: string;
  price: number;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  createdAt: any;
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-[#00e676]/10 text-[#00e676]',
  paused: 'bg-yellow-500/10 text-yellow-400',
  expired: 'bg-white/10 text-white/40',
  cancelled: 'bg-[#ff0055]/10 text-[#ff0055]',
};

export default function CopyTradePage() {
  const { user, setUser } = useAuthStore();
  const [trades, setTrades] = useState<CopyTrade[]>([]);
  const [mySubs, setMySubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    fetchData();
  }, [user?.uid]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active copy trade ads
      const tradesSnap = await getDocs(collection(db, 'copyTrades'));
      const active = tradesSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as CopyTrade))
        .filter(t => t.active);
      setTrades(active);

      // Fetch user's own subscriptions
      const subsSnap = await getDocs(query(collection(db, 'copyTradeSubscriptions'), where('uid', '==', user!.uid)));
      setMySubs(subsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subscription)));
    } catch (err) {
      toast.error('Failed to load copy trades');
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = (tradeId: string) => mySubs.some(s => s.copyTradeId === tradeId);

  const handleSubscribe = async (trade: CopyTrade) => {
    if (!user) return;

    if (user.balance < trade.price) {
      toast.error(`Insufficient balance. You need $${trade.price} to subscribe.`);
      return;
    }
    if (trade.minBalance && user.balance < trade.minBalance) {
      toast.error(`Minimum balance of $${trade.minBalance} required.`);
      return;
    }

    setSubscribing(trade.id);
    try {
      // Deduct from user balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-trade.price),
      });

      // Create subscription
      const subRef = await addDoc(collection(db, 'copyTradeSubscriptions'), {
        uid: user.uid,
        userEmail: user.email,
        copyTradeId: trade.id,
        tradeTitle: trade.title,
        price: trade.price,
        status: 'active',
        createdAt: serverTimestamp(),
      });

      // Add transaction record
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        type: 'copy_trade',
        amount: trade.price,
        description: `Copy Trade Subscription: ${trade.title}`,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      // In-app notification (no email)
      await addDoc(collection(db, `users/${user.uid}/notifications`), {
        title: 'Copy Trade Activated 📊',
        message: `You are now subscribed to "${trade.title}". $${trade.price} was deducted from your balance.`,
        type: 'success',
        read: false,
        createdAt: serverTimestamp(),
      });

      // Update local store balance
      setUser({ ...user, balance: user.balance - trade.price });

      setMySubs(prev => [...prev, {
        id: subRef.id,
        copyTradeId: trade.id,
        tradeTitle: trade.title,
        price: trade.price,
        status: 'active',
        createdAt: new Date(),
      }]);

      toast.success(`Subscribed to "${trade.title}"! $${trade.price} deducted from your balance.`);
    } catch (err) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-panel p-6 h-48 animate-pulse bg-white/5 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Copy Trading</h1>
        <p className="text-white/50 text-sm">Mirror expert traders automatically. Subscribe to a strategy and earn passively.</p>
      </div>

      {/* Active Trade Ads */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Available Strategies</h2>
        {trades.length === 0 && (
          <div className="glass-panel p-10 text-center text-white/40">
            <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <p className="mt-3">No copy trade strategies available yet. Check back soon.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {trades.map(trade => {
            const subscribed = isSubscribed(trade.id);
            return (
              <div key={trade.id} className={`glass-panel p-6 flex flex-col gap-4 border-l-4 transition-all ${subscribed ? 'border-[#00e676]' : 'border-[#d4af37]'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white">{trade.title}</div>
                    <div className="text-white/40 text-xs mt-0.5">by {trade.traderName}</div>
                  </div>
                  {subscribed && (
                    <span className="flex items-center gap-1 text-xs font-medium text-[#00e676] bg-[#00e676]/10 px-2 py-0.5 rounded-full">
                      <CheckCircleIcon sx={{ fontSize: 12 }} /> Subscribed
                    </span>
                  )}
                </div>

                <p className="text-white/50 text-sm leading-relaxed flex-1">{trade.description}</p>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-[#00e676] font-bold text-sm">{trade.returnRate}</div>
                    <div className="text-white/30 text-[10px] uppercase mt-0.5">Avg Return</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-[#d4af37] font-bold text-sm">{trade.winRate}</div>
                    <div className="text-white/30 text-[10px] uppercase mt-0.5">Win Rate</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-white font-bold text-sm">${trade.price}</div>
                    <div className="text-white/30 text-[10px] uppercase mt-0.5">Price</div>
                  </div>
                </div>

                {trade.minBalance > 0 && (
                  <p className="text-white/30 text-xs">Min. balance: ${trade.minBalance.toLocaleString()}</p>
                )}

                <button
                  disabled={subscribed || subscribing === trade.id}
                  onClick={() => handleSubscribe(trade)}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                    subscribed
                      ? 'bg-[#00e676]/10 text-[#00e676] cursor-default'
                      : subscribing === trade.id
                      ? 'bg-white/10 text-white/40 cursor-wait'
                      : 'bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white hover:opacity-90 shadow-lg shadow-[#d4af37]/20'
                  }`}
                >
                  {subscribed ? 'Already Subscribed' : subscribing === trade.id ? 'Processing...' : `Subscribe — $${trade.price}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Subscriptions */}
      {mySubs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">My Subscriptions</h2>
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">Strategy</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">Price Paid</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">Date</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {mySubs.map(s => (
                  <tr key={s.id} className="border-b border-white/5">
                    <td className="px-5 py-3 text-white font-medium">{s.tradeTitle}</td>
                    <td className="px-5 py-3 text-[#d4af37] font-semibold">${s.price}</td>
                    <td className="px-5 py-3 text-white/50 text-xs">
                      {s.createdAt?.toDate ? new Date(s.createdAt.toDate()).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[s.status] || 'bg-white/10 text-white/50'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
