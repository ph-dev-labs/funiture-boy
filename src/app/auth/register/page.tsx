'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Suspense } from 'react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: refCode,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      await sendEmailVerification(cred.user);

      // Create Firestore user document
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: form.email,
        displayName: form.name,
        role: 'user',
        balance: 0,
        tradingProfit: 0,
        stakingProfit: 0,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredBy: form.referralCode || null,
        kycVerified: false,
        emailVerified: false,
        createdAt: serverTimestamp(),
      });

      // Send welcome email
      await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.name }),
      });

      toast.success('Account created! Please verify your email to continue.');
      await auth.signOut();
      router.push('/auth/login');
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'This email is already registered.'
          : err.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="glass-panel p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/50 text-sm">Join 180,000+ elite investors worldwide</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
            <div className="relative">
              <PersonOutlineIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" sx={{ fontSize: 16 }} />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.2)] transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
            <div className="relative">
              <EmailOutlinedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" sx={{ fontSize: 16 }} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.2)] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
            <div className="relative">
              <LockOutlinedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" sx={{ fontSize: 16 }} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.2)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPw ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Confirm Password</label>
            <div className="relative">
              <LockOutlinedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" sx={{ fontSize: 16 }} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.2)] transition-all"
              />
            </div>
          </div>

          {/* Referral */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Referral Code <span className="text-white/30">(Optional)</span>
            </label>
            <input
              type="text"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
              placeholder="XXXXXX"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 transition-all uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[#d4af37]/20 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PersonAddIcon sx={{ fontSize: 16 }} /> Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#d4af37] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-white/50">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
