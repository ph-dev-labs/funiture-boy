import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import InvestmentPopup from '@/components/landing/InvestmentPopup';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Investment Plans | TrendyTrades',
  description: 'Choose from four powerful investment plans. Earn daily ROI from 1.5% to 5% with capital protection.',
};

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    min: 100, max: 999,
    roi: '1.5%',
    duration: '30 days',
    color: '#d4af37',
    shadow: 'rgba(212,175,55,0.2)',
    features: ['Daily profit payouts', 'Basic copy trading access', 'Email & chat support', 'Capital returned at maturity', 'Real-time dashboard', 'OTP security'],
  },
  {
    id: 'growth',
    name: 'Growth',
    min: 1000, max: 9999,
    roi: '2.5%',
    duration: '45 days',
    color: '#a8810b',
    shadow: 'rgba(168,129,11,0.2)',
    popular: true,
    features: ['Daily profit payouts', 'Full copy trading access', 'Priority support', 'Auto-compounding option', 'Advanced analytics', 'Portfolio manager'],
  },
  {
    id: 'premium',
    name: 'Premium',
    min: 10000, max: 49999,
    roi: '3.5%',
    duration: '60 days',
    color: '#00e676',
    shadow: 'rgba(0,230,118,0.2)',
    features: ['Daily profit payouts', 'VIP copy trading access', '24/7 dedicated support', 'Risk management tools', 'Early withdrawal option', 'Institutional research'],
  },
  {
    id: 'elite',
    name: 'Elite',
    min: 50000, max: null,
    roi: '5.0%',
    duration: '90 days',
    color: '#ff0055',
    shadow: 'rgba(255,0,85,0.2)',
    features: ['Hourly profit payouts', 'Elite desk access', 'Personal account manager', 'Custom trading strategies', 'Concierge withdrawals', 'Tax optimization reports'],
  },
];

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-[#0a0b10]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#a8810b]/30 bg-[#a8810b]/5 text-[#a8810b] text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a8810b] animate-pulse" />
            Institutional Returns
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Investment Plans <br />
            <span className="text-gradient">Built to Grow</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Every plan is backed by our trading desk and algorithmically managed. Choose your tier, fund your account, and watch daily returns land every 24 hours.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-panel p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${plan.popular ? 'ring-1' : ''}`}
              style={{ ...(plan.popular ? { ringColor: plan.color } : {}) }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-xl" style={{ background: plan.color }}>
                  MOST POPULAR
                </div>
              )}

              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${plan.color}, transparent)` }} />

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
                <div className="text-sm text-white/40">${plan.min.toLocaleString()}+ investment</div>
              </div>

              <div className="mb-6 p-4 rounded-xl" style={{ background: `${plan.color}10` }}>
                <div className="text-4xl font-black mb-1" style={{ color: plan.color }}>{plan.roi}</div>
                <div className="text-sm text-white/60">Daily Return · {plan.duration}</div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-0.5 shrink-0" style={{ color: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className="block w-full text-center py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${plan.color}cc, ${plan.color}80)`, boxShadow: `0 4px 20px ${plan.shadow}` }}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="glass-panel p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: 'How are daily profits calculated?', a: 'Daily ROI is calculated on your invested principal and credited to your balance each day at midnight UTC.' },
              { q: 'Can I withdraw my principal early?', a: 'Early withdrawal is available on Premium and Elite plans for a small fee. Starter and Growth plans return capital at maturity.' },
              { q: 'Are profits guaranteed?', a: 'Our trading strategies have maintained consistent returns, though all investments carry risk. We target the stated ROI ranges.' },
              { q: 'How do I start investing?', a: 'Register, complete KYC verification, deposit funds using your preferred crypto, then select your plan from the dashboard.' },
            ].map((faq) => (
              <div key={faq.q} className="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <InvestmentPopup />
    </main>
  );
}
