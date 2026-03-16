'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle } from 'lucide-react';

export function DeleteAccount() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch('/api/profile/delete', { method: 'DELETE' });
      router.push('/auth');
    } finally {
      setDeleting(false);
      setShowModal(false);
    }
  }

  return (
    <>
      {/* Delete section card */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ background: '#fff5f5', border: '1px solid #fecaca' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-700">Delete Account</h3>
            <p className="text-xs text-red-500 mt-0.5 leading-relaxed">
              Permanently removes your profile, points, badges, and all activity. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ background: '#dc2626' }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden bg-white">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start gap-3">
              <div className="shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Delete your account?</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  This will permanently erase your profile, all points, badges, and event history.{' '}
                  <span className="font-semibold text-red-600">This cannot be undone.</span>
                </p>
              </div>
            </div>

            {/* Type to confirm */}
            <div className="px-6 pb-5">
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: confirmText === 'DELETE' ? '#dc2626' : '#e5e7eb' }}
                placeholder="DELETE"
                autoFocus
              />
            </div>

            {/* Buttons */}
            <div
              className="px-6 py-4 flex gap-3 border-t"
              style={{ borderColor: '#f3f4f6', background: '#fafafa' }}
            >
              <button
                onClick={() => { setShowModal(false); setConfirmText(''); }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#f3f4f6', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || deleting}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40"
                style={{ background: '#dc2626' }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}