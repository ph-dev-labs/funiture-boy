'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/features', label: 'Features' },
    { href: '/plans', label: 'Plans' },
    { href: '/copy-trading', label: 'Copy Trading' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0b10]/90 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="TrendyTrades" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-white/70 hover:text-[#d4af37] transition-colors duration-200 font-medium"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-5 py-2 text-sm font-semibold rounded-lg text-white/80 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon sx={{ fontSize: 22 }} /> : <MenuIcon sx={{ fontSize: 22 }} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f1117]/95 backdrop-blur-xl border-t border-white/10 p-4 space-y-3">
          {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block text-white/70 hover:text-[#d4af37] py-2 transition-colors font-medium"
              >
                {l.label}
              </Link>
            ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="w-full py-2 text-center text-sm font-semibold rounded-lg border border-white/20 text-white/80"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="w-full py-2 text-center text-sm font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
