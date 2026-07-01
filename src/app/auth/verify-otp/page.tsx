'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email =
    typeof window !== 'undefined' ? sessionStorage.getItem('otp_email') || '' : '';
  const uid =
    typeof window !== 'undefined' ? sessionStorage.getItem('otp_uid') || '' : '';

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Invalid OTP');

      // Fetch user profile and set in store
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUser({ uid, ...docSnap.data() } as any);
      }

      sessionStorage.removeItem('otp_email');
      sessionStorage.removeItem('otp_uid');
      toast.success('Login successful! Welcome back.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      toast.success('New OTP sent!');
      setCountdown(60);
    } catch {
      toast.error('Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="glass-panel p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#a8810b]/20 border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-6">
          <ShieldOutlinedIcon sx={{ fontSize: 28 }} className="text-[#d4af37]" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Verify Your Identity</h1>
        <p className="text-white/50 text-sm mb-8">
          We sent a 6-digit code to{' '}
          <span className="text-[#d4af37] font-medium">{email || 'your email'}</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-14 text-center text-xl font-bold rounded-xl border transition-all outline-none ${
                digit
                  ? 'border-[#d4af37] bg-[#d4af37]/10 text-white shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'border-white/20 bg-black/20 text-white'
              } focus:border-[#d4af37] focus:shadow-[0_0_0_2px_rgba(212,175,55,0.2)]`}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-[#d4af37]/20 mb-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Verify & Continue'
          )}
        </button>

        <button
          onClick={handleResend}
          disabled={countdown > 0 || resending}
          className="text-sm text-white/50 hover:text-[#d4af37] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {countdown > 0
            ? `Resend code in ${countdown}s`
            : resending
            ? 'Sending...'
            : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}
