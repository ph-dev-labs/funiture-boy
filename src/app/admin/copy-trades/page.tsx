'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

type CopyTrade = {
  id: string;
  title: string;
  traderName: string;
  description: string;
  price: number;
  returnRate: string;
  winRate: string;
  minBalance: number;
  active: boolean;
};

type Subscription = {
  id: string;
  uid: string;
  userEmail: string;
  copyTradeId: string;
  tradeTitle: string;
  price: number;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  createdAt: any;
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-[#00e676]/10 text-[#00e676]',
  paused: 'bg-yellow-500/10 text-yellow-400',
  expired: 'bg-white/10 text-white/50',
  cancelled: 'bg-[#ff0055]/10 text-[#ff0055]',
};

const EMPTY_TRADE: Omit<CopyTrade, 'id'> = {
  title: '',
  traderName: '',
  description: '',
  price: 0,
  returnRate: '',
  winRate: '',
  minBalance: 0,
  active: true,
};

export default function AdminCopyTradesPage() {
  const [trades, setTrades] = useState<CopyTrade[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CopyTrade, 'id'>>(EMPTY_TRADE);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const tradesSnap = await getDocs(collection(db, 'copyTrades'));
      setTrades(tradesSnap.docs.map(d => ({ id: d.id, ...d.data() } as CopyTrade)));

      const subsSnap = await getDocs(query(collection(db, 'copyTradeSubscriptions'), orderBy('createdAt', 'desc')));
      setSubs(subsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subscription)));
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrade = async () => {
    if (!form.title || !form.price) {
      toast.error('Title and price are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'copyTrades', editingId), form as any);
        setTrades(trades.map(t => t.id === editingId ? { id: editingId, ...form } : t));
        toast.success('Trade updated!');
      } else {
        const ref = await addDoc(collection(db, 'copyTrades'), {
          ...form,
          createdAt: serverTimestamp(),
        });
        setTrades([...trades, { id: ref.id, ...form }]);
        toast.success('Trade ad created!');
      }
      setForm(EMPTY_TRADE);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      toast.error('Failed to save trade');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this copy trade ad?')) return;
    try {
      await deleteDoc(doc(db, 'copyTrades', id));
      setTrades(trades.filter(t => t.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEditStart = (t: CopyTrade) => {
    const { id, ...rest } = t;
    setForm(rest);
    setEditingId(id);
    setShowForm(true);
  };

  const handleToggleActive = async (t: CopyTrade) => {
    try {
      await updateDoc(doc(db, 'copyTrades', t.id), { active: !t.active });
      setTrades(trades.map(tr => tr.id === t.id ? { ...tr, active: !tr.active } : tr));
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleSubStatusChange = async (subId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'copyTradeSubscriptions', subId), { status });
      setSubs(subs.map(s => s.id === subId ? { ...s, status: status as Subscription['status'] } : s));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center text-white/50">Loading Copy Trades...</div>;

  return (
    <div className="animate-fade-in space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Copy Trades</h1>
          <p className="text-white/50 text-sm">Create and manage copy trade ads for users.</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_TRADE); setEditingId(null); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
        >
          <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
          New Trade Ad
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="glass-panel p-6 border border-[#d4af37]/30">
          <h2 className="text-lg font-bold text-white mb-5">{editingId ? 'Edit Trade Ad' : 'Create New Trade Ad'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Title', key: 'title', type: 'text', placeholder: 'e.g. BTC Scalping Strategy' },
              { label: 'Trader Name', key: 'traderName', type: 'text', placeholder: 'e.g. Expert Trader A' },
              { label: 'Price ($)', key: 'price', type: 'number', placeholder: '99' },
              { label: 'Return Rate', key: 'returnRate', type: 'text', placeholder: 'e.g. +28% monthly' },
              { label: 'Win Rate', key: 'winRate', type: 'text', placeholder: 'e.g. 94%' },
              { label: 'Min Balance ($)', key: 'minBalance', type: 'number', placeholder: '500' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] text-white/40 uppercase block mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                  placeholder={placeholder}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>
            ))}
            <div className="md:col-span-2 xl:col-span-3">
              <label className="text-[10px] text-white/40 uppercase block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the copy trade strategy..."
                rows={3}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#d4af37] transition-colors resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[#d4af37]" />
              <label htmlFor="active" className="text-sm text-white/60">Visible to users</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveTrade}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <SaveIcon sx={{ fontSize: 18 }} /> {saving ? 'Saving...' : 'Save Trade Ad'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Trade Ads List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Published Trade Ads</h2>
        {trades.length === 0 && <p className="text-white/40 text-sm italic">No trade ads created yet.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trades.map(t => (
            <div key={t.id} className={`glass-panel p-5 flex flex-col gap-3 border-l-4 ${t.active ? 'border-[#d4af37]' : 'border-white/10'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-sm">{t.title}</div>
                  <div className="text-white/40 text-xs">{t.traderName}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${t.active ? 'bg-[#00e676]/10 text-[#00e676]' : 'bg-white/5 text-white/40'}`}>
                  {t.active ? 'Live' : 'Hidden'}
                </span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{t.description}</p>
              <div className="flex gap-4 text-xs">
                <div><span className="text-white/40">Price:</span> <span className="text-[#d4af37] font-bold">${t.price}</span></div>
                <div><span className="text-white/40">ROI:</span> <span className="text-[#00e676]">{t.returnRate}</span></div>
                <div><span className="text-white/40">Win:</span> <span className="text-white">{t.winRate}</span></div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleEditStart(t)} className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors px-2 py-1 rounded-lg bg-white/5">
                  <EditIcon sx={{ fontSize: 14 }} /> Edit
                </button>
                <button onClick={() => handleToggleActive(t)} className="flex items-center gap-1 text-xs text-white/50 hover:text-[#d4af37] transition-colors px-2 py-1 rounded-lg bg-white/5">
                  <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> {t.active ? 'Hide' : 'Publish'}
                </button>
                <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 text-xs text-white/50 hover:text-[#ff0055] transition-colors px-2 py-1 rounded-lg bg-white/5 ml-auto">
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <PeopleAltOutlinedIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.5)' }} />
          <h2 className="text-lg font-semibold text-white">User Subscriptions</h2>
          <span className="ml-2 text-xs bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded-full">{subs.length} total</span>
        </div>

        {subs.length === 0 && <p className="text-white/40 text-sm italic">No subscriptions yet.</p>}

        <div className="glass-panel overflow-hidden">
          {subs.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">User</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">Trade Ad</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">Price Paid</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">Date</th>
                  <th className="text-left text-white/40 font-medium px-5 py-3 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-white/80">{s.userEmail}</td>
                    <td className="px-5 py-3 text-white/80">{s.tradeTitle}</td>
                    <td className="px-5 py-3 text-[#d4af37] font-semibold">${s.price}</td>
                    <td className="px-5 py-3 text-white/50 text-xs">
                      {s.createdAt?.toDate ? new Date(s.createdAt.toDate()).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={s.status}
                        onChange={e => handleSubStatusChange(s.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[s.status]} bg-transparent`}
                      >
                        <option value="active" className="bg-[#0a0b10] text-white">Active</option>
                        <option value="paused" className="bg-[#0a0b10] text-white">Paused</option>
                        <option value="expired" className="bg-[#0a0b10] text-white">Expired</option>
                        <option value="cancelled" className="bg-[#0a0b10] text-white">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
