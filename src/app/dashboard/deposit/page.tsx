'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
export default function DepositPage() {
  const { user } = useAuthStore();
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingWallets, setFetchingWallets] = useState(true);

  useEffect(() => {
    async function getWallets() {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'main'));
        if (docSnap.exists() && docSnap.data().wallets) {
          const w = docSnap.data().wallets;
          setWallets(w);
          if (w.length > 0) setSelectedAsset(w[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetchingWallets(false);
      }
    }
    getWallets();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedAsset.address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 50) {
      toast.error('Minimum deposit is $50.');
      return;
    }
    if (!txHash || txHash.length < 10) {
      toast.error('Please enter a valid transaction hash.');
      return;
    }

    setLoading(true);
    try {
      // Save to Firestore
      await addDoc(collection(db, 'deposits'), {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
        amount: Number(amount),
        asset: selectedAsset.name,
        network: selectedAsset.network,
        txHash,
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
          type: 'deposit_received',
          amount: `$${Number(amount).toFixed(2)}`,
          currency: selectedAsset.name,
        }),
      });

      setSuccess(true);
      toast.success('Deposit request submitted successfully!');
    } catch (err: any) {
      toast.error('Failed to submit deposit request.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in mt-10">
        <div className="glass-panel p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircleOutlinedIcon sx={{ fontSize: 40, color: '#d4af37' }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Deposit Request Received</h2>
          <p className="text-white/60 mb-8">
            Your deposit of <strong>${amount}</strong> via <strong>{selectedAsset.name}</strong> is currently being verified.
            This usually takes 5-15 minutes depending on network congestion. We will notify you once it has been credited to your balance.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setAmount('');
              setTxHash('');
            }}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-semibold hover:opacity-90 transition-all"
          >
            Make Another Deposit
          </button>
        </div>
      </div>
    );
  }

  if (fetchingWallets) {
    return <div className="p-8 text-center text-white/50">Loading deposit methods...</div>;
  }

  if (wallets.length === 0) {
    return <div className="p-8 text-center text-white/50">No deposit methods currently available. Please contact support.</div>;
  }

  if (!selectedAsset) return null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Make a Deposit</h1>
        <p className="text-white/50 text-sm">Add funds to your account via cryptocurrency.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Step 1: Payment Details */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4">1. Select Asset & Network</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedAsset(w)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex flex-col gap-1 ${
                    selectedAsset.id === w.id
                      ? 'border-[#d4af37] bg-[#d4af37]/10 text-white shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                      : 'border-white/10 bg-black/20 text-white/60 hover:text-white/90 hover:border-white/30'
                  }`}
                >
                  <span>{w.name}</span>
                  <span className="text-xs opacity-60 font-normal">{w.network}</span>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-[#ffea00]/30 bg-[#ffea00]/5 flex gap-3 items-start">
              <InfoOutlinedIcon sx={{ color: '#ffea00', fontSize: 20 }} className="shrink-0 mt-0.5" />
              <p className="text-xs text-[#ffea00]/90 leading-relaxed">
                Send exactly the amount you wish to deposit to the address provided. Make sure to use the correct network (<strong>{selectedAsset.network}</strong>), otherwise your funds may be permanently lost.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-4">2. Send Payment</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="p-2 bg-white rounded-xl shrink-0">
                <QRCodeSVG
                  value={selectedAsset.address}
                  size={140}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <div className="text-white/50 text-xs mb-1 uppercase tracking-wider">Deposit Address</div>
                <div className="text-white font-mono text-sm break-all mb-4 bg-black/40 p-3 rounded-lg border border-white/5">
                  {selectedAsset.address}
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 text-sm text-[#d4af37] hover:text-white transition-colors"
                >
                  {copied ? <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Confirm Transaction */}
        <div>
          <div className="glass-panel p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-white mb-4">3. Confirm Deposit</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Amount Deposited (USD Value)
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
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 transition-all"
                  />
                </div>
                <p className="text-xs text-white/40 mt-2">Minimum deposit amount is $50.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Transaction Hash (TxID)
                </label>
                <input
                  type="text"
                  required
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste transaction hash here..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/60 transition-all font-mono"
                />
                <p className="text-xs text-white/40 mt-2">Required to verify your payment automatically.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm shadow-lg shadow-[#d4af37]/20 hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
              >
                {loading ? 'Submitting...' : 'I Have Made the Payment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
