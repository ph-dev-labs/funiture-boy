'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningIcon from '@mui/icons-material/Warning';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

async function uploadToCloudinary(file: File, uid: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `kyc/${uid}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}

export default function UserSettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc'>('profile');

  // Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // KYC State
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadingKyc, setUploadingKyc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const kycStatus = user?.kycVerified ? 'approved' : user?.kycStatus || 'unverified';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName });
      setUser({ ...user, displayName });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !docName) {
      toast.error('Please provide a document name and file.');
      return;
    }

    setUploadingKyc(true);
    setUploadProgress('Uploading document...');
    try {
      // 1. Upload to Cloudinary (free, no Storage needed)
      const downloadURL = await uploadToCloudinary(file, user.uid);
      setUploadProgress('Saving to database...');

      // 2. Create KYC request in Firestore
      await addDoc(collection(db, 'kyc_requests'), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        documentName: docName,
        documentUrl: downloadURL,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // 3. Update user KYC status to pending
      await updateDoc(doc(db, 'users', user.uid), { kycStatus: 'pending' });
      setUser({ ...user, kycStatus: 'pending' });

      toast.success('KYC Document submitted for review!');
      setDocName('');
      setFile(null);
      setUploadProgress('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Upload failed. Check your Cloudinary config.');
      setUploadProgress('');
    } finally {
      setUploadingKyc(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings & Verification</h1>
        <p className="text-white/50 text-sm">Manage your profile and KYC verification.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-[#d4af37]/10 text-[#d4af37]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'kyc'
              ? 'bg-[#a8810b]/10 text-[#a8810b]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          KYC Verification
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a8810b] to-[#d4af37] flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_15px_rgba(168,129,11,0.3)]">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'TR'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.displayName || 'Trader'}</h2>
              <p className="text-white/50 text-sm">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#d4af37]/60 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Email Address (Read-only)</label>
              <input
                disabled
                value={user?.email || ''}
                className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3.5 text-white/50 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Account ID (Read-only)</label>
              <input
                disabled
                value={user?.uid || ''}
                className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3.5 text-white/30 outline-none cursor-not-allowed font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile || displayName === user?.displayName}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-40"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === 'kyc' && (
        <div className="glass-panel p-6 sm:p-8">
          {/* Status Banner */}
          <div className="flex items-start gap-4 mb-8 p-4 rounded-xl border border-white/10 bg-black/20">
            {kycStatus === 'approved' ? (
              <VerifiedUserIcon sx={{ color: '#00e676', fontSize: 28, flexShrink: 0 }} />
            ) : (
              <WarningIcon
                sx={{
                  color: kycStatus === 'pending' ? '#ffea00' : '#ff1744',
                  fontSize: 28,
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              <h3 className="text-white font-bold mb-1">
                KYC Status:{' '}
                <span
                  className="uppercase tracking-wide ml-1"
                  style={{
                    color:
                      kycStatus === 'approved'
                        ? '#00e676'
                        : kycStatus === 'pending'
                        ? '#ffea00'
                        : '#ff1744',
                  }}
                >
                  {kycStatus}
                </span>
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {kycStatus === 'approved' &&
                  'Your identity has been verified. You have full access to all platform features.'}
                {kycStatus === 'pending' &&
                  'Your document is under review. This typically takes up to 24 hours.'}
                {kycStatus === 'unverified' &&
                  "Upload a government-issued ID (Passport, Driver's License, or National ID) to verify your account."}
                {kycStatus === 'rejected' &&
                  'Your previous submission was rejected. Please ensure the document is clear and valid, then resubmit.'}
              </p>
            </div>
          </div>

          {(kycStatus === 'unverified' || kycStatus === 'rejected') && (
            <form onSubmit={handleKycSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Document Type / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. International Passport"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-[#a8810b]/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Upload Document
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-black/20 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col items-center justify-center py-4">
                    <CloudUploadIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 36, mb: 1 }} />
                    <p className="text-sm text-white/60 font-medium">
                      {file ? (
                        <span className="text-[#d4af37]">{file.name}</span>
                      ) : (
                        'Click to select a file'
                      )}
                    </p>
                    <p className="text-xs text-white/30 mt-1">PNG, JPG or PDF (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {uploadProgress && (
                <div className="text-sm text-[#d4af37] flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
                  {uploadProgress}
                </div>
              )}

              <button
                type="submit"
                disabled={uploadingKyc || !file || !docName}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#a8810b] to-[#ff0055] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-40"
              >
                {uploadingKyc ? 'Uploading...' : 'Submit for Verification'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
