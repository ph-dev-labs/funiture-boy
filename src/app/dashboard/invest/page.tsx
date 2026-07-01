'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import CheckIcon from '@mui/icons-material/Check';

export default function InvestPage() {
  const { user, setUser } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  useEffect(() => {
    async function getPlans() {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'main'));
        if (docSnap.exists() && docSnap.data().plans) {
          setPlans(docSnap.data().plans);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetchingPlans(false);
      }
    }
    getPlans();
  }, []);

  const balance = user?.balance || 0;

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !user) return;

    const investAmount = Number(amount);

    if (investAmount < selectedPlan.minDeposit || investAmount > selectedPlan.maxDeposit) {
      toast.error(`Amount must be between $${selectedPlan.minDeposit} and $${selectedPlan.maxDeposit}`);
      return;
    }

    if (investAmount > balance) {
      toast.error('Insufficient balance. Please deposit more funds.');
      return;
    }

    setLoading(true);
    try {
      // 1. Deduct balance from user
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-investAmount)
      });

      // 2. Create investment record
      await addDoc(collection(db, 'investments'), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        plan: selectedPlan.name,
        amount: investAmount,
        dailyRoi: selectedPlan.dailyRoi,
        status: 'active',
        createdAt: serverTimestamp(),
      });

      // 3. Log to unified transactions collection
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        type: 'investment',
        amount: investAmount,
        description: `Invested in ${selectedPlan.name} Plan`,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      // 4. In-app notification (no email)
      await addDoc(collection(db, `users/${user.uid}/notifications`), {
        title: 'Investment Started 🚀',
        message: `$${investAmount.toFixed(2)} has been invested in ${selectedPlan.name} Plan. Daily ROI starts tomorrow.`,
        type: 'success',
        read: false,
        createdAt: serverTimestamp(),
      });

      // 5. Update local state
      setUser({ ...user, balance: balance - investAmount });
      
      toast.success(`Successfully invested $${investAmount} in ${selectedPlan.name} Plan!`);
      setSelectedPlan(null);
      setAmount('');
    } catch (err: any) {
      toast.error('Investment failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPlans) {
    return <div className="p-8 text-center text-white/50">Loading investment plans...</div>;
  }

  if (plans.length === 0) {
    return <div className="p-8 text-center text-white/50">No plans currently available. Please check back later.</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Investment Plans</h1>
        <p className="text-white/50 text-sm">Choose a plan to start earning daily returns.</p>
        <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <span className="text-white/50 text-sm mr-2">Available Balance:</span>
          <span className="text-white font-bold">${balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glass-panel relative flex flex-col p-6 transition-all duration-300 ${
              plan.popular ? 'ring-2 ring-[#a8810b] shadow-2xl shadow-[#a8810b]/20' : 'hover:border-white/20'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#a8810b] to-[#d4af37] text-white text-[10px] font-bold shadow-lg uppercase tracking-wider">
                Most Popular
              </div>
            )}
            
            <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: plan.color }}>
              {plan.name}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-white">{plan.dailyRoi}%</span>
              <span className="text-white/50 text-sm">daily</span>
            </div>
            <div className="text-white/50 text-xs mb-6">
              ${plan.minDeposit.toLocaleString()} – ${plan.maxDeposit.toLocaleString()}
            </div>

            <ul className="flex-1 space-y-3 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-white/70">
                  <CheckIcon sx={{ color: plan.color, fontSize: 14, marginTop: '2px' }} className="shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedPlan(plan)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(90deg, ${plan.color}CC, ${plan.color}88)`,
                color: '#fff',
              }}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>

      {/* Investment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 relative animate-fade-in">
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Invest in {selectedPlan.name}</h3>
            <p className="text-white/50 text-sm mb-6">
              Enter amount between ${selectedPlan.minDeposit} and ${selectedPlan.maxDeposit}.
            </p>
            
            <form onSubmit={handleInvest} className="space-y-4">
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                  <input
                    type="number"
                    min={selectedPlan.minDeposit}
                    max={selectedPlan.maxDeposit}
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-white/40 p-3 bg-white/5 rounded-lg">
                <span>Daily Return:</span>
                <span className="text-[#00e676] font-semibold">
                  ${amount ? (Number(amount) * (selectedPlan.dailyRoi / 100)).toFixed(2) : '0.00'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !amount || Number(amount) > balance}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm shadow-lg shadow-[#d4af37]/20 hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Processing...' : 'Confirm Investment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
