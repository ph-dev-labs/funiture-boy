import Link from 'next/link';
import CheckIcon from '@mui/icons-material/Check';

const plans = [
  {
    name: 'Starter',
    minDeposit: '$100',
    maxDeposit: '$999',
    dailyRoi: '1.5%',
    duration: '30 days',
    features: [
      'Daily profit payouts',
      'Basic copy trading access',
      'Email support',
      '2x capital return on maturity',
    ],
    color: '#d4af37',
    popular: false,
  },
  {
    name: 'Growth',
    minDeposit: '$1,000',
    maxDeposit: '$9,999',
    dailyRoi: '2.5%',
    duration: '45 days',
    features: [
      'Daily profit payouts',
      'Full copy trading access',
      'Priority support',
      '3x capital return on maturity',
      'Referral bonus',
    ],
    color: '#a8810b',
    popular: true,
  },
  {
    name: 'Premium',
    minDeposit: '$10,000',
    maxDeposit: '$49,999',
    dailyRoi: '3.5%',
    duration: '60 days',
    features: [
      'Daily profit payouts',
      'VIP copy trading access',
      '24/7 dedicated support',
      '5x capital return on maturity',
      'Referral bonus',
      'Weekly strategy call',
    ],
    color: '#00e676',
    popular: false,
  },
  {
    name: 'Elite',
    minDeposit: '$50,000',
    maxDeposit: 'Unlimited',
    dailyRoi: '5%',
    duration: '90 days',
    features: [
      'Hourly profit payouts',
      'Elite copy trading desk',
      'Personal account manager',
      '10x capital return on maturity',
      'Referral bonus + commissions',
      'Exclusive market insights',
    ],
    color: '#ff0055',
    popular: false,
  },
];

export default function PlansSection() {
  return (
    <section id="plans" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a8810b]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37] text-sm font-medium mb-4">
            Investment Plans
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-gradient">Growth Path</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Flexible plans designed to match every investment level. Start small, scale big.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-panel relative flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'ring-2 ring-[#a8810b] scale-105 shadow-2xl shadow-[#a8810b]/30'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#a8810b] to-[#d4af37] text-white text-xs font-bold shadow-lg whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-4">
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: plan.color }}
                >
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.dailyRoi}</span>
                  <span className="text-white/50 text-sm">daily</span>
                </div>
                <div className="text-white/50 text-sm mt-1">
                  {plan.minDeposit} – {plan.maxDeposit} · {plan.duration}
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckIcon
                      sx={{ color: plan.color, fontSize: 14, marginTop: '2px', flexShrink: 0 }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className="w-full py-3 rounded-xl text-center text-sm font-semibold transition-all duration-200 hover:opacity-90"
                style={{
                  background: `linear-gradient(90deg, ${plan.color}CC, ${plan.color}88)`,
                  color: '#fff',
                  boxShadow: `0 4px 20px ${plan.color}40`,
                }}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
