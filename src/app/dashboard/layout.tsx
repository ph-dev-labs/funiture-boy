'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { firebaseUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.replace('/auth/login');
    }
  }, [firebaseUser, isLoading, router]);

  if (isLoading || !firebaseUser) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0b10] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-[#0a0b10] to-[#0f1117]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
