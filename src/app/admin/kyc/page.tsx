'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type KycRequest = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  documentName: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
};

export default function AdminKycPage() {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'kyc_requests'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as KycRequest));
      setRequests(data);
    } catch (err) {
      toast.error('Failed to fetch KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (req: KycRequest, action: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this KYC request as ${action}?`)) return;
    
    setProcessingId(req.id);
    try {
      // 1. Update request status
      await updateDoc(doc(db, 'kyc_requests', req.id), {
        status: action,
      });

      // 2. Update user profile status
      await updateDoc(doc(db, 'users', req.uid), {
        kycStatus: action,
        kycVerified: action === 'approved'
      });

      // 3. Send in-app notification
      await addDoc(collection(db, `users/${req.uid}/notifications`), {
        title: action === 'approved' ? 'KYC Approved ✅' : 'KYC Rejected ❌',
        message: action === 'approved' 
          ? 'Your identity has been verified. You now have full access to the platform.' 
          : 'Your recent document submission was rejected. Please check your settings and try again.',
        type: action === 'approved' ? 'success' : 'error',
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success(`KYC request ${action} successfully`);
      
      // Update local state
      setRequests(requests.map(r => r.id === req.id ? { ...r, status: action } : r));
    } catch (err) {
      toast.error('Failed to process KYC request');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">KYC Verification Queue</h1>
        <p className="text-white/50 text-sm">Review user identity documents.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Document Type</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">File</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">Loading requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">No KYC requests found.</td>
                </tr>
              ) : (
                requests.map((req) => {
                  const isProcessing = processingId === req.id;
                  return (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white text-sm">{req.displayName}</div>
                        <div className="text-xs text-white/40">{req.email}</div>
                        <div className="text-[10px] text-white/20 font-mono mt-1">{req.uid}</div>
                      </td>
                      <td className="p-4 text-sm text-white/80">
                        {req.documentName}
                      </td>
                      <td className="p-4">
                        <a 
                          href={req.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 text-[#d4af37] hover:bg-white/10 transition-colors text-xs font-medium"
                        >
                          <OpenInNewIcon sx={{ fontSize: 14 }} /> View Document
                        </a>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                          req.status === 'pending' ? 'bg-[#ffea00]/20 text-[#ffea00]' :
                          req.status === 'approved' ? 'bg-[#00e676]/20 text-[#00e676]' :
                          'bg-[#ff1744]/20 text-[#ff1744]'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(req, 'approved')}
                              disabled={isProcessing}
                              className="p-1.5 bg-[#00e676]/10 text-[#00e676] rounded hover:bg-[#00e676]/20 transition-colors disabled:opacity-50"
                              title="Approve KYC"
                            >
                              <CheckCircleIcon sx={{ fontSize: 20 }} />
                            </button>
                            <button
                              onClick={() => handleAction(req, 'rejected')}
                              disabled={isProcessing}
                              className="p-1.5 bg-[#ff1744]/10 text-[#ff1744] rounded hover:bg-[#ff1744]/20 transition-colors disabled:opacity-50"
                              title="Reject KYC"
                            >
                              <CancelIcon sx={{ fontSize: 20 }} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30 italic">Reviewed</span>
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
