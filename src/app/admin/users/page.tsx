'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

type UserData = {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  tradingProfit: number;
  role: string;
  createdAt: any;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ balance: 0, tradingProfit: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData));
      // Sort by creation date (newest first) assuming we have a timestamp
      data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
      setUsers(data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (u: UserData) => {
    setEditingId(u.uid);
    setEditForm({ balance: u.balance || 0, tradingProfit: u.tradingProfit || 0 });
  };

  const handleSaveClick = async (uid: string) => {
    setSaving(true);
    try {
      const user = users.find(u => u.uid === uid);
      if (!user) return;

      const newBalance = Number(editForm.balance);
      const newProfit = Number(editForm.tradingProfit);
      
      const balanceDiff = newBalance - (user.balance || 0);
      const profitDiff = newProfit - (user.tradingProfit || 0);

      // Create transaction logs if things changed
      if (profitDiff !== 0) {
        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'transactions'), {
          uid,
          amount: Math.abs(profitDiff),
          type: profitDiff > 0 ? 'profit' : 'withdrawal',
          description: profitDiff > 0 ? 'Admin Profit Credit' : 'Admin Profit Adjustment',
          status: 'completed',
          createdAt: serverTimestamp(),
        });
      }
      
      // If balance changed independently of profit, log it
      const nonProfitBalanceDiff = balanceDiff - profitDiff;
      if (nonProfitBalanceDiff !== 0) {
        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'transactions'), {
          uid,
          amount: Math.abs(nonProfitBalanceDiff),
          type: nonProfitBalanceDiff > 0 ? 'deposit' : 'withdrawal',
          description: nonProfitBalanceDiff > 0 ? 'Admin Balance Credit' : 'Admin Balance Deduction',
          status: 'completed',
          createdAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, 'users', uid), {
        balance: newBalance,
        tradingProfit: newProfit,
      });
      toast.success('User updated successfully');
      setEditingId(null);
      // Update local state
      setUsers(users.map(u => (u.uid === uid ? { ...u, balance: newBalance, tradingProfit: newProfit } : u)));
    } catch (err) {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Manage Users</h1>
        <p className="text-white/50 text-sm">View and manage all registered accounts.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Balance</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Profit</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">No users found.</td>
                </tr>
              ) : (
                users.map((u) => {
                  const isEditing = editingId === u.uid;
                  return (
                    <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white text-sm">{u.displayName}</div>
                        <div className="text-xs text-white/40">{u.email}</div>
                        <div className="text-[10px] text-white/20 font-mono mt-1">{u.uid}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          u.role === 'admin' ? 'bg-[#ff0055]/20 text-[#ff0055]' : 'bg-white/10 text-white/60'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.balance}
                            onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                            className="w-24 bg-black/40 border border-[#d4af37]/50 rounded px-2 py-1 text-sm text-white outline-none"
                          />
                        ) : (
                          <span className="text-white text-sm font-semibold">${(u.balance || 0).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.tradingProfit}
                            onChange={(e) => setEditForm({ ...editForm, tradingProfit: Number(e.target.value) })}
                            className="w-24 bg-black/40 border border-[#d4af37]/50 rounded px-2 py-1 text-sm text-white outline-none"
                          />
                        ) : (
                          <span className="text-[#00e676] text-sm font-semibold">${(u.tradingProfit || 0).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveClick(u.uid)}
                            disabled={saving}
                            className="p-2 bg-[#00e676]/20 text-[#00e676] rounded-lg hover:bg-[#00e676]/30 transition-colors"
                          >
                            <SaveIcon sx={{ fontSize: 18 }} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <EditIcon sx={{ fontSize: 18 }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
