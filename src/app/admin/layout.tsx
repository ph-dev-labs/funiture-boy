'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupsIcon from '@mui/icons-material/Groups';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const adminNav = [
  { href: '/admin', label: 'Overview', Icon: DashboardIcon },
  { href: '/admin/users', label: 'Manage Users', Icon: PeopleIcon },
  { href: '/admin/kyc', label: 'KYC Verification', Icon: VerifiedUserIcon },
  { href: '/admin/transactions', label: 'Transactions', Icon: ReceiptLongIcon },
  { href: '/admin/wallets', label: 'Wallets', Icon: AccountBalanceWalletIcon },
  { href: '/admin/plans', label: 'Investment Plans', Icon: GroupsIcon },
  { href: '/admin/copy-trades', label: 'Copy Trades', Icon: ContentCopyIcon },
  { href: '/admin/settings', label: 'System Config', Icon: SettingsSuggestIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('Unauthorized access. Admin privileges required.');
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff0055]/30 border-t-[#ff0055] rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await auth.signOut();
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-[#0a0b10] overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-[#ff0055]/20 bg-[#0a0b10] flex flex-col hidden lg:flex">
        <div className="h-16 flex items-center px-6 border-b border-[#ff0055]/20">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff0055] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,85,0.4)]">
              <SecurityIcon sx={{ color: 'white', fontSize: 18 }} />
            </div>
            <span className="font-bold text-lg text-white">
              Admin<span className="text-[#ff0055]">Panel</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                    ? 'bg-[#ff0055]/10 text-[#ff0055] shadow-[inset_0_0_12px_rgba(255,0,85,0.1)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.Icon sx={{ fontSize: 20 }} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#ff0055]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all font-medium text-sm"
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex-shrink-0 border-b border-[#ff0055]/20 bg-[#0a0b10] flex items-center justify-between px-4 lg:px-8">
          <div className="font-semibold text-white/80 hidden lg:block">System Administration</div>
          <div className="flex items-center gap-3 pl-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">Administrator</div>
              <div className="text-xs text-[#ff0055]">Root Access</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-[#0a0b10] to-[#120a0d]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
