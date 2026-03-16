'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShieldCheck, Phone, Pencil, Check, X, Palette,
  Upload, ImageIcon, Sparkles, AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const PRESETS = [
  { id: 'teal-purple', label: 'Aurora',   value: 'linear-gradient(120deg, #00605a 0%, #008A81 45%, #6943B6 100%)' },
  { id: 'sunset',      label: 'Sunset',   value: 'linear-gradient(120deg, #c2410c 0%, #ea580c 45%, #ffcc10 100%)' },
  { id: 'ocean',       label: 'Ocean',    value: 'linear-gradient(120deg, #1e3a5f 0%, #0369a1 50%, #38bdf8 100%)' },
  { id: 'forest',      label: 'Forest',   value: 'linear-gradient(120deg, #14532d 0%, #16a34a 55%, #bbf7d0 100%)' },
  { id: 'berry',       label: 'Berry',    value: 'linear-gradient(120deg, #581c87 0%, #9333ea 50%, #f0abfc 100%)' },
  { id: 'rose',        label: 'Rose',     value: 'linear-gradient(120deg, #9f1239 0%, #e11d48 50%, #fda4af 100%)' },
  { id: 'midnight',    label: 'Midnight', value: 'linear-gradient(120deg, #0f172a 0%, #1e293b 50%, #6943B6 100%)' },
  { id: 'golden',      label: 'Golden',   value: 'linear-gradient(120deg, #92400e 0%, #d97706 50%, #ffcc10 100%)' },
];

const LEVEL_TITLES: Record<number, string> = {
  1: 'Seedling', 2: 'Sprout', 3: 'Helper',
  4: 'Advocate', 5: 'Champion', 6: 'Guardian', 7: 'Legend',
};

function presetStyle(id: string) {
  return PRESETS.find(p => p.id === id)?.value ?? PRESETS[0].value;
}

