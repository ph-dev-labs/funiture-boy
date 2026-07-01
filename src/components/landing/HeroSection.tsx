import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a8810b]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.08) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            Institutional-Grade Crypto Trading Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Trade Smarter.{' '}
            <br />
            <span className="text-gradient">Earn More.</span>
            <br />
            Every Day.
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience professional crypto trading, high-yield staking, and
            expert copy trading — all in one powerful, secure ecosystem built
            for elite investors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-semibold text-lg hover:opacity-90 transition-all duration-200 shadow-2xl shadow-[#d4af37]/30 hover:scale-105"
            >
              Start Trading Free
            </Link>
            <a
              href="#plans"
              className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-[#d4af37]/50 transition-all duration-200"
            >
              View Plans
            </a>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: '$2.4B+', label: 'Managed' },
              { value: '180K+', label: 'Users' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-gradient">{s.value}</div>
                <div className="text-xs text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
