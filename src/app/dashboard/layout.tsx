'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated at all → login
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Admins must not see the user dashboard
    if (user.role === 'admin') {
      toast.error('Redirecting to admin panel.', { id: 'admin-redirect' });
      router.replace('/admin');
    }
  }, [user, isLoading, router]);

  // Show spinner while loading OR while user profile is resolving
  // This prevents any flash of user content before the role is confirmed
  if (isLoading || !user || user.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0b10] overflow-hidden">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-[#0a0b10] to-[#0f1117]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