function PresetGrid({
  selected,
  onSelect,
  hasCustom = false,
}: {
  selected: string;
  onSelect: (id: string) => void;
  hasCustom?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {PRESETS.map((p) => {
        const isSelected = selected === p.id && !hasCustom;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="relative h-11 rounded-xl overflow-hidden border-2 transition-all"
            style={{
              background: p.value,
              borderColor: isSelected ? '#101726' : 'transparent',
            }}
            title={p.label}
          >
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-4 w-4 text-white drop-shadow-md" />
              </div>
            )}
            <span className="absolute bottom-0 inset-x-0 text-[9px] text-white/80 text-center pb-0.5 bg-black/20">
              {p.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type Props = {
  volunteerId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  level: number;
  savedBannerId?: string | null;
  savedBannerImage?: string | null;
  savedGreetingId?: string | null;
  greeting: string;
  impactLine: string;
};

export function ProfileHeader({
  volunteerId: _volunteerId, name, email, phone, avatarUrl, level,
  savedBannerId, savedBannerImage, savedGreetingId,
  greeting, impactLine,
}: Props) {
  const router = useRouter();

  // Committed state
  const [displayName, setDisplayName] = useState(name ?? '');
  const [bannerId, setBannerId] = useState(savedBannerId ?? 'teal-purple');
  const [customBannerUrl, setCustomBannerUrl] = useState<string | null>(savedBannerImage ?? null);
  const [greetingId, setGreetingId] = useState(savedGreetingId ?? 'teal-purple');

  // Pending state (while panel is open)
  const [pendingName, setPendingName] = useState(name ?? '');
  const [pendingBannerId, setPendingBannerId] = useState(savedBannerId ?? 'teal-purple');
  const [pendingCustomUrl, setPendingCustomUrl] = useState<string | null>(savedBannerImage ?? null);
  const [pendingGreetingId, setPendingGreetingId] = useState(savedGreetingId ?? 'teal-purple');

  // Panel / UI state
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Phone verification state
  const [editablePhone, setEditablePhone] = useState(phone ?? '');
  const [verifStep, setVerifStep] = useState<'idle' | 'code' | 'verified'>(phone ? 'verified' : 'idle');
  const [verifCode, setVerifCode] = useState('');
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifError, setVerifError] = useState('');

  const levelTitle = LEVEL_TITLES[level] ?? `Level ${level}`;

  // Live preview styles while panel is open
  const greetingBg = panelOpen
    ? (PRESETS.find(p => p.id === pendingGreetingId)?.value ?? PRESETS[0].value)
    : (PRESETS.find(p => p.id === greetingId)?.value ?? PRESETS[0].value);

  const profileBannerStyle = panelOpen
    ? pendingCustomUrl
      ? { backgroundImage: `url(${pendingCustomUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: presetStyle(pendingBannerId) }
    : customBannerUrl
      ? { backgroundImage: `url(${customBannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: presetStyle(bannerId) };

  function openPanel() {
    setPendingName(displayName);
    setPendingBannerId(bannerId);
    setPendingCustomUrl(customBannerUrl);
    setPendingGreetingId(greetingId);
    setPanelOpen(true);
  }

  function handleCancel() {
    setPanelOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pendingName,
          banner_id: pendingBannerId,
          banner_image: pendingCustomUrl ?? null,
          greeting_id: pendingGreetingId,
        }),
      });
      setDisplayName(pendingName);
      setBannerId(pendingBannerId);
      setCustomBannerUrl(pendingCustomUrl);
      setGreetingId(pendingGreetingId);
      setPanelOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingCustomUrl(ev.target?.result as string);
      setPendingBannerId('custom');
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await fetch('/api/profile/delete', { method: 'DELETE' });
      router.push('/auth');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  const customizeBtn = "absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white/90 hover:text-white transition-colors";
  const customizeBtnBg = { background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)' };

  return (
    <>
      {/* Greeting Banner */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm relative"
        style={{ background: greetingBg }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        />
        <div className="relative px-6 py-4 pr-28">
          <p className="text-white font-semibold">{greeting}</p>
          <p className="text-white/70 text-sm mt-0.5 leading-relaxed">{impactLine}</p>
        </div>
        <button onClick={openPanel} className={customizeBtn} style={customizeBtnBg}>
          <Sparkles className="h-3.5 w-3.5" />
          Style
        </button>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Banner */}
        <div className="h-28 w-full relative" style={profileBannerStyle}>
          {!pendingCustomUrl && !customBannerUrl && (
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />
          )}
          <button onClick={openPanel} className={customizeBtn} style={customizeBtnBg}>
            <Palette className="h-3.5 w-3.5" />
            Customize
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-6 pb-6">
          <div
            className="flex items-end justify-between mb-4"
            style={{ marginTop: panelOpen ? '16px' : '-40px' }}
          >
            <div className="relative">
              <Avatar
                src={avatarUrl}
                name={displayName}
                size="lg"
                className="!h-20 !w-20 !text-2xl ring-4 ring-white shadow-md"
              />
              <div
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow"
                style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}
              >
                {level}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: '#f5f3ff', color: 'var(--third)' }}
              >
                <span className="text-base">🌱</span>
                {levelTitle}
              </div>
              {verifStep === 'verified' && (
                <StatusBadge
                  variant="trusted"
                  size="sm"
                  icon={<ShieldCheck className="h-3 w-3" />}
                  label="Trusted organizer"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 group">
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {displayName || 'Volunteer'}
            </h1>
            <button
              onClick={openPanel}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-black/5"
              title="Edit profile"
            >
              <Pencil className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
            </button>
          </div>
          {email && <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{email}</p>}
          {editablePhone && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {editablePhone}
              {verifStep === 'verified' && (
                <span className="ml-2 text-xs font-semibold text-green-700">
                  (phone verified)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Unified Edit Panel */}
      {panelOpen && (
        <div
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)' }}
        >
          {/* Panel header */}
          <div
            className="px-5 py-3 flex items-center justify-between border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--primary-pale)' }}
          >
            <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
              Edit Profile
            </span>
            <button onClick={handleCancel} className="p-1 rounded-lg hover:bg-black/5 transition-colors">
              <X className="h-4 w-4" style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          <div className="px-5 py-5 space-y-6">

            {/* Display Name */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--primary)' }}>
                Display Name
              </label>
              <input
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
                placeholder="Your display name"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Greeting Banner Style */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--primary)' }}>
                Greeting Banner Style
              </label>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                The welcome card at the top of your profile
              </p>
              <PresetGrid
                selected={pendingGreetingId}
                onSelect={setPendingGreetingId}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Profile Banner */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--primary)' }}>
                Profile Banner
              </label>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                The banner behind your avatar
              </p>
              <PresetGrid
                selected={pendingCustomUrl ? 'custom' : pendingBannerId}
                onSelect={(id) => { setPendingBannerId(id); setPendingCustomUrl(null); }}
                hasCustom={!!pendingCustomUrl}
              />

              {/* Custom image upload */}
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 border-dashed transition-all hover:border-solid disabled:opacity-50"
                  style={{
                    borderColor: pendingCustomUrl ? 'var(--primary)' : '#d1d5db',
                    color: pendingCustomUrl ? 'var(--primary)' : '#6b7280',
                    background: pendingCustomUrl ? 'var(--primary-pale)' : '#f9fafb',
                  }}
                >
                  {uploading
                    ? <><div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> Loading…</>
                    : pendingCustomUrl
                      ? <><ImageIcon className="h-4 w-4" /> Custom image ✓</>
                      : <><Upload className="h-4 w-4" /> Upload image</>
                  }
                </button>
                {pendingCustomUrl && (
                  <div className="relative">
                    <div
                      className="h-10 w-16 rounded-lg border-2 overflow-hidden"
                      style={{ backgroundImage: `url(${pendingCustomUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderColor: 'var(--primary)' }}
                    />
                    <button
                      onClick={() => { setPendingCustomUrl(null); setPendingBannerId(bannerId); }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <p className="text-[10px] mt-1.5 text-gray-400">JPG, PNG, GIF, WebP — any image from your device</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Phone & SMS verification */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Phone className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                  Phone (optional)
                </label>
              </div>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>
                Add your number to receive SMS updates. Verifying earns you a{' '}
                <span className="font-semibold" style={{ color: 'var(--primary)' }}>Trusted Organizer</span>{' '}
                badge visible to others.
              </p>

              {/* Phone input row */}
              <div className="flex items-center gap-2">
                <input
                  value={editablePhone}
                  onChange={(e) => {
                    setEditablePhone(e.target.value);
                    if (verifStep === 'verified') setVerifStep('idle');
                  }}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
                  placeholder="e.g. +1 555 000 0000"
                  aria-label="Phone number"
                />
                <button
                  type="button"
                  onClick={async () => {
                    setVerifError('');
                    if (!editablePhone.trim()) {
                      setVerifError('Please enter a phone number first.');
                      return;
                    }
                    try {
                      setVerifLoading(true);
                      const supabase = createClient();
                      const { error } = await supabase.auth.signInWithOtp({ phone: editablePhone.trim() });
                      if (error) throw error;
                      setVerifStep('code');
                    } catch (err) {
                      setVerifError(err instanceof Error ? err.message : 'Failed to send code');
                    } finally {
                      setVerifLoading(false);
                    }
                  }}
                  disabled={verifLoading}
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
                  style={{ background: 'var(--primary)' }}
                >
                  {verifLoading ? 'Sending…' : verifStep === 'verified' ? 'Reverify' : 'Send code'}
                </button>
              </div>

              {/* Verification status */}
              <div className="mt-2.5 min-h-[20px]">
                {verifStep === 'verified' ? (
                  <StatusBadge
                    variant="verified"
                    size="sm"
                    icon={<ShieldCheck className="h-3 w-3" />}
                    label="Phone verified"
                  />
                ) : editablePhone.trim() ? (
                  <StatusBadge variant="warning" size="sm" label="Not yet verified" />
                ) : null}
              </div>

              {/* OTP code entry */}
              {verifStep === 'code' && (
                <div
                  className="mt-3 p-3 rounded-xl"
                  style={{ background: 'var(--primary-pale)', border: '1px solid var(--border)' }}
                >
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--primary)' }}>
                    Enter the 6-digit code sent to {editablePhone}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      value={verifCode}
                      onChange={(e) => setVerifCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl border text-sm font-mono tracking-widest text-center outline-none transition-all"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
                      placeholder="000000"
                      inputMode="numeric"
                      maxLength={6}
                      aria-label="Verification code"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        setVerifError('');
                        if (!verifCode.trim()) {
                          setVerifError('Enter the code we sent you.');
                          return;
                        }
                        try {
                          setVerifLoading(true);
                          const supabase = createClient();
                          const { error } = await supabase.auth.verifyOtp({
                            phone: editablePhone.trim(),
                            token: verifCode.trim(),
                            type: 'sms',
                          });
                          if (error) throw error;
                          await fetch('/api/profile/update', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              phone: editablePhone.trim(),
                              phone_verified: true,
                            }),
                          });
                          setVerifStep('verified');
                          setVerifCode('');
                        } catch (err) {
                          setVerifError(err instanceof Error ? err.message : 'Invalid or expired code');
                        } finally {
                          setVerifLoading(false);
                        }
                      }}
                      disabled={verifLoading || verifCode.length < 6}
                      className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
                      style={{ background: '#15803d' }}
                      aria-disabled={verifLoading || verifCode.length < 6}
                      aria-label={
                        verifCode.length < 6
                          ? 'Enter all 6 digits to verify'
                          : verifLoading
                            ? 'Verifying code…'
                            : 'Verify code'
                      }
                    >
                      {verifLoading ? 'Verifying…' : 'Verify'}
                    </button>
                  </div>
                </div>
              )}

              {/* Inline error */}
              {verifError && (
                <p className="mt-2 text-xs font-medium text-red-600">{verifError}</p>
              )}
            </div>
          </div>

          {/* Panel footer */}
          <div
            className="px-5 py-3 flex items-center justify-between border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--primary-pale)' }}
          >
            <button
              onClick={handleCancel}
              className="text-sm font-medium px-4 py-1.5 rounded-xl transition-colors"
              style={{ color: 'var(--muted)', background: '#fff', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !pendingName.trim()}
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ background: 'var(--primary)' }}
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden bg-white">
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
            <div className="px-6 pb-5">
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: deleteConfirmText === 'DELETE' ? '#dc2626' : '#e5e7eb' }}
                placeholder="DELETE"
                autoFocus
              />
            </div>
            <div
              className="px-6 py-4 flex gap-3 border-t"
              style={{ borderColor: '#f3f4f6', background: '#fafafa' }}
            >
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#f3f4f6', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
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