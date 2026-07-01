'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

type TxData = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  amount: number;
  asset?: string;
  network?: string;
  txHash?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  _type: 'deposit' | 'withdrawal';
};

const sendEmail = (payload: object) =>
  fetch('/api/email/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

const sendInAppNotification = (uid: string, title: string, message: string, type = 'info') =>
  addDoc(collection(db, `users/${uid}/notifications`), {
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<TxData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal'>('deposit');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [depSnap, withSnap] = await Promise.all([
        getDocs(query(collection(db, 'deposits'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'))),
      ]);

      const deposits: TxData[] = depSnap.docs.map(d => ({ id: d.id, _type: 'deposit', ...d.data() } as TxData));
      const withdrawals: TxData[] = withSnap.docs.map(d => ({ id: d.id, _type: 'withdrawal', ...d.data() } as TxData));

      setTxs([...deposits, ...withdrawals]);
    } catch (err) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (tx: TxData, action: 'approved' | 'rejected') => {
    if (!confirm(`Mark this ${tx._type} as ${action}?`)) return;

    setProcessingId(tx.id);
    const collection_name = tx._type === 'deposit' ? 'deposits' : 'withdrawals';

    try {
      // 1. Update status in Firestore
      await updateDoc(doc(db, collection_name, tx.id), { status: action });

      // 2. Credit/debit balance based on action
      if (tx._type === 'deposit' && action === 'approved') {
        await updateDoc(doc(db, 'users', tx.uid), {
          balance: increment(tx.amount),
        });
      } else if (tx._type === 'withdrawal' && action === 'rejected') {
        // Refund balance if withdrawal is rejected
        await updateDoc(doc(db, 'users', tx.uid), {
          balance: increment(tx.amount),
        });
      }

      // 3. Log transaction for approved deposit
      if (tx._type === 'deposit' && action === 'approved') {
        await addDoc(collection(db, 'transactions'), {
          uid: tx.uid,
          type: 'deposit',
          amount: tx.amount,
          description: `Deposit approved via ${tx.asset || 'crypto'}`,
          status: 'completed',
          createdAt: serverTimestamp(),
        });
      }

      // 4. Send EMAIL notification (deposit & withdrawal only)
      await sendEmail({
        email: tx.email,
        name: tx.displayName,
        type: action === 'approved'
          ? `${tx._type}_approved`
          : `${tx._type}_rejected`,
        amount: `$${tx.amount.toFixed(2)}`,
        currency: tx.asset || 'USD',
        status: action,
      });

      // 5. Send in-app notification
      const isApproved = action === 'approved';
      await sendInAppNotification(
        tx.uid,
        isApproved
          ? (tx._type === 'deposit' ? '✅ Deposit Approved' : '✅ Withdrawal Processed')
          : (tx._type === 'deposit' ? '❌ Deposit Rejected' : '❌ Withdrawal Rejected'),
        isApproved
          ? (tx._type === 'deposit'
            ? `Your deposit of $${tx.amount.toFixed(2)} has been approved and added to your balance.`
            : `Your withdrawal of $${tx.amount.toFixed(2)} has been processed.`)
          : (tx._type === 'deposit'
            ? `Your deposit of $${tx.amount.toFixed(2)} was rejected. Please contact support.`
            : `Your withdrawal of $${tx.amount.toFixed(2)} was rejected and refunded to your balance.`),
        isApproved ? 'success' : 'error'
      );

      toast.success(`${tx._type} ${action} successfully`);
      setTxs(txs.map(t => t.id === tx.id ? { ...t, status: action } : t));
    } catch (err) {
      toast.error('Failed to process transaction');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = txs.filter(t => t._type === activeTab);
  const pendingCount = txs.filter(t => t.status === 'pending').length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manage Transactions</h1>
          <p className="text-white/50 text-sm">Review and approve deposit & withdrawal requests.</p>
        </div>
        {pendingCount > 0 && (
          <span className="text-xs font-bold bg-[#ffea00]/10 text-[#ffea00] px-3 py-1.5 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(['deposit', 'withdrawal'] as const).map(tab => {
          const count = txs.filter(t => t._type === tab && t.status === 'pending').length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all -mb-px flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-[#d4af37] text-[#d4af37]'
                  : 'border-transparent text-white/40 hover:text-white'
              }`}
            >
              {tab}s
              {count > 0 && (
                <span className="bg-[#ffea00]/20 text-[#ffea00] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Amount</th>
                {activeTab === 'deposit' && (
                  <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">TxHash</th>
                )}
                {activeTab === 'withdrawal' && (
                  <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Address / Network</th>
                )}
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-white/50">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-white/50">No {activeTab}s found.</td></tr>
              ) : (
                filtered.map((t) => {
                  const isProcessing = processingId === t.id;
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white text-sm">{t.displayName}</div>
                        <div className="text-xs text-white/40">{t.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm font-bold">${t.amount.toFixed(2)}</div>
                        <div className="text-xs text-white/50">{t.asset || t.network}</div>
                      </td>
                      {activeTab === 'deposit' && (
                        <td className="p-4">
                          <div className="text-xs font-mono text-[#d4af37] bg-[#d4af37]/10 px-2 py-1 rounded inline-block max-w-[150px] truncate" title={t.txHash}>
                            {t.txHash || '—'}
                          </div>
                        </td>
                      )}
                      {activeTab === 'withdrawal' && (
                        <td className="p-4">
                          <div className="text-xs font-mono text-white/70 max-w-[160px] truncate">{t.address}</div>
                          <div className="text-xs text-white/40 mt-0.5">{t.network}</div>
                        </td>
                      )}
                      <td className="p-4 text-xs text-white/40">
                        {t.createdAt?.toDate ? new Date(t.createdAt.toDate()).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase ${
                          t.status === 'pending' ? 'bg-[#ffea00]/20 text-[#ffea00]' :
                          t.status === 'approved' ? 'bg-[#00e676]/20 text-[#00e676]' :
                          'bg-[#ff1744]/20 text-[#ff1744]'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {t.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(t, 'approved')}
                              disabled={isProcessing}
                              className="p-1.5 bg-[#00e676]/10 text-[#00e676] rounded hover:bg-[#00e676]/20 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircleIcon sx={{ fontSize: 20 }} />
                            </button>
                            <button
                              onClick={() => handleAction(t, 'rejected')}
                              disabled={isProcessing}
                              className="p-1.5 bg-[#ff1744]/10 text-[#ff1744] rounded hover:bg-[#ff1744]/20 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <CancelIcon sx={{ fontSize: 20 }} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30 italic">Processed</span>
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
