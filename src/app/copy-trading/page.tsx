import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Copy Trading | TrendyTrades',
  description: 'Copy the trades of expert institutional traders automatically. Earn passively without watching charts.',
};

const traders = [
  { initials: 'JP', name: 'Jordan Park', strategy: 'DeFi & Altcoins', roi: '+27.8%', copiers: 1839, rating: 4.8, badge: 'Top Performer' },
  { initials: 'SC', name: 'Sofia Chen', strategy: 'Arbitrage & Scalp', roi: '+21.1%', copiers: 1201, rating: 4.7, badge: 'Verified Expert' },
  { initials: 'MR', name: 'Marcus Rivera', strategy: 'BTC Long Strategy', roi: '+18.4%', copiers: 3022, rating: 4.9, badge: 'Most Copied' },
  { initials: 'AK', name: 'Aiko Kimura', strategy: 'Options & Hedging', roi: '+15.9%', copiers: 876, rating: 4.6, badge: 'Risk Manager' },
  { initials: 'LO', name: 'Liam O\'Brien', strategy: 'Momentum Trading', roi: '+23.5%', copiers: 2140, rating: 4.8, badge: 'High Return' },
  { initials: 'FN', name: 'Fatima Ndiaye', strategy: 'Layer-1 Ecosystem', roi: '+19.7%', copiers: 1456, rating: 4.7, badge: 'Consistent' },
];

const steps = [
  { step: '01', title: 'Create Your Account', desc: 'Register and complete KYC verification in under 5 minutes.' },
  { step: '02', title: 'Fund Your Wallet', desc: 'Deposit crypto via BTC, ETH, USDT, or BNB to your trading wallet.' },
  { step: '03', title: 'Choose an Expert', desc: 'Browse our verified trader marketplace and review performance stats.' },
  { step: '04', title: 'Start Copying', desc: 'Click Copy and every trade they make is automatically mirrored to your account.' },
];

export default function CopyTradingPage() {
  return (
    <main className="min-h-screen bg-[#0a0b10]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00e676]/30 bg-[#00e676]/5 text-[#00e676] text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            Automated Wealth Building
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Copy Expert Traders.<br />
            <span className="text-gradient">Earn While You Sleep.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Our copy trading engine automatically mirrors the positions of top-performing institutional traders in real-time. No charts. No stress. Just passive earnings.
          </p>
          <Link href="/auth/register" className="inline-block mt-8 px-10 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-lg hover:opacity-90 transition-all shadow-2xl shadow-[#d4af37]/20">
            Start Copy Trading Free
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: '+28%', label: 'Avg Monthly Return' },
            { val: '12K+', label: 'Active Copiers' },
            { val: '50+', label: 'Expert Traders' },
            { val: '94.3%', label: 'Win Rate' },
          ].map((s) => (
            <div key={s.label} className="glass-panel p-5 text-center">
              <div className="text-3xl font-black text-gradient mb-1">{s.val}</div>
              <div className="text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How Copy Trading Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <div key={step.step} className="glass-panel p-6 relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 text-white/20 text-2xl">›</div>
                )}
                <div className="text-4xl font-black text-gradient mb-3">{step.step}</div>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Expert Traders */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Top Expert Traders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {traders.map((trader) => (
              <div key={trader.name} className="glass-panel p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a8810b] to-[#d4af37] flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {trader.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">{trader.name}</div>
                    <div className="text-white/40 text-xs truncate">{trader.strategy}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/10 text-[#d4af37] shrink-0">{trader.badge}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-black text-[#00e676]">{trader.roi}</div>
                    <div className="text-xs text-white/40">Monthly Return</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{trader.copiers.toLocaleString()}</div>
                    <div className="text-xs text-white/40">Copiers</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#ffea00]">⭐ {trader.rating}</div>
                    <div className="text-xs text-white/40">Rating</div>
                  </div>
                </div>
                <Link href="/auth/register" className="w-full py-2.5 rounded-xl text-center font-bold text-sm text-white bg-gradient-to-r from-[#a8810b]/60 to-[#d4af37]/60 hover:from-[#a8810b] hover:to-[#d4af37] transition-all">
                  Copy This Trader
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
