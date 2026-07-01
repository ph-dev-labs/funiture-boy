'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';

type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'copy_trade';
  amount: number;
  status: string;
  date: any;
  description: string;
};

const TYPE_CONFIG = {
  deposit: {
    label: 'Deposit',
    color: '#d4af37',
    icon: <CallReceivedIcon sx={{ fontSize: 18 }} />,
    sign: '+',
  },
  withdrawal: {
    label: 'Withdrawal',
    color: '#ff1744',
    icon: <CallMadeIcon sx={{ fontSize: 18 }} />,
    sign: '-',
  },
  profit: {
    label: 'Profit',
    color: '#00e676',
    icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
    sign: '+',
  },
  investment: {
    label: 'Investment',
    color: '#a78bfa',
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
    sign: '-',
  },
  copy_trade: {
    label: 'Copy Trade',
    color: '#38bdf8',
    icon: <ContentCopyIcon sx={{ fontSize: 18 }} />,
    sign: '-',
  },
};

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Transaction['type']>('all');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const uid = user!.uid;
      const results: Transaction[] = [];

      // 1. Deposits
      const depSnap = await getDocs(query(collection(db, 'deposits'), where('uid', '==', uid)));
      depSnap.forEach((d) => {
        const data = d.data();
        results.push({
          id: d.id,
          type: 'deposit',
          amount: data.amount,
          status: data.status,
          date: data.createdAt,
          description: `Deposit via ${data.asset || 'crypto'}`,
        });
      });

      // 2. Withdrawals
      const withSnap = await getDocs(query(collection(db, 'withdrawals'), where('uid', '==', uid)));
      withSnap.forEach((d) => {
        const data = d.data();
        results.push({
          id: d.id,
          type: 'withdrawal',
          amount: data.amount,
          status: data.status,
          date: data.createdAt,
          description: `Withdrawal to ${data.network || 'wallet'}`,
        });
      });

      // 3. Unified transactions (profit, investment, copy_trade)
      const txSnap = await getDocs(query(collection(db, 'transactions'), where('uid', '==', uid)));
      txSnap.forEach((d) => {
        const data = d.data();
        const type = (data.type as Transaction['type']) || 'profit';
        results.push({
          id: d.id,
          type,
          amount: data.amount,
          status: data.status || 'completed',
          date: data.createdAt,
          description: data.description || 'Transaction',
        });
      });

      // 4. Copy trade subscriptions (in case written before unified transactions)
      const ctSnap = await getDocs(query(collection(db, 'copyTradeSubscriptions'), where('uid', '==', uid)));
      ctSnap.forEach((d) => {
        const data = d.data();
        // Avoid duplicate if already logged to transactions collection
        const alreadyExists = results.some(
          r => r.type === 'copy_trade' && r.description.includes(data.tradeTitle)
        );
        if (!alreadyExists) {
          results.push({
            id: `ct-${d.id}`,
            type: 'copy_trade',
            amount: data.price,
            status: data.status || 'active',
            date: data.createdAt,
            description: `Copy Trade Subscription: ${data.tradeTitle}`,
          });
        }
      });

      // 5. Sort by date descending
      results.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return (b.date.seconds || 0) - (a.date.seconds || 0);
      });

      setTransactions(results);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchHistory();
  }, [user?.uid]);

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  const FILTERS: Array<{ key: 'all' | Transaction['type']; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'deposit', label: 'Deposits' },
    { key: 'withdrawal', label: 'Withdrawals' },
    { key: 'profit', label: 'Profits' },
    { key: 'investment', label: 'Investments' },
    { key: 'copy_trade', label: 'Copy Trade' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Transaction History</h1>
        <p className="text-white/50 text-sm">Every money movement in your account.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f.key
                ? 'bg-[#d4af37] text-black'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className="ml-1.5 opacity-60">
                ({transactions.filter(t => t.type === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/50 flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mb-4" />
            Loading history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <ShowChartIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.1)' }} />
            <p className="text-white/40 text-sm">No transactions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((tx) => {
              const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.profit;
              const dateStr = tx.date?.seconds
                ? new Date(tx.date.seconds * 1000).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })
                : '—';

              return (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${cfg.color}18`, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm mb-0.5">{cfg.label}</div>
                      <div className="text-xs text-white/40">{tx.description}</div>
                      <div className="text-[10px] text-white/25 mt-0.5">{dateStr}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm mb-0.5" style={{ color: cfg.color }}>
                      {cfg.sign}${tx.amount?.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        tx.status === 'completed' || tx.status === 'approved' || tx.status === 'active'
                          ? 'bg-[#00e676]'
                          : tx.status === 'pending'
                          ? 'bg-[#ffea00]'
                          : 'bg-[#ff1744]'
                      }`} />
                      <span className="text-xs text-white/40 capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
