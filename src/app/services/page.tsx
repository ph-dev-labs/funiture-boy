import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services | TrendyTrades',
  description: 'Explore our full suite of crypto trading services including staking, OTC trading, referrals, and portfolio management.',
};

const services = [
  {
    icon: '💎',
    color: '#d4af37',
    title: 'Crypto Staking',
    subtitle: 'Earn up to 18% APY',
    desc: 'Lock your crypto assets and earn passive yield. We stake on your behalf across DeFi protocols, validator nodes, and liquidity pools.',
    features: ['Up to 18% APY', 'Flexible lock periods', 'Multiple coins supported', 'Daily reward claims'],
  },
  {
    icon: '📊',
    color: '#a8810b',
    title: 'Managed Portfolio',
    subtitle: 'Let experts trade for you',
    desc: 'Assign your portfolio to one of our institutional portfolio managers. They actively manage your assets to maximize risk-adjusted returns.',
    features: ['Dedicated fund manager', 'Monthly performance reports', 'Custom risk profile', 'Quarterly rebalancing'],
  },
  {
    icon: '🔄',
    color: '#00e676',
    title: 'OTC Trading',
    subtitle: 'Large volume, zero slippage',
    desc: 'For high-volume traders and institutions. Execute large trades without impacting market prices, with competitive spread rates.',
    features: ['Minimum $50,000 per trade', 'Tight bid-ask spreads', 'Multi-currency settlement', 'White-glove service'],
  },
  {
    icon: '🌐',
    color: '#ff0055',
    title: 'Referral Program',
    subtitle: 'Earn up to 15% commission',
    desc: 'Share TrendyTrades with your network and earn lifetime commissions on every deposit, trade, and investment made by your referrals.',
    features: ['15% deposit commission', 'Lifetime earnings', 'Real-time tracking dashboard', 'Instant payout'],
  },
  {
    icon: '📱',
    color: '#ffea00',
    title: 'Mobile Trading App',
    subtitle: 'Trade from anywhere',
    desc: 'Our mobile-optimized platform lets you monitor positions, execute trades, and manage your portfolio on any device, anytime.',
    features: ['Real-time price alerts', 'Biometric authentication', 'Full dashboard access', 'Push notifications'],
  },
  {
    icon: '🏦',
    color: '#d4af37',
    title: 'Crypto Lending',
    subtitle: 'Use assets as collateral',
    desc: 'Borrow against your crypto holdings without liquidating your position. Access liquidity while maintaining upside exposure.',
    features: ['Up to 70% LTV', 'Competitive interest rates', 'No credit check', 'Instant approval'],
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#0a0b10]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ff0055]/30 bg-[#ff0055]/5 text-[#ff0055] text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff0055] animate-pulse" />
            Full-Service Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            One Platform, <br />
            <span className="text-gradient">All Services</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            TrendyTrades isn&apos;t just a trading platform — it&apos;s a complete financial ecosystem designed to grow and protect your crypto wealth.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((service) => (
            <div key={service.title} className="glass-panel p-7 flex flex-col gap-5 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{service.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-white">{service.title}</h2>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: service.color }}>{service.subtitle}</div>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{service.desc}</p>
              <ul className="space-y-1.5">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <span style={{ color: service.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="mt-auto pt-2 text-sm font-bold transition-colors hover:underline" style={{ color: service.color }}>
                Learn More →
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="glass-panel p-10 md:p-14 text-center" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(168,129,11,0.05))' }}>
          <h2 className="text-3xl font-bold text-white mb-4">Need a Custom Solution?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">For institutional clients, family offices, or high-net-worth individuals with unique requirements, our team offers bespoke arrangements.</p>
          <Link href="/contact" className="inline-block px-10 py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 hover:border-[#d4af37]/50 transition-all">
            Talk to Our Team
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
