import Link from 'next/link';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#a8810b]/8 rounded-full blur-3xl pointer-events-none" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 p-6">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="TrendyTrades" className="h-24 w-auto object-contain" />
          </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        {children}
      </main>

      <footer className="relative z-10 text-center p-4 text-white/30 text-xs">
        © 2025 TrendyTrades · All rights reserved
      </footer>
    </div>
  );
}
