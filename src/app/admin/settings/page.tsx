'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import SaveIcon from '@mui/icons-material/Save';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Add other settings here in the future
    setTimeout(() => {
      setSaving(false);
      toast.success('System configuration saved!');
    }, 1000);
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
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <SaveIcon sx={{ fontSize: 18 }} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass-panel p-6">
           <h2 className="text-lg font-bold text-white mb-4">General Settings</h2>
           <p className="text-white/50 text-sm">No general settings configured yet. Wallets and Investment Plans have been moved to their own dedicated pages in the sidebar.</p>
        </div>
      </div>
    </div>
  );
}
