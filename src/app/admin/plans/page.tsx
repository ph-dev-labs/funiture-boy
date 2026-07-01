'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import SaveIcon from '@mui/icons-material/Save';

type Plan = {
  id: string;
  name: string;
  minDeposit: number;
  maxDeposit: number;
  dailyRoi: number;
  duration: number;
  features: string[];
  color: string;
  popular: boolean;
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
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
        setPlans(data.plans || []);
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
        plans
      });
      toast.success('Investment plans saved!');
    } catch (err) {
      toast.error('Failed to save plans');
    } finally {
      setSaving(false);
    }
  };

  const addPlan = () => {
    setPlans([...plans, {
      id: Date.now().toString(),
      name: '',
      minDeposit: 0,
      maxDeposit: 0,
      dailyRoi: 0,
      duration: 30,
      features: [],
      color: '#d4af37',
      popular: false
    }]);
  };

  const removePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  const updatePlan = (id: string, field: keyof Plan, value: any) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (loading) {
    return <div className="p-8 text-center text-white/50">Loading plans...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Investment Plans</h1>
          <p className="text-white/50 text-sm">Manage the plans available to investors.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <SaveIcon sx={{ fontSize: 18 }} />
          {saving ? 'Saving...' : 'Save Plans'}
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Configured Plans</h2>
          <button onClick={addPlan} className="text-[#d4af37] hover:text-white flex items-center gap-1 text-sm">
            <AddCircleOutlineIcon sx={{ fontSize: 18 }} /> Add Plan
          </button>
        </div>

        <div className="space-y-4">
          {plans.length === 0 && <p className="text-white/40 text-sm italic">No plans configured.</p>}
          {plans.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 relative">
              <button onClick={() => removePlan(p.id)} className="absolute top-4 right-4 text-white/30 hover:text-[#ff0055]">
                <DeleteOutlineIcon sx={{ fontSize: 20 }} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pr-8">
                <div>
                  <label className="text-[10px] text-white/40 uppercase">Plan Name</label>
                  <input type="text" value={p.name} onChange={e => updatePlan(p.id, 'name', e.target.value)} placeholder="e.g. Starter" className="w-full bg-transparent border-b border-white/20 text-white text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase">Color (Hex)</label>
                  <input type="text" value={p.color} onChange={e => updatePlan(p.id, 'color', e.target.value)} placeholder="#d4af37" className="w-full bg-transparent border-b border-white/20 text-white text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase">Min Deposit ($)</label>
                  <input type="number" value={p.minDeposit} onChange={e => updatePlan(p.id, 'minDeposit', Number(e.target.value))} className="w-full bg-transparent border-b border-white/20 text-white text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase">Max Deposit ($)</label>
                  <input type="number" value={p.maxDeposit} onChange={e => updatePlan(p.id, 'maxDeposit', Number(e.target.value))} className="w-full bg-transparent border-b border-white/20 text-white text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase">Daily ROI (%)</label>
                  <input type="number" step="0.1" value={p.dailyRoi} onChange={e => updatePlan(p.id, 'dailyRoi', Number(e.target.value))} className="w-full bg-transparent border-b border-white/20 text-white text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
                <div className="flex items-center mt-2 col-span-1">
                  <input type="checkbox" checked={p.popular} onChange={e => updatePlan(p.id, 'popular', e.target.checked)} className="mr-2" />
                  <label className="text-[10px] text-white/40 uppercase">Most Popular Ribbon</label>
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-4">
                  <label className="text-[10px] text-white/40 uppercase">Features (Comma separated)</label>
                  <input type="text" value={p.features.join(',')} onChange={e => updatePlan(p.id, 'features', e.target.value.split(','))} placeholder="Daily payouts, 24/7 support" className="w-full bg-transparent border-b border-white/20 text-white text-sm outline-none py-1 focus:border-[#d4af37]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
