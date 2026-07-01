import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LanguageIcon from '@mui/icons-material/Language';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

const features: {
  Icon: SvgIconComponent;
  title: string;
  description: string;
  color: string;
}[] = [
  {
    Icon: TrendingUpIcon,
    title: 'Algorithmic Trading',
    description: 'Our AI-powered algorithms execute trades 24/7, capitalizing on every market movement for maximum returns.',
    color: '#d4af37',
  },
  {
    Icon: ContentCopyIcon,
    title: 'Expert Copy Trading',
    description: 'Mirror the portfolios of our top-performing traders and earn passively without any experience needed.',
    color: '#a8810b',
  },
  {
    Icon: AttachMoneyIcon,
    title: 'High-Yield Staking',
    description: 'Stake your crypto assets and earn up to 35% APY with our industry-leading staking protocols.',
    color: '#00e676',
  },
  {
    Icon: ShieldOutlinedIcon,
    title: 'Bank-Grade Security',
    description: 'Multi-sig wallets, cold storage, and end-to-end encryption protect your assets around the clock.',
    color: '#ffea00',
  },
  {
    Icon: LanguageIcon,
    title: 'Global Access',
    description: 'Trade from anywhere in the world with support for 180+ countries and 10+ languages.',
    color: '#ff0055',
  },
  {
    Icon: LockOutlinedIcon,
    title: 'Regulatory Compliant',
    description: 'Fully compliant with international financial regulations, giving you peace of mind.',
    color: '#d4af37',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#a8810b]/40 bg-[#a8810b]/10 text-[#a8810b] text-sm font-medium mb-4">
            Why Choose Us
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Built for <span className="text-gradient">Serious Investors</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Everything you need to grow your wealth through institutional-grade crypto infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-panel p-6 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
              >
                <f.Icon sx={{ color: f.color, fontSize: 22 }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
