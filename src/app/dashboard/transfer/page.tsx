'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function TransferPage() {
  const { user, setUser } = useAuthStore();
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const balance = user?.balance || 0;
  const transferAmount = Number(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedId = recipientId.trim();
    if (!trimmedId) {
      toast.error('Enter the recipient account ID.');
      return;
    }
    if (trimmedId === user?.uid) {
      toast.error('You cannot transfer funds to yourself.');
      return;
    }
    if (!transferAmount || transferAmount <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (transferAmount > balance) {
      toast.error('Insufficient available balance.');
      return;
    }

    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Your session has expired. Please log in again.');

      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ recipientId: trimmedId, amount: transferAmount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process transfer.');

      setUser({ ...user!, balance: data.newBalance });
      toast.success('Transfer completed successfully.');
      setRecipientId('');
      setAmount('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to process transfer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Internal Transfer</h1>
        <p className="text-white/50 text-sm">Instantly move funds to another account using their account ID.</p>
      </div>

      <div className="glass-panel p-8">
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
              <AccountBalanceWalletIcon />
            </div>
            <div>
              <div className="text-white/50 text-xs">Available Balance</div>
              <div className="text-white font-bold text-lg">${balance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Recipient Account ID
            </label>
            <input
              type="text"
              required
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Paste the recipient's account ID..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all font-mono text-sm"
            />
            <p className="text-xs text-white/40 mt-2">
              You can find your own account ID in Settings — share it with others to receive transfers.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all"
              />
            </div>
          </div>

          <p className="text-xs text-[#ffea00]/80">
            Transfers are instant and irreversible. Double-check the recipient ID before confirming.
          </p>

          <button
            type="submit"
            disabled={loading || !amount || !recipientId || transferAmount > balance}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold shadow-lg shadow-[#d4af37]/20 hover:opacity-90 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            <SwapHorizIcon sx={{ fontSize: 20 }} />
            {loading ? 'Processing...' : 'Send Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}
