import Link from 'next/link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StarRateIcon from '@mui/icons-material/StarRate';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import GroupsIcon from '@mui/icons-material/Groups';
import type { SvgIconComponent } from '@mui/icons-material';

const traders = [
  {
    name: 'Alex Morgan',
    avatar: 'AM',
    specialty: 'BTC / ETH Swing',
    monthly: '+32.4%',
    copiers: 2140,
    stars: 4.9,
    color: '#d4af37',
  },
  {
    name: 'Jordan Park',
    avatar: 'JP',
    specialty: 'DeFi & Altcoins',
    monthly: '+27.8%',
    copiers: 1839,
    stars: 4.8,
    color: '#a8810b',
  },
  {
    name: 'Sofia Chen',
    avatar: 'SC',
    specialty: 'Arbitrage & Scalp',
    monthly: '+21.1%',
    copiers: 1201,
    stars: 4.7,
    color: '#00e676',
  },
];

const stats: { Icon: SvgIconComponent; label: string; val: string; color: string }[] = [
  { Icon: TrendingUpIcon, label: 'Avg Monthly Return', val: '+28%', color: '#d4af37' },
  { Icon: PeopleAltOutlinedIcon, label: 'Active Copiers', val: '12K+', color: '#a8810b' },
  { Icon: StarRateIcon, label: 'Expert Traders', val: '50+', color: '#00e676' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const half = !filled && i < rating;
        return half ? (
          <StarHalfIcon key={i} sx={{ color: '#ffea00', fontSize: 13 }} />
        ) : filled ? (
          <StarIcon key={i} sx={{ color: '#ffea00', fontSize: 13 }} />
        ) : (
          <StarRateIcon key={i} sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }} />
        );
      })}
    </div>
  );
}

export default function CopyTradingSection() {
  return (
    <section id="copy-trading" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Side */}
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full border border-[#00e676]/40 bg-[#00e676]/10 text-[#00e676] text-sm font-medium mb-6">
              Copy Trading
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Let Experts Trade{' '}
              <span className="text-gradient">While You Earn</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Our copy trading engine automatically mirrors the positions of our
              top-performing traders in real-time. No charts, no stress — just
              passive earnings.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="glass-panel p-4 text-center">
                  <s.Icon sx={{ color: s.color, fontSize: 20, display: 'block', margin: '0 auto 8px' }} />
                  <div className="text-xl font-bold text-white">{s.val}</div>
                  <div className="text-xs text-white/50 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#d4af37]/30"
            >
              <GroupsIcon sx={{ fontSize: 20 }} />
              Start Copy Trading
            </Link>
          </div>

          {/* Trader Cards */}
          <div className="space-y-4">
            {traders.map((t, i) => (
              <div
                key={t.name}
                className="glass-panel p-5 flex items-center gap-4 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0 text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}CC, ${t.color}44)`,
                  }}
                >
                  {t.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{t.name}</span>
                    <span className="text-[#ffea00] text-xs flex items-center gap-0.5">
                      <StarIcon sx={{ fontSize: 11, color: '#ffea00' }} /> {t.stars}
                    </span>
                  </div>
                  <div className="text-xs text-white/50">{t.specialty}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[#00e676] font-bold text-sm">{t.monthly}</div>
                  <div className="text-xs text-white/40">Monthly</div>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-white/70 font-semibold text-sm">
                    {t.copiers.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/40">Copiers</div>
                </div>

                <Link
                  href="/auth/register"
                  className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 group-hover:opacity-100 opacity-80"
                  style={{ background: `${t.color}25`, border: `1px solid ${t.color}40` }}
                >
                  Copy
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
