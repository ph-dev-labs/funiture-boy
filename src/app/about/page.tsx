import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | TrendyTrades',
  description: 'Learn about TrendyTrades — our mission, team, and commitment to democratizing institutional crypto trading.',
};

const team = [
  { initials: 'AW', name: 'Alex Wu', role: 'CEO & Co-Founder', bg: 'from-[#d4af37] to-[#a8810b]', bio: '15 years in quantitative finance. Previously Head of Algo Trading at Goldman Sachs Digital Assets.' },
  { initials: 'NC', name: 'Natalie Cruz', role: 'CTO & Co-Founder', bg: 'from-[#a8810b] to-[#ff0055]', bio: 'Ex-Google engineer. Built distributed trading infrastructure processing 2M+ orders per second.' },
  { initials: 'DM', name: 'David Mensah', role: 'Chief Risk Officer', bg: 'from-[#00e676] to-[#d4af37]', bio: '12 years in risk management at JP Morgan. Expert in DeFi protocol security and compliance.' },
  { initials: 'SR', name: 'Sara Rahman', role: 'Head of Operations', bg: 'from-[#ff0055] to-[#a8810b]', bio: 'Operated global trading desks at Binance and FTX. Brings deep institutional market knowledge.' },
];

const milestones = [
  { year: '2019', title: 'Founded', desc: 'TrendyTrades was founded in Singapore with a mission to democratize institutional crypto trading.' },
  { year: '2020', title: '$100M AUM', desc: 'Reached $100 million in assets under management within our first year of operation.' },
  { year: '2021', title: 'Copy Trading Launch', desc: 'Launched our industry-first retail copy trading engine, pioneering passive crypto investing.' },
  { year: '2022', title: '50K Users', desc: 'Reached 50,000 active users across 120 countries with zero major security incidents.' },
  { year: '2023', title: '$1B AUM', desc: 'Surpassed $1 billion in total assets managed, cementing our position as a market leader.' },
  { year: '2024', title: '180K Users', desc: 'Today, TrendyTrades serves 180,000+ investors with $2.4B+ in total assets under management.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0b10]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            We&apos;re Democratizing <br />
            <span className="text-gradient">Institutional Finance</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto leading-relaxed">
            TrendyTrades was born from a simple belief: the advanced trading tools and returns available to hedge funds and banks should be accessible to every investor. We built the platform we always wished existed.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { val: '$2.4B+', label: 'Assets Under Management' },
            { val: '180K+', label: 'Active Investors' },
            { val: '150+', label: 'Countries Served' },
            { val: '5 Years', label: 'Zero Major Breaches' },
          ].map((s) => (
            <div key={s.label} className="glass-panel p-6 text-center">
              <div className="text-3xl font-black text-gradient mb-2">{s.val}</div>
              <div className="text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="glass-panel p-8" style={{ borderLeft: '3px solid #d4af37' }}>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-white/60 leading-relaxed">
              To provide every investor, regardless of experience or capital size, with access to institutional-grade crypto trading strategies, transparent performance reporting, and a secure environment to grow their wealth.
            </p>
          </div>
          <div className="glass-panel p-8" style={{ borderLeft: '3px solid #a8810b' }}>
            <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-white/60 leading-relaxed">
              A world where the wealth-building power of crypto markets is democratized — where a teacher in Lagos and a fund manager in London have access to the same sophisticated tools and returns.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className={`flex gap-8 items-start ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-12 md:pl-0`}>
                    <div className="glass-panel p-5 inline-block w-full md:max-w-sm">
                      <div className="text-[#d4af37] font-black text-lg mb-1">{m.year}</div>
                      <div className="text-white font-bold mb-1">{m.title}</div>
                      <div className="text-white/50 text-sm">{m.desc}</div>
                    </div>
                  </div>
                  <div className="absolute left-4 md:static md:flex-none flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                  </div>
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-10 text-center">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member) => (
              <div key={member.name} className="glass-panel p-6 text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.bg} flex items-center justify-center font-bold text-white text-lg mx-auto mb-4 shadow-lg`}>
                  {member.initials}
                </div>
                <h3 className="text-white font-bold">{member.name}</h3>
                <div className="text-[#d4af37] text-sm mb-3">{member.role}</div>
                <p className="text-white/40 text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <p className="text-white/60 mb-6">Join 180,000+ investors who trust TrendyTrades with their future.</p>
          <Link href="/auth/register" className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-lg hover:opacity-90 transition-all shadow-2xl">
            Start Investing Today
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
