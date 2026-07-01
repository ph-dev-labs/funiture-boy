import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import InvestmentPopup from '@/components/landing/InvestmentPopup';
import type { Metadata } from 'next';
import CheckIcon from '@mui/icons-material/Check';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Platform Features | TrendyTrades',
  description: 'Explore the powerful features that make TrendyTrades the top choice for institutional crypto traders.',
};

const features = [
  {
    category: 'Trading',
    icon: '📈',
    color: '#d4af37',
    items: [
      { title: 'Spot & Derivatives Trading', desc: 'Access 300+ trading pairs across spot, futures, and options markets with institutional-grade liquidity.' },
      { title: 'Advanced Order Types', desc: 'Market, limit, stop-loss, trailing stop, OCO, and conditional orders for precise execution.' },
      { title: 'Real-Time Charting', desc: 'Professional TradingView charts with 100+ technical indicators, drawing tools, and multi-timeframe views.' },
      { title: 'Low Latency Execution', desc: 'Sub-millisecond order execution with co-location services across 5 global data centers.' },
    ],
  },
  {
    category: 'Investment Plans',
    icon: '💰',
    color: '#a8810b',
    items: [
      { title: 'Daily ROI Payouts', desc: 'Earn 1.5% to 5% daily returns automatically credited to your account every 24 hours.' },
      { title: 'Flexible Plans', desc: 'Four tiers from Starter ($100+) to Elite ($50,000+), each with increasing returns.' },
      { title: 'Auto-Compounding', desc: 'Reinvest your daily profits automatically to accelerate portfolio growth exponentially.' },
      { title: 'Capital Protection', desc: 'Your principal is secured with institutional-grade risk management and insurance protocols.' },
    ],
  },
  {
    category: 'Copy Trading',
    icon: '🤖',
    color: '#00e676',
    items: [
      { title: 'Expert Trader Marketplace', desc: 'Browse 50+ verified expert traders with audited performance records dating back years.' },
      { title: 'One-Click Copy', desc: 'Mirror any trader\'s portfolio with one click. Proportional position sizing based on your balance.' },
      { title: 'Real-Time Sync', desc: 'Every trade, every position change — synced to your account in real time, automatically.' },
      { title: 'Risk Controls', desc: 'Set max loss limits, stop-copy thresholds, and position limits to manage your exposure.' },
    ],
  },
  {
    category: 'Security',
    icon: '🔐',
    color: '#ff0055',
    items: [
      { title: 'Multi-Factor Authentication', desc: 'OTP-based 2FA on every login and transaction. Email + authenticator app support.' },
      { title: 'Cold Storage', desc: '95% of user assets held in air-gapped cold storage wallets, never connected to the internet.' },
      { title: 'KYC Verification', desc: 'Full KYC/AML compliance with identity verification to protect all users from fraud.' },
      { title: 'SSL Encryption', desc: '256-bit SSL encryption on all API endpoints, data at rest, and user communications.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#0a0b10]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            Everything You Need
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Powerful Features for <br />
            <span className="text-gradient">Elite Investors</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            From advanced trading tools to automated copy trading — TrendyTrades gives you every edge you need to grow your crypto portfolio.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-16">
          {features.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">{group.icon}</span>
                <h2 className="text-2xl font-bold text-white">{group.category}</h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {group.items.map((item) => (
                  <div key={item.title} className="glass-panel p-6 flex gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${group.color}15` }}>
                      <CheckIcon sx={{ fontSize: 16, color: group.color }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20 glass-panel p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience It?</h2>
          <p className="text-white/60 mb-8">Join 180,000+ investors already growing with TrendyTrades.</p>
          <Link href="/auth/register" className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-lg hover:opacity-90 transition-all shadow-2xl shadow-[#d4af37]/20">
            Get Started Free
          </Link>
        </div>
      </div>
      <Footer />
      <InvestmentPopup />
    </main>
  );
}
