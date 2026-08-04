'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

type Method = 'crypto' | 'bank';

export default function WithdrawPage() {
  const { user, setUser } = useAuthStore();
  const [method, setMethod] = useState<Method>('crypto');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Crypto fields
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('USDT (TRC20)');

  // Bank fields
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingCode, setRoutingCode] = useState('');

  const balance = user?.balance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (withdrawAmount < 50) {
      toast.error('Minimum withdrawal is $50.');
      return;
    }
    if (withdrawAmount > balance) {
      toast.error('Insufficient available balance.');
      return;
    }

    if (method === 'crypto') {
      if (!address || address.length < 20) {
        toast.error('Please enter a valid wallet address.');
        return;
      }
    } else {
      if (!bankName.trim()) {
        toast.error('Please enter the bank name.');
        return;
      }
      if (!accountName.trim()) {
        toast.error('Please enter the account holder name.');
        return;
      }
      if (!accountNumber || accountNumber.length < 6) {
        toast.error('Please enter a valid account number.');
        return;
      }
      if (!routingCode.trim()) {
        toast.error('Please enter a routing number or SWIFT/IBAN code.');
        return;
      }
    }

    setLoading(true);
    try {
      // Deduct from balance immediately to prevent double spending
      const userRef = doc(db, 'users', user!.uid);
      await updateDoc(userRef, {
        balance: increment(-withdrawAmount)
      });

      // Create withdrawal request
      await addDoc(collection(db, 'withdrawals'), {
        uid: user!.uid,
        email: user!.email,
        displayName: user!.displayName,
        amount: withdrawAmount,
        method,
        ...(method === 'crypto'
          ? { address, network }
          : { bankName, accountName, accountNumber, routingCode }),
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Send Email Notification
      await fetch('/api/email/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: user?.displayName,
          type: 'withdrawal_received',
          amount: `$${withdrawAmount.toFixed(2)}`,
          currency: 'USD',
        }),
      });

      setUser({ ...user!, balance: balance - withdrawAmount });

      toast.success('Withdrawal request submitted successfully.');
      setAmount('');
      setAddress('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setRoutingCode('');
    } catch (err) {
      toast.error('Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    loading ||
    !amount ||
    Number(amount) > balance ||
    (method === 'crypto' ? !address : !bankName || !accountName || !accountNumber || !routingCode);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Withdraw Funds</h1>
        <p className="text-white/50 text-sm">Request a payout to your crypto wallet or bank account.</p>
      </div>

      <div className="glass-panel p-8">
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
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

        {/* Method selector */}
        <div className="grid grid-cols-2 gap-2 mb-8 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            type="button"
            onClick={() => setMethod('crypto')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              method === 'crypto'
                ? 'bg-[#d4af37] text-black'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <CurrencyBitcoinIcon sx={{ fontSize: 18 }} />
            Crypto Wallet
          </button>
          <button
            type="button"
            onClick={() => setMethod('bank')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              method === 'bank'
                ? 'bg-[#d4af37] text-black'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <AccountBalanceIcon sx={{ fontSize: 18 }} />
            Bank Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Withdrawal Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
              <input
                type="number"
                min="50"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all"
              />
            </div>
            <p className="text-xs text-white/40 mt-2">Minimum withdrawal: $50.</p>
          </div>

          {method === 'crypto' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Network
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all appearance-none"
                >
                  <option value="USDT (TRC20)">USDT (TRC20)</option>
                  <option value="USDT (ERC20)">USDT (ERC20)</option>
                  <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
                  <option value="Ethereum (ETH)">Ethereum (ETH)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Destination Wallet Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Paste your wallet address here..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all font-mono text-sm"
                />
                <p className="text-xs text-[#ffea00]/80 mt-2">
                  Ensure this address matches the selected network. Funds sent to the wrong address cannot be recovered.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Chase Bank"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Full name on the account"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Your bank account number"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Routing Number / SWIFT / IBAN
                </label>
                <input
                  type="text"
                  required
                  value={routingCode}
                  onChange={(e) => setRoutingCode(e.target.value)}
                  placeholder="e.g. 021000021 or SWIFT/BIC code"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all font-mono text-sm"
                />
                <p className="text-xs text-[#ffea00]/80 mt-2">
                  Double-check your bank details. Payouts to incorrect accounts cannot be recovered.
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold shadow-lg shadow-[#d4af37]/20 hover:opacity-90 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : 'Submit Withdrawal Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
