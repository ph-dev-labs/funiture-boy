'use client';

import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { query, orderBy, limit, getDocs } from 'firebase/firestore';

type Tx = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'investment' | 'copy_trade';
  amount: number;
  status: string;
  description: string;
  date: any;
  userEmail?: string;
};

// ── Tx Icon ───────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Tx }) {
  const colors = {
    deposit: { bg: 'bg-[#00e676]/10', text: 'text-[#00e676]', icon: <CallReceivedIcon sx={{ fontSize: 16 }} />, label: 'Deposit' },
    withdrawal: { bg: 'bg-[#ff1744]/10', text: 'text-[#ff1744]', icon: <CallMadeIcon sx={{ fontSize: 16 }} />, label: 'Withdrawal' },
    profit: { bg: 'bg-[#d4af37]/10', text: 'text-[#d4af37]', icon: <ShowChartIcon sx={{ fontSize: 16 }} />, label: 'Profit' },
    investment: { bg: 'bg-[#9c27b0]/10', text: 'text-[#9c27b0]', icon: <ShowChartIcon sx={{ fontSize: 16 }} />, label: 'Investment' },
    copy_trade: { bg: 'bg-[#2196f3]/10', text: 'text-[#2196f3]', icon: <ShowChartIcon sx={{ fontSize: 16 }} />, label: 'Copy Trade' },
  };
  const c = colors[tx.type] || colors.deposit;
  const dateStr = tx.date?.seconds
    ? new Date(tx.date.seconds * 1000).toLocaleDateString()
    : '—';
    
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
      <div className={`w-8 h-8 rounded-full ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
        {c.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">{tx.description}</div>
        <div className="text-xs text-white/40">{tx.userEmail || 'Unknown User'} • {dateStr}</div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-sm font-bold ${tx.type === 'withdrawal' || tx.type === 'investment' || tx.type === 'copy_trade' ? 'text-[#ff1744]' : 'text-[#00e676]'}`}>
          {tx.type === 'withdrawal' || tx.type === 'investment' || tx.type === 'copy_trade' ? '-' : '+'}${tx.amount.toFixed(2)}
        </div>
        <div className={`text-xs capitalize ${tx.status === 'completed' || tx.status === 'approved' ? 'text-[#00e676]' : tx.status === 'pending' ? 'text-[#ffea00]' : 'text-white/40'}`}>
          {tx.status}
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState({
    users: 0,
    deposits: 0,
    investments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [txList, setTxList] = useState<Tx[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [runningCron, setRunningCron] = useState(false);

  const handleRunCron = async () => {
    if (confirm('Are you sure you want to distribute daily profits to all active investments now?')) {
      setRunningCron(true);
      try {
        const res = await fetch('/api/admin/trigger-cron', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Success! Distributed profits to ${data.processed} investments.`);
          // Optionally refresh tx list
          window.location.reload();
        } else {
          toast.error(data.error || 'Failed to distribute profits.');
        }
      } catch (err) {
        toast.error('Failed to trigger cron');
      } finally {
        setRunningCron(false);
      }
    }
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const depositsSnap = await getCountFromServer(collection(db, 'deposits'));
        const investmentsSnap = await getCountFromServer(collection(db, 'investments'));
        
        setStats({
          users: usersSnap.data().count,
          deposits: depositsSnap.data().count,
          investments: investmentsSnap.data().count,
        });
      } catch (err) {
        console.error('Error fetching admin stats', err);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchRecentTx() {
      try {
        const results: Tx[] = [];
        
        // Let's get global transactions (deposits, withdrawals, profits, etc)
        const collections = [
          { col: 'deposits', type: 'deposit', desc: (d: any) => `Deposit via ${d.asset || 'crypto'}` },
          { col: 'withdrawals', type: 'withdrawal', desc: (d: any) => `Withdrawal to ${d.network || 'wallet'}` },
          { col: 'transactions', type: 'profit', desc: (d: any) => d.description || 'System Transaction' },
        ] as const;

        // Fetch users map for emails
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersMap: Record<string, string> = {};
        usersSnap.forEach(u => usersMap[u.id] = u.data().email || 'Unknown User');

        for (const { col, type, desc } of collections) {
          const q = query(
            collection(db, col),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const snap = await getDocs(q);
          snap.forEach(doc => {
            const d = doc.data();
            results.push({
              id: doc.id,
              type: d.type || type,
              amount: d.amount,
              status: d.status || 'completed',
              description: desc(d),
              date: d.createdAt,
              userEmail: usersMap[d.uid] || 'Unknown User'
            });
          });
        }

        results.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
        setTxList(results.slice(0, 10)); // Top 10 globally
      } catch (err) {
        console.error('Error fetching global txs', err);
      } finally {
        setTxLoading(false);
      }
    }
    
    fetchStats();
    fetchRecentTx();
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Overview</h1>
          <p className="text-white/50 text-sm">High-level metrics for TrendyTrades platform.</p>
        </div>
        <button
          onClick={handleRunCron}
          disabled={runningCron}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00e676]/20 text-[#00e676] font-bold text-sm shadow-lg hover:bg-[#00e676]/30 transition-all disabled:opacity-50"
        >
          <PlayArrowIcon sx={{ fontSize: 18 }} />
          {runningCron ? 'Running...' : 'Distribute Profits Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border-l-4 border-[#ff0055]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#ff0055]/10 flex items-center justify-center text-[#ff0055]">
              <PeopleIcon />
            </div>
          </div>
          <div className="text-white/50 text-sm font-medium mb-1">Total Users</div>
          <div className="text-3xl font-bold text-white">
            {loading ? '...' : stats.users}
          </div>
        </div>

        <div className="glass-panel p-6 border-l-4 border-[#d4af37]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
              <ReceiptLongIcon />
            </div>
          </div>
          <div className="text-white/50 text-sm font-medium mb-1">Total Deposits</div>
          <div className="text-3xl font-bold text-white">
            {loading ? '...' : stats.deposits}
          </div>
        </div>

        <div className="glass-panel p-6 border-l-4 border-[#a8810b]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#a8810b]/10 flex items-center justify-center text-[#a8810b]">
              <AccountBalanceIcon />
            </div>
          </div>
          <div className="text-white/50 text-sm font-medium mb-1">Active Investments</div>
          <div className="text-3xl font-bold text-white">
            {loading ? '...' : stats.investments}
          </div>
        </div>
      </div>
      
      {/* Global Recent Transactions */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Global Recent Transactions</h3>
          <span className="text-xs text-white/40">Across all users</span>
        </div>

        {txLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : txList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-3">
              <ShowChartIcon />
            </div>
            <p className="text-white/40 text-sm">No global transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {txList.map(tx => <TxRow key={tx.id} tx={tx} />)}
          </div>
        )}
      </div>
    </div>
  );
}
