'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupsIcon from '@mui/icons-material/Groups';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', Icon: DashboardIcon },
  { href: '/dashboard/deposit', label: 'Deposit', Icon: AccountBalanceWalletIcon },
  { href: '/dashboard/invest', label: 'Investment Plans', Icon: GroupsIcon },
  { href: '/dashboard/copy-trade', label: 'Copy Trading', Icon: ContentCopyIcon },
  { href: '/dashboard/transactions', label: 'Transactions', Icon: HistoryIcon },
  { href: '/dashboard/settings', label: 'Settings', Icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await auth.signOut();
    logout();
    router.push('/auth/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-[#0a0b10] flex flex-col hidden lg:flex">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center">
            <img src="/logo.png" alt="TrendyTrades" className="h-10 w-auto object-contain" />
          </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#d4af37]/10 text-[#d4af37] shadow-[inset_0_0_12px_rgba(212,175,55,0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.Icon sx={{ fontSize: 20 }} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-[#ff1744] hover:bg-[#ff1744]/10 transition-all font-medium text-sm"
        >
          <LogoutIcon sx={{ fontSize: 20 }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
