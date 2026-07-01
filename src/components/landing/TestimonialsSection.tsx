import { Star } from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';

const reviews = [
  {
    name: 'James R.',
    country: '🇺🇸 Texas, USA',
    avatar: 'JR',
    rating: 5,
    text: 'Trendy Trades changed my financial life. My Growth plan has been returning 2.5% daily consistently for 6 months. Withdrawals are instant!',
    plan: 'Growth Plan',
  },
  {
    name: 'Sophie M.',
    country: '🇬🇧 England, UK',
    avatar: 'SM',
    rating: 5,
    text: 'Very professional platform. Everything is transparent, withdrawals work smoothly, and the team is always available. Highly recommend!',
    plan: 'Growth Plan',
  },
  {
    name: 'Marcus W.',
    country: '🇨🇦 Ontario, Canada',
    avatar: 'MW',
    rating: 5,
    text: "Started with the Starter plan, now I'm on Elite. The compound earnings are incredible. Best crypto platform I've ever used.",
    plan: 'Elite Plan',
  },
  {
    name: 'Amara O.',
    country: '🇺🇸 California, USA',
    avatar: 'AO',
    rating: 5,
    text: 'The copy trading feature is a game changer. I set it up once and now earn passively every week. The customer support is world class.',
    plan: 'Premium Plan',
  },
  {
    name: 'Liam K.',
    country: '🇬🇧 Scotland, UK',
    avatar: 'LK',
    rating: 5,
    text: 'The OTP security and 2FA gave me confidence to invest a large amount. My Elite plan has been performing beyond my expectations.',
    plan: 'Elite Plan',
  },
  {
    name: 'Priya K.',
    country: '🇨🇦 British Columbia, Canada',
    avatar: 'PK',
    rating: 4,
    text: 'Excellent returns and the interface is so clean and easy to use. The daily profit emails keep me updated. Great overall experience!',
    plan: 'Premium Plan',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4af37]/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#ffea00]/40 bg-[#ffea00]/10 text-[#ffea00] text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Trusted by <span className="text-gradient">180,000+ Investors</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Real stories from real people growing their wealth with Trendy Trades.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={r.name}
              className="glass-panel flex flex-col gap-4"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#a8810b] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {r.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{r.name}</div>
                  <div className="text-xs text-white/50">{r.country}</div>
                </div>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 shrink-0">
                  {r.plan}
                </span>
              </div>

              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) =>
                  j < r.rating ? (
                    <StarIcon key={j} sx={{ color: '#ffea00', fontSize: 14 }} />
                  ) : (
                    <Star key={j} sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }} />
                  )
                )}
              </div>

              <p className="text-white/70 text-sm leading-relaxed flex-1">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
