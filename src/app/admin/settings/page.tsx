'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SaveIcon from '@mui/icons-material/Save';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import { Star } from '@mui/icons-material';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, setDoc,
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ── Constants ──────────────────────────────────────────────────────────────────

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
];

const PLANS = ['Starter Plan', 'Growth Plan', 'Premium Plan', 'Elite Plan'];

const LOCATIONS = [
  // 🇺🇸 USA — all 50 states
  'Alabama, USA', 'Alaska, USA', 'Arizona, USA', 'Arkansas, USA',
  'California, USA', 'Colorado, USA', 'Connecticut, USA', 'Delaware, USA',
  'Florida, USA', 'Georgia, USA', 'Hawaii, USA', 'Idaho, USA',
  'Illinois, USA', 'Indiana, USA', 'Iowa, USA', 'Kansas, USA',
  'Kentucky, USA', 'Louisiana, USA', 'Maine, USA', 'Maryland, USA',
  'Massachusetts, USA', 'Michigan, USA', 'Minnesota, USA', 'Mississippi, USA',
  'Missouri, USA', 'Montana, USA', 'Nebraska, USA', 'Nevada, USA',
  'New Hampshire, USA', 'New Jersey, USA', 'New Mexico, USA', 'New York, USA',
  'North Carolina, USA', 'North Dakota, USA', 'Ohio, USA', 'Oklahoma, USA',
  'Oregon, USA', 'Pennsylvania, USA', 'Rhode Island, USA', 'South Carolina, USA',
  'South Dakota, USA', 'Tennessee, USA', 'Texas, USA', 'Utah, USA',
  'Vermont, USA', 'Virginia, USA', 'Washington, USA', 'West Virginia, USA',
  'Wisconsin, USA', 'Wyoming, USA',
  // 🇬🇧 United Kingdom
  'England, UK', 'Scotland, UK',
  // 🇨🇦 Canada — provinces
  'Ontario, Canada', 'British Columbia, Canada', 'Alberta, Canada',
  'Quebec, Canada', 'Manitoba, Canada', 'Saskatchewan, Canada',
  'Nova Scotia, Canada', 'New Brunswick, Canada',
];

// ── Types ──────────────────────────────────────────────────────────────────────

type Testimonial = {
  id?: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
  plan: string;
};

const EMPTY_TESTIMONIAL: Testimonial = {
  name: '',
  location: 'California, USA',
  avatar: '',
  rating: 5,
  text: '',
  plan: 'Growth Plan',
};

// ── Star Rating picker ─────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          {s <= value
            ? <StarIcon sx={{ color: '#ffea00', fontSize: 22 }} />
            : <Star sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 22 }} />}
        </button>
      ))}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

function TestimonialModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Testimonial;
  onClose: () => void;
  onSave: (t: Testimonial) => Promise<void>;
}) {
  const [form, setForm] = useState<Testimonial>(initial);
  const [saving, setSaving] = useState(false);

  // Auto-generate avatar initials from name
  const handleNameChange = (name: string) => {
    const parts = name.trim().split(' ');
    const initials = parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0]?.[0]?.toUpperCase() ?? '';
    setForm((f) => ({ ...f, name, avatar: initials }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error('Name and review text are required.');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
        <h3 className="text-white font-bold text-lg">
          {initial.id ? 'Edit Testimonial' : 'Add Testimonial'}
        </h3>

        {/* Name */}
        <div>
          <label className="block text-white/50 text-xs mb-1">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. James R."
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#d4af37]/60 transition-colors"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-white/50 text-xs mb-1">Location</label>
          <select
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#d4af37]/60 transition-colors appearance-none"
          >
            <optgroup label="🇺🇸 United States" className="bg-[#0f1117]">
              {LOCATIONS.filter(l => l.endsWith(', USA')).map((s) => (
                <option key={s} value={s} className="bg-[#0f1117]">{s}</option>
              ))}
            </optgroup>
            <optgroup label="🇬🇧 United Kingdom" className="bg-[#0f1117]">
              {LOCATIONS.filter(l => l.endsWith(', UK')).map((s) => (
                <option key={s} value={s} className="bg-[#0f1117]">{s}</option>
              ))}
            </optgroup>
            <optgroup label="🇨🇦 Canada" className="bg-[#0f1117]">
              {LOCATIONS.filter(l => l.endsWith(', Canada')).map((s) => (
                <option key={s} value={s} className="bg-[#0f1117]">{s}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Plan */}
        <div>
          <label className="block text-white/50 text-xs mb-1">Investment Plan</label>
          <select
            value={form.plan}
            onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#d4af37]/60 transition-colors appearance-none"
          >
            {PLANS.map((p) => (
              <option key={p} value={p} className="bg-[#0f1117]">{p}</option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-white/50 text-xs mb-2">Rating</label>
          <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
        </div>

        {/* Review text */}
        <div>
          <label className="block text-white/50 text-xs mb-1">Review Text</label>
          <textarea
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            rows={4}
            placeholder="Write the testimonial text here..."
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#d4af37]/60 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Testimonial'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  // Currency
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tLoading, setTLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  // ── Load currency ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) setCurrency(snap.data().currency || 'USD');
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // ── Load testimonials ────────────────────────────────────────────────────────
  const loadTestimonials = async () => {
    setTLoading(true);
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      const items: Testimonial[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<Testimonial, 'id'>) }));
      setTestimonials(items);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setTLoading(false);
    }
  };

  useEffect(() => { loadTestimonials(); }, []);

  // ── Save currency ────────────────────────────────────────────────────────────
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

  // ── Testimonial CRUD ─────────────────────────────────────────────────────────
  const handleSaveTestimonial = async (t: Testimonial) => {
    try {
      const { id, ...data } = t;
      const payload = { ...data };
      if (id) {
        await updateDoc(doc(db, 'testimonials', id), { ...payload, updatedAt: serverTimestamp() });
        toast.success('Testimonial updated!');
      } else {
        await addDoc(collection(db, 'testimonials'), { ...data, createdAt: serverTimestamp() });
        toast.success('Testimonial added!');
      }
      setModalOpen(false);
      setEditing(null);
      await loadTestimonials();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast.success('Testimonial deleted.');
      await loadTestimonials();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete testimonial');
    }
  };

  const openAdd = () => { setEditing(EMPTY_TESTIMONIAL); setModalOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setModalOpen(true); };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {modalOpen && editing && (
        <TestimonialModal
          initial={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSaveTestimonial}
        />
      )}

      <div className="animate-fade-in space-y-8">
        {/* Header */}
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
          {/* ── Currency ─────────────────────────────────────────────────────── */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <AttachMoneyIcon className="text-[#d4af37]" />
              <h2 className="text-lg font-bold text-white">Platform Currency</h2>
            </div>
            <p className="text-white/50 text-sm mb-6">
              Set the default fiat currency used across the platform for deposits, withdrawals, and displaying balances.
            </p>

            {loading ? (
              <div className="animate-pulse h-10 bg-white/10 rounded-lg w-full max-w-sm" />
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

        {/* ── Testimonials ───────────────────────────────────────────────────── */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FormatQuoteIcon className="text-[#d4af37]" />
              <h2 className="text-lg font-bold text-white">Testimonials</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                {testimonials.length} reviews
              </span>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/20 transition-colors"
            >
              <AddIcon sx={{ fontSize: 16 }} />
              Add Testimonial
            </button>
          </div>
          <p className="text-white/50 text-sm mb-6">
            Manage the testimonials displayed on the landing page. All locations are restricted to US states.
          </p>

          {tLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl">
              <FormatQuoteIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-white/40 text-sm mt-3">No testimonials yet.</p>
              <button
                onClick={openAdd}
                className="mt-4 px-4 py-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/20 transition-colors"
              >
                Add your first testimonial
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-4 bg-black/30 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#a8810b] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.avatar || t.name?.[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{t.name}</span>
                      <span className="text-white/40 text-xs">{t.location}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                        {t.plan}
                      </span>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((s) =>
                        s <= t.rating
                          ? <StarIcon key={s} sx={{ color: '#ffea00', fontSize: 12 }} />
                          : <Star key={s} sx={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }} />
                      )}
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed line-clamp-2">"{t.text}"</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(t)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-colors"
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </button>
                    <button
                      onClick={() => t.id && handleDelete(t.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-[#ff1744] hover:border-[#ff1744]/40 transition-colors"
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
