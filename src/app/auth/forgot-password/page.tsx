'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      // Also send via Resend for branded experience
      await fetch('/api/email/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err: any) {
      const msg =
        err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : 'Failed to send reset email. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm animate-fade-in">
        <div className="glass-panel p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#00e676]/10 border border-[#00e676]/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircleOutlinedIcon sx={{ fontSize: 30 }} className="text-[#00e676]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
          <p className="text-white/50 text-sm mb-8">
            We sent a password reset link to{' '}
            <span className="text-[#d4af37] font-medium">{email}</span>. Follow
            the instructions to reset your password.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[#d4af37] hover:underline text-sm font-medium"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="glass-panel p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-white/50 text-sm">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
            <div className="relative">
              <EmailOutlinedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" sx={{ fontSize: 16 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.2)] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[#d4af37]/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
