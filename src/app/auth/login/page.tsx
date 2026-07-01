'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

export default function LoginPage() {
  const router = useRouter();
  const { setFirebaseUser } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);

      if (!cred.user.emailVerified) {
        toast.error('Please verify your email first. Check your inbox.');
        await sendEmailVerification(cred.user);
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Fetch user profile and set in store
      const docRef = doc(db, 'users', cred.user.uid);
      const docSnap = await getDoc(docRef);
      
      let isAdmin = false;
      if (docSnap.exists()) {
        const { setUser } = useAuthStore.getState();
        const userData = docSnap.data();
        setUser({ uid: cred.user.uid, ...userData } as any);
        if (userData.role === 'admin') {
          isAdmin = true;
        }
      }

      toast.success('Login successful! Welcome back.');
      router.push(isAdmin ? '/admin' : '/dashboard');
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : err.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="glass-panel p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/50 text-sm">Sign in to your trading account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.2)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-[#d4af37] text-sm hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LoginIcon sx={{ fontSize: 16 }} /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-[#d4af37] hover:underline font-medium">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
