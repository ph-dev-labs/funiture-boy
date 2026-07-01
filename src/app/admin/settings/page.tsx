'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SaveIcon from '@mui/icons-material/Save';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
];

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, 'settings', 'general');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setCurrency(snap.data().currency || 'USD');
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), { currency }, { merge: true });
      toast.success('System configuration saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Configuration</h1>
          <p className="text-white/50 text-sm">Manage dynamic platform settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <SaveIcon sx={{ fontSize: 18 }} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <AttachMoneyIcon className="text-[#d4af37]" />
            <h2 className="text-lg font-bold text-white">Platform Currency</h2>
          </div>
          <p className="text-white/50 text-sm mb-6">
            Set the default fiat currency used across the platform for deposits, withdrawals, and displaying balances.
          </p>

          {loading ? (
            <div className="animate-pulse h-10 bg-white/10 rounded-lg w-full max-w-sm"></div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                    currency === c.code
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                      : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {c.code} ({c.symbol})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
