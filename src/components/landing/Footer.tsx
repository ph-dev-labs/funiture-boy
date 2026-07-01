import Link from 'next/link';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const socials = [
  { Icon: TwitterIcon, href: '#' },
  { Icon: InstagramIcon, href: '#' },
  { Icon: LinkedInIcon, href: '#' },
  { Icon: EmailOutlinedIcon, href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-white/[0.02] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <img src="/logo.png" alt="TrendyTrades" className="h-16 w-auto object-contain" />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Institutional-grade crypto trading platform for elite investors worldwide.
            </p>
            <div className="flex gap-3">
              {socials.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all duration-200"
                >
                  <Icon sx={{ fontSize: 16 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {[
            {
              title: 'Platform',
              links: ['Trading', 'Staking', 'Copy Trading', 'Referrals', 'Pricing'],
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Blog', 'Press', 'Contact'],
            },
            {
              title: 'Legal',
              links: ['Privacy Policy', 'Terms of Service', 'AML Policy', 'Cookie Policy'],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-white/50 text-sm hover:text-[#d4af37] transition-colors duration-200"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-white/40 text-xs">
            © 2025 TrendyTrades. All rights reserved. Trading involves risk.
          </p>
          <p className="text-white/40 text-xs">
            🔒 256-bit SSL Encrypted · Cold Storage Protected
          </p>
        </div>
      </div>
    </footer>
  );
}
