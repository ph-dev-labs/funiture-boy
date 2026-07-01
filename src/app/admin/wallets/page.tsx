'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import SaveIcon from '@mui/icons-material/Save';

type Wallet = {
  id: string;
  name: string;
  address: string;
  network: string;
};

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWallets(data.wallets || []);
      } else {
        await setDoc(docRef, { wallets: [], plans: [] });
      }
    } catch (err) {
      toast.error('Failed to load system config');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'config', 'main'), {
        wallets,
      });
      toast.success('Wallets configuration saved!');
    } catch (err) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addWallet = () => {
    setWallets([...wallets, { id: Date.now().toString(), name: '', address: '', network: '' }]);
  };

  const removeWallet = (id: string) => {
    setWallets(wallets.filter(w => w.id !== id));
  };

  const updateWallet = (id: string, field: keyof Wallet, value: string) => {
    setWallets(wallets.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading wallets...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Deposit Wallets</h1>
          <p className="text-white/50 text-sm">Manage wallets available for user deposits.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <SaveIcon sx={{ fontSize: 18 }} />
          {saving ? 'Saving...' : 'Save Wallets'}
        </button>
      </div>

      <div className="glass-panel p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Configured Wallets</h2>
          <button onClick={addWallet} className="text-[#d4af37] hover:text-white flex items-center gap-1 text-sm">
            <AddCircleOutlineIcon sx={{ fontSize: 18 }} /> Add Wallet
          </button>
        </div>

        <div className="space-y-4">
          {wallets.length === 0 && <p className="text-white/40 text-sm italic">No wallets configured.</p>}
          {wallets.map((w) => (
            <div key={w.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 relative">
              <button onClick={() => removeWallet(w.id)} className="absolute top-4 right-4 text-white/30 hover:text-[#ff0055]">
                <DeleteOutlineIcon sx={{ fontSize: 20 }} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="text-[10px] text-white/40 uppercase">Asset Name</label>
                  <input type="text" value={w.name} onChange={e => updateWallet(w.id, 'name', e.target.value)} placeholder="e.g. USDT (TRC20)" className="w-full bg-transparent border-b border-white/20 text-white text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase">Network</label>
                  <input type="text" value={w.network} onChange={e => updateWallet(w.id, 'network', e.target.value)} placeholder="e.g. Tron (TRC20)" className="w-full bg-transparent border-b border-white/20 text-white text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] text-white/40 uppercase">Wallet Address</label>
                  <input type="text" value={w.address} onChange={e => updateWallet(w.id, 'address', e.target.value)} placeholder="Address..." className="w-full bg-transparent border-b border-white/20 text-white font-mono text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
