'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

type InvestmentData = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  plan: string;
  amount: number;
  dailyRoi: number;
  durationDays: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: any;
  endDate: any;
  lastPayoutAt?: any;
};

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Edit Modal State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InvestmentData>>({});
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refundOnDelete, setRefundOnDelete] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // Current time state for pure rendering
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'investments'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvestmentData));
      
      // Sort by createdAt descending
      data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setInvestments(data);
    } catch (err) {
      toast.error('Failed to fetch investments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for dates
  const parseDate = (val: any) => {
    if (!val) return null;
    if (val.seconds) return new Date(val.seconds * 1000);
    if (val.toDate) return val.toDate();
    return new Date(val);
  };

  const formatDate = (val: any) => {
    const d = parseDate(val);
    return d ? d.toLocaleDateString() : '—';
  };

  const dateToInputString = (val: any) => {
    const d = parseDate(val);
    return d ? d.toISOString().split('T')[0] : '';
  };

  // Actions
  const handleCompleteEarly = async (id: string) => {
    if (!confirm('Are you sure you want to mark this investment as completed? It will no longer generate daily profit.')) return;
    
    try {
      await updateDoc(doc(db, 'investments', id), { status: 'completed' });
      setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'completed' } : inv));
      toast.success('Investment marked as completed.');
    } catch (err) {
      toast.error('Failed to update status.');
      console.error(err);
    }
  };

  const executeDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const inv = investments.find(i => i.id === deletingId);
      if (!inv) throw new Error('Investment not found');

      if (refundOnDelete && inv.amount > 0) {
        await updateDoc(doc(db, 'users', inv.uid), {
          balance: increment(inv.amount)
        });
      }

      await deleteDoc(doc(db, 'investments', deletingId));
      
      setInvestments(prev => prev.filter(i => i.id !== deletingId));
      toast.success(refundOnDelete ? `Investment deleted and $${inv.amount} refunded to user.` : 'Investment deleted successfully.');
      setDeletingId(null);
    } catch (err) {
      toast.error('Failed to delete investment.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (inv: InvestmentData) => {
    setEditingId(inv.id);
    setEditForm({
      amount: inv.amount,
      dailyRoi: inv.dailyRoi,
      durationDays: inv.durationDays,
      status: inv.status,
      endDate: dateToInputString(inv.endDate),
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const updateData: any = {
        amount: Number(editForm.amount),
        dailyRoi: Number(editForm.dailyRoi),
        durationDays: Number(editForm.durationDays),
        status: editForm.status,
      };

      if (editForm.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(editForm.endDate));
      }

      await updateDoc(doc(db, 'investments', editingId), updateData);
      
      setInvestments(prev => prev.map(inv => {
        if (inv.id === editingId) {
          return { ...inv, ...updateData };
        }
        return inv;
      }));

      toast.success('Investment updated successfully.');
      setEditingId(null);
    } catch (err) {
      toast.error('Failed to save investment.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Derived state
  const filteredInvestments = useMemo(() => {
    return investments.filter(inv => {
      const matchesSearch = 
        (inv.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.plan || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      const matchesPlan = planFilter === 'all' || (inv.plan || '').toLowerCase() === planFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [investments, searchQuery, statusFilter, planFilter]);

  const uniquePlans = useMemo(() => {
    const plans = new Set(investments.map(i => (i.plan || 'Unknown').toLowerCase()));
    return Array.from(plans);
  }, [investments]);

  // Global Metrics
  const stats = useMemo(() => {
    let totalCapital = 0;
    let activeCapital = 0;
    let activeCount = 0;
    let completedCount = 0;

    investments.forEach(inv => {
      totalCapital += (inv.amount || 0);
      if (inv.status === 'active') {
        activeCapital += (inv.amount || 0);
        activeCount++;
      } else if (inv.status === 'completed') {
        completedCount++;
      }
    });

    return { totalCapital, activeCapital, activeCount, completedCount };
  }, [investments]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Investment History & Status</h1>
          <p className="text-white/50 text-sm">Monitor, manage, and audit user investments across the platform.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 border-l-4 border-[#00e676]">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded bg-[#00e676]/10 flex items-center justify-center text-[#00e676]">
              <AccountBalanceIcon fontSize="small" />
            </div>
          </div>
          <div className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Total Capital Invested</div>
          <div className="text-2xl font-bold text-white">${stats.totalCapital.toLocaleString()}</div>
        </div>

        <div className="glass-panel p-5 border-l-4 border-[#d4af37]">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
              <TrendingUpIcon fontSize="small" />
            </div>
          </div>
          <div className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Active Capital</div>
          <div className="text-2xl font-bold text-white">${stats.activeCapital.toLocaleString()}</div>
        </div>

        <div className="glass-panel p-5 border-l-4 border-[#ff0055]">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded bg-[#ff0055]/10 flex items-center justify-center text-[#ff0055]">
              <DoneAllIcon fontSize="small" />
            </div>
          </div>
          <div className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Active Investments</div>
          <div className="text-2xl font-bold text-white">{stats.activeCount}</div>
        </div>
        
        <div className="glass-panel p-5 border-l-4 border-white/20">
          <div className="flex justify-between items-start mb-2">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/60">
              <CheckCircleIcon fontSize="small" />
            </div>
          </div>
          <div className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Completed Investments</div>
          <div className="text-2xl font-bold text-white">{stats.completedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fontSize="small" />
          <input
            type="text"
            placeholder="Search by email, name, or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <FilterListIcon className="text-white/40" fontSize="small" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] appearance-none capitalize"
            >
              <option value="all">All Plans</option>
              {uniquePlans.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">User & Plan</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Capital & ROI</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Progress & Dates</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Profit Accrued</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">Loading investments...</td>
                </tr>
              ) : filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">No investments match your criteria.</td>
                </tr>
              ) : (
                filteredInvestments.map((inv) => {
                  const duration = inv.durationDays || 30;
                  const isCompleted = inv.status === 'completed';
                  const isCancelled = inv.status === 'cancelled';
                  
                  let daysElapsed = duration;
                  let daysRemaining = 0;
                  
                  const startDate = parseDate(inv.createdAt);
                  const endDate = parseDate(inv.endDate);

                  if (inv.status === 'active' && startDate) {
                    const currentTime = now || 1700000000000; // Fallback for pure initial render
                    const diffMs = currentTime - startDate.getTime();
                    daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
                    if (endDate) {
                      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - currentTime) / (1000 * 60 * 60 * 24)));
                      daysElapsed = Math.min(duration, Math.max(0, duration - daysRemaining));
                    }
                  }

                  if (isCompleted) {
                     daysElapsed = duration;
                     daysRemaining = 0;
                  }

                  const expectedTotalProfit = (inv.amount || 0) * ((inv.dailyRoi || 0) / 100) * duration;
                  const currentAccruedProfit = (inv.amount || 0) * ((inv.dailyRoi || 0) / 100) * daysElapsed;
                  const progressPercent = isCompleted ? 100 : Math.min(100, Math.max(0, (daysElapsed / duration) * 100));

                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4">
                        <div className="font-medium text-white text-sm flex items-center gap-2">
                          {inv.displayName || 'Unknown User'}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            isCompleted ? 'bg-white/10 text-white/50' : 
                            isCancelled ? 'bg-[#ff1744]/20 text-[#ff1744]' : 
                            'bg-[#00e676]/20 text-[#00e676]'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <div className="text-xs text-white/40 mb-1">{inv.email || 'No email'}</div>
                        <div className="inline-block mt-1 bg-[#d4af37]/20 text-[#d4af37] text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          {inv.plan} Plan
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm font-bold text-white">${(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-[#00e676] font-medium mt-1">{inv.dailyRoi}% Daily ROI</div>
                        <div className="text-xs text-white/40">{duration} Days Duration</div>
                      </td>
                      
                      <td className="p-4 w-48">
                        <div className="flex justify-between text-[10px] text-white/50 mb-1">
                          <span>{formatDate(inv.createdAt)}</span>
                          <span>{formatDate(inv.endDate)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-1">
                          <div 
                            className={`h-full ${isCompleted ? 'bg-white/40' : 'bg-gradient-to-r from-[#d4af37] to-[#a8810b]'}`} 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="text-right text-[10px] font-medium text-white/60">
                          {isCompleted ? 'Finished' : isCancelled ? 'Cancelled' : `${daysRemaining} days left`}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-sm font-bold text-[#00e676]">+${currentAccruedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-white/40 mt-1">Expected: ${expectedTotalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          {inv.status === 'active' && (
                            <button
                              onClick={() => handleCompleteEarly(inv.id)}
                              title="Complete Early"
                              className="p-1.5 rounded bg-[#00e676]/10 text-[#00e676] hover:bg-[#00e676]/20 transition-colors"
                            >
                              <CheckCircleIcon fontSize="small" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(inv)}
                            title="Edit Investment"
                            className="p-1.5 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                          <button
                            onClick={() => setDeletingId(inv.id)}
                            title="Delete"
                            className="p-1.5 rounded bg-[#ff1744]/10 text-[#ff1744] hover:bg-[#ff1744]/20 transition-colors"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 animate-fade-in relative">
            <button 
              onClick={() => setEditingId(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <CloseIcon fontSize="small" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Edit Investment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Amount ($)</label>
                <input 
                  type="number"
                  value={editForm.amount || ''}
                  onChange={(e) => setEditForm({...editForm, amount: Number(e.target.value)})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Daily ROI (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={editForm.dailyRoi || ''}
                    onChange={(e) => setEditForm({...editForm, dailyRoi: Number(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Duration (Days)</label>
                  <input 
                    type="number"
                    value={editForm.durationDays || ''}
                    onChange={(e) => setEditForm({...editForm, durationDays: Number(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Status</label>
                <select 
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] outline-none"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">End Date</label>
                <input 
                  type="date"
                  value={editForm.endDate || ''}
                  onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4af37] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] hover:opacity-90 text-white text-sm font-semibold transition-opacity disabled:opacity-50"
              >
                <SaveIcon fontSize="small" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm p-6 animate-fade-in relative border-l-4 border-[#ff1744]">
            <h2 className="text-lg font-bold text-white mb-2">Delete Investment?</h2>
            <p className="text-sm text-white/70 mb-4">
              This action will permanently remove the investment record from the database.
            </p>
            
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <div className="relative flex items-center">
                <input 
                  type="checkbox"
                  checked={refundOnDelete}
                  onChange={(e) => setRefundOnDelete(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-white/20 rounded bg-black/40 peer-checked:bg-[#d4af37] peer-checked:border-[#d4af37] transition-all"></div>
                <svg className="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-white/90">Refund capital to user's balance</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-[#ff1744]/20 hover:bg-[#ff1744]/30 text-[#ff1744] text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
