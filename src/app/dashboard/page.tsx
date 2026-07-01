'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// ── Types ─────────────────────────────────────────────────────────
type Tx = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit';
  amount: number;
  status: string;
  description: string;
  date: any;
};

type CryptoData = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  sparkline: { t: string; v: number }[];
  color: string;
};

// ── Sparkline Tooltip ─────────────────────────────────────────────
function SparkTooltip({ active, payload }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-black/80 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
        ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    );
  }
  return null;
}

// ── Crypto Card ───────────────────────────────────────────────────
function CryptoCard({ coin }: { coin: CryptoData }) {
  const isUp = coin.change >= 0;
  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-white text-sm">{coin.symbol}</div>
          <div className="text-white/40 text-xs">{coin.name}</div>
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isUp ? 'bg-[#00e676]/10 text-[#00e676]' : 'bg-[#ff1744]/10 text-[#ff1744]'}`}>
          {isUp ? <TrendingUpIcon sx={{ fontSize: 13 }} /> : <TrendingDownIcon sx={{ fontSize: 13 }} />}
          {isUp ? '+' : ''}{coin.change.toFixed(2)}%
        </div>
      </div>
      <div className="text-xl font-bold text-white">
        ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={coin.sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${coin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? '#00e676' : '#ff1744'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isUp ? '#00e676' : '#ff1744'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip content={<SparkTooltip />} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={isUp ? '#00e676' : '#ff1744'}
              strokeWidth={1.5}
              fill={`url(#grad-${coin.symbol})`}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Tx Icon ───────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Tx }) {
  const colors = {
    deposit: { bg: 'bg-[#00e676]/10', text: 'text-[#00e676]', icon: <CallReceivedIcon sx={{ fontSize: 16 }} />, label: 'Deposit' },
    withdrawal: { bg: 'bg-[#ff1744]/10', text: 'text-[#ff1744]', icon: <CallMadeIcon sx={{ fontSize: 16 }} />, label: 'Withdrawal' },
    profit: { bg: 'bg-[#d4af37]/10', text: 'text-[#d4af37]', icon: <ShowChartIcon sx={{ fontSize: 16 }} />, label: 'Profit' },
  };
  const c = colors[tx.type];
  const dateStr = tx.date?.seconds
    ? new Date(tx.date.seconds * 1000).toLocaleDateString()
    : '—';
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`w-8 h-8 rounded-full ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
        {c.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">{tx.description}</div>
        <div className="text-xs text-white/40">{dateStr}</div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-sm font-bold ${tx.type === 'withdrawal' ? 'text-[#ff1744]' : 'text-[#00e676]'}`}>
          {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toFixed(2)}
        </div>
        <div className={`text-xs capitalize ${tx.status === 'completed' || tx.status === 'approved' ? 'text-[#00e676]' : tx.status === 'pending' ? 'text-[#ffea00]' : 'text-white/40'}`}>
          {tx.status}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function DashboardOverview() {
  const { user } = useAuthStore();
  const balance = user?.balance || 0;
  const tradingProfit = user?.tradingProfit || 0;
  const totalEarned = tradingProfit + (user?.stakingProfit || 0);

  const [txList, setTxList] = useState<Tx[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [profitChartData, setProfitChartData] = useState<{ date: string; value: number }[]>([]);
  const [chartType, setChartType] = useState<'balance' | 'profit'>('balance');

  // ── Fetch recent transactions ──────────────────────────────────
  const fetchTx = useCallback(async () => {
    if (!user?.uid) return;
    setTxLoading(true);
    try {
      const results: Tx[] = [];
      const collections = [
        { col: 'deposits', type: 'deposit', desc: (d: any) => `Deposit via ${d.asset || 'crypto'}` },
        { col: 'withdrawals', type: 'withdrawal', desc: (d: any) => `Withdrawal to ${d.network || 'wallet'}` },
        { col: 'transactions', type: 'profit', desc: (d: any) => d.description || 'Profit distribution' },
      ] as const;

      for (const { col, type, desc } of collections) {
        const q = query(
          collection(db, col),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        snap.forEach(doc => {
          const d = doc.data();
          results.push({
            id: doc.id,
            type,
            amount: d.amount,
            status: d.status || 'completed',
            description: desc(d),
            date: d.createdAt,
          });
        });
      }

      results.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
      setTxList(results.slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  }, [user?.uid, balance]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const fetchChartData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const uid = user.uid;
      const allResults: { amount: number; type: string; date: any }[] = [];

      const chartSources = [
        { col: 'deposits', type: 'deposit' },
        { col: 'withdrawals', type: 'withdrawal' },
        { col: 'transactions', type: 'profit' },
      ] as const;

      for (const { col, type } of chartSources) {
        const q = query(collection(db, col), where('uid', '==', uid));
        const snap = await getDocs(q);
        snap.forEach(d => {
          const data = d.data();
          if (!data.status || data.status === 'completed' || data.status === 'approved') {
            allResults.push({ amount: data.amount ?? 0, type: data.type || type, date: data.createdAt });
          }
        });
      }

      // Sort oldest → newest in JS
      allResults.sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0));

      let runningBalance = 0;
      let runningProfit = 0;
      const balancePoints: { date: string; value: number }[] = [];
      const profitPoints: { date: string; value: number }[] = [];
      
      for (const tx of allResults) {
        // Balance calculation
        if (tx.type === 'withdrawal' || tx.type === 'investment' || tx.type === 'copy_trade') {
          runningBalance -= tx.amount;
        } else {
          runningBalance += tx.amount;
        }
        
        // Profit calculation
        if (tx.type === 'profit') {
          runningProfit += tx.amount;
        }
        
        const d = tx.date?.seconds ? new Date(tx.date.seconds * 1000) : new Date();
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        balancePoints.push({
          date: dateStr,
          value: parseFloat(Math.max(0, runningBalance).toFixed(2)),
        });
        
        profitPoints.push({
          date: dateStr,
          value: parseFloat(Math.max(0, runningProfit).toFixed(2)),
        });
      }

      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      balancePoints.push({ date: today, value: parseFloat((user.balance || 0).toFixed(2)) });
      profitPoints.push({ date: today, value: parseFloat((user.tradingProfit || 0).toFixed(2)) });

      // Deduplicate balance
      const balanceMap = new Map<string, number>();
      for (const p of balancePoints) balanceMap.set(p.date, p.value);
      const finalBalanceChart = Array.from(balanceMap.entries()).map(([date, value]) => ({ date, value }));
      if (finalBalanceChart.length === 1) finalBalanceChart.unshift({ date: 'Start', value: 0 });
      setChartData(finalBalanceChart);

      // Deduplicate profit
      const profitMap = new Map<string, number>();
      for (const p of profitPoints) profitMap.set(p.date, p.value);
      const finalProfitChart = Array.from(profitMap.entries()).map(([date, value]) => ({ date, value }));
      if (finalProfitChart.length === 1) finalProfitChart.unshift({ date: 'Start', value: 0 });
      setProfitChartData(finalProfitChart);

    } catch (err) {
      console.error('Chart fetch error:', err);
    }
  }, [user?.uid, balance, user?.tradingProfit]); // re-runs when balance or profit changes

  useEffect(() => { fetchChartData(); }, [fetchChartData]);

  // ── Fetch crypto prices from CoinGecko (free, no key) ──────────
  useEffect(() => {
    const COINS = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627eea' },
      { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#9945ff' },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', color: '#f3ba2f' },
    ];

    async function loadCryptos() {
      try {
        const ids = COINS.map(c => c.id).join(',');
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h&order=market_cap_desc`,
          { next: { revalidate: 60 } } as any
        );
        const data = await res.json();
        const mapped: CryptoData[] = data.map((item: any) => {
          const coinMeta = COINS.find(c => c.id === item.id)!;
          const raw: number[] = item.sparkline_in_7d?.price || [];
          // downsample to ~30 points for perf
          const step = Math.max(1, Math.floor(raw.length / 30));
          const sparkline = raw
            .filter((_: number, i: number) => i % step === 0)
            .map((v: number, i: number) => ({ t: `${i}`, v: parseFloat(v.toFixed(2)) }));
          return {
            symbol: coinMeta.symbol,
            name: coinMeta.name,
            price: item.current_price,
            change: item.price_change_percentage_24h || 0,
            sparkline,
            color: coinMeta.color,
          };
        });
        setCryptos(mapped);
      } catch {
        // silently fail if CoinGecko rate-limits
      }
    }

    loadCryptos();
    const interval = setInterval(loadCryptos, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Trader'} 👋
          </h1>
          <p className="text-white/50 text-sm">Here&apos;s your portfolio overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/deposit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#d4af37]/20"
          >
            <CallReceivedIcon sx={{ fontSize: 16 }} /> Deposit
          </Link>
          <Link
            href="/dashboard/withdraw"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all"
          >
            <CallMadeIcon sx={{ fontSize: 16 }} /> Withdraw
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 80 }} />
          </div>
          <div className="text-white/50 text-sm font-medium mb-2">Total Balance</div>
          <div className="text-4xl font-bold text-white mb-2">${balance.toFixed(2)}</div>
          <div className="text-[#00e676] text-sm flex items-center gap-1">
            <TrendingUpIcon sx={{ fontSize: 16 }} /> Available for investment
          </div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShowChartIcon sx={{ fontSize: 80 }} />
          </div>
          <div className="text-white/50 text-sm font-medium mb-2">Total Profit</div>
          <div className="text-4xl font-bold text-[#d4af37] mb-2">${totalEarned.toFixed(2)}</div>
          <div className="text-white/40 text-sm">From all active plans</div>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-white/50 text-sm font-medium mb-2">Quick Actions</div>
            <div className="flex flex-col gap-2 mt-3">
              <Link href="/dashboard/invest" className="flex items-center gap-2 text-sm text-white hover:text-[#d4af37] transition-colors">
                <span className="w-5 h-5 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-xs flex items-center justify-center">1</span>
                Explore investment plans
              </Link>
              <Link href="/dashboard/transactions" className="flex items-center gap-2 text-sm text-white hover:text-[#a8810b] transition-colors">
                <span className="w-5 h-5 rounded-full bg-[#a8810b]/10 text-[#a8810b] text-xs flex items-center justify-center">2</span>
                View all transactions
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-2 text-sm text-white hover:text-[#00e676] transition-colors">
                <span className="w-5 h-5 rounded-full bg-[#00e676]/10 text-[#00e676] text-xs flex items-center justify-center">3</span>
                Complete KYC verification
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Chart */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Portfolio Performance</h2>
            <p className="text-white/40 text-xs mt-0.5">Based on your confirmed transactions</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Toggle */}
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
              <button 
                onClick={() => setChartType('balance')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chartType === 'balance' ? 'bg-[#d4af37] text-black' : 'text-white/50 hover:text-white'}`}
              >
                Balance
              </button>
              <button 
                onClick={() => setChartType('profit')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chartType === 'profit' ? 'bg-[#00e676] text-black' : 'text-white/50 hover:text-white'}`}
              >
                Profit
              </button>
            </div>
            
            {/* Stat Bubble */}
            {(chartType === 'balance' ? chartData : profitChartData).length >= 2 ? (() => {
              const activeData = chartType === 'balance' ? chartData : profitChartData;
              const first = activeData[0].value;
              const last = activeData[activeData.length - 1].value;
              const pct = first === 0 ? (last > 0 ? 100 : 0) : (((last - first) / first) * 100);
              const isUp = pct >= 0;
              return (
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${isUp ? 'bg-[#00e676]/10 text-[#00e676]' : 'bg-[#ff1744]/10 text-[#ff1744]'}`}>
                  {isUp ? '+' : ''}{pct.toFixed(1)}% Overall
                </span>
              );
            })() : null}
          </div>
        </div>
        <div className="h-[250px] w-full">
          {(chartType === 'balance' ? chartData : profitChartData).length < 2 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm gap-2">
              <ShowChartIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              <span>No transaction history yet</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartType === 'balance' ? chartData : profitChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartType === 'balance' ? '#d4af37' : '#00e676'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartType === 'balance' ? '#d4af37' : '#00e676'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#ffffff30" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: chartType === 'balance' ? '#d4af37' : '#00e676' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, chartType === 'balance' ? 'Balance' : 'Profit']}
                />
                <Area type="monotone" dataKey="value" stroke={chartType === 'balance' ? '#d4af37' : '#00e676'} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" dot={false} activeDot={{ r: 4, fill: chartType === 'balance' ? '#d4af37' : '#00e676' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>


      {/* Crypto Market */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Live Crypto Market</h2>
          <span className="text-xs text-white/30">Updates every 60s</span>
        </div>
        {cryptos.length === 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-panel p-4 h-36 animate-pulse bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cryptos.map(coin => <CryptoCard key={coin.symbol} coin={coin} />)}
          </div>
        )}
      </div>

      {/* Recent Transactions + Copy Trading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-xs text-[#d4af37] hover:underline">
              View All
            </Link>
          </div>

          {txLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : txList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-3">
                <ShowChartIcon />
              </div>
              <p className="text-white/40 text-sm">No transactions yet.</p>
              <Link href="/dashboard/deposit" className="mt-2 text-xs text-[#d4af37] hover:underline">Make your first deposit</Link>
            </div>
          ) : (
            <div>
              {txList.map(tx => <TxRow key={tx.id} tx={tx} />)}
            </div>
          )}
        </div>

        <div className="glass-panel p-6 border-l-4 border-[#a8810b] flex flex-col justify-between">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#a8810b]/10 flex items-center justify-center shrink-0">
              <ContentCopyIcon sx={{ color: '#a8810b' }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Copy Trading Active</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Mirror the exact trades of our top institutional traders automatically. Earn passively without monitoring the charts.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Win Rate', val: '94.3%', color: '#00e676' },
              { label: 'Avg Monthly Return', val: '+28%', color: '#d4af37' },
              { label: 'Active Traders', val: '12,400+', color: '#a8810b' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-white/60">{s.label}</span>
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/invest"
            className="mt-6 inline-block text-center px-5 py-2.5 rounded-lg bg-[#a8810b]/20 text-[#a8810b] font-medium text-sm hover:bg-[#a8810b]/30 transition-colors"
          >
            Browse Investment Plans →
          </Link>
        </div>
      </div>
    </div>
  );
}
