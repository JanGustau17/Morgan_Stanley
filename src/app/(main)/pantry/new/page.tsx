'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Camera, ShieldCheck, Eye, Send, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Basic Info', icon: '📋' },
  { id: 2, label: 'Location', icon: '📍' },
  { id: 3, label: 'Details', icon: '🏪' },
  { id: 4, label: 'Photos', icon: '📸' },
  { id: 5, label: 'Verify', icon: '✅' },
  { id: 6, label: 'Preview', icon: '👁' },
  { id: 7, label: 'Submit', icon: '🚀' },
];

const PANTRY_TYPES = ['Food Pantry', 'Soup Kitchen', 'Community Fridge', 'Food Bank', 'Mobile Pantry'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DIETARY = ['Halal', 'Kosher', 'Vegan', 'Gluten-Free', 'Diabetic-Friendly', 'Baby/Infant Food'];

type FormData = {
  name: string;
  type: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  hours: Record<string, string>;
  serves: string;
  requirements: string;
  dietary: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  photos: string[];
  orgName: string;
  orgWebsite: string;
  agreeTerms: boolean;
};

const INITIAL: FormData = {
  name: '',
  type: '',
  description: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  hours: {},
  serves: '',
  requirements: '',
  dietary: [],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  photos: [],
  orgName: '',
  orgWebsite: '',
  agreeTerms: false,
};

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full bg-[#e8e0cc] rounded-full h-1.5 mb-8">
      <motion.div
        className="h-full rounded-full"
        style={{ background: '#5C3D8F' }}
        initial={{ width: 0 }}
        animate={{ width: `${((step - 1) / (total - 1)) * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const isCompleted = step > s.id;
        const isCurrent = step === s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[52px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#008A81] text-white'
                    : isCurrent
                    ? 'bg-[#5C3D8F] text-white shadow-lg scale-110'
                    : 'bg-[#e8e0cc] text-[#101726]/40'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : s.icon}
              </div>
              <span
                className={`text-[9px] font-medium leading-none text-center ${
                  isCurrent ? 'text-[#5C3D8F] font-bold' : 'text-[#101726]/40'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-3 mx-0.5 mb-4 transition-colors ${
                  step > s.id ? 'bg-[#008A81]' : 'bg-[#e8e0cc]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ListPantryPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  function update(field: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDietary(tag: string) {
    setForm((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(tag)
        ? prev.dietary.filter((d) => d !== tag)
        : [...prev.dietary, tag],
    }));
  }

  function toggleDay(day: string, checked: boolean) {
    setForm((prev) => {
      const hours = { ...prev.hours };
      if (checked) {
        hours[day] = '9:00 AM – 5:00 PM';
      } else {
        delete hours[day];
      }
      return { ...prev, hours };
    });
  }

  function next() { setStep((s) => Math.min(s + 1, STEPS.length)); }
  function prev() { setStep((s) => Math.max(s - 1, 1)); }

  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fff6E0] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="bg-white rounded-3xl border border-[#e8e0cc] shadow-xl p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: '#008A8118' }}
          >
            <Check className="w-12 h-12 text-[#008A81]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#101726] mb-3" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Listing submitted! 🎉
          </h1>
          <p className="text-[#101726]/60 mb-2">
            <strong className="text-[#101726]">{form.name || 'Your pantry'}</strong> is under review.
          </p>
          <p className="text-sm text-[#101726]/50 mb-8">
            Our team will verify the details within 2–3 business days. You&apos;ll receive a confirmation at{' '}
            <span className="font-medium">{form.contactEmail || 'your email'}</span>.
          </p>
          <div className="bg-[#fff6E0] rounded-2xl p-4 mb-6 text-left space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-2">Submission summary</p>
            {[
              ['Pantry name', form.name],
              ['Type', form.type],
              ['Location', [form.city, form.state].filter(Boolean).join(', ')],
              ['Contact', form.contactEmail],
            ].map(([label, value]) => value ? (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-[#101726]/50">{label}</span>
                <span className="font-medium text-[#101726]">{value}</span>
              </div>
            ) : null)}
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setForm(INITIAL); }}
            className="text-sm text-[#5C3D8F] font-semibold hover:underline"
          >
            List another pantry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff6E0] py-10 px-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ffcc10] text-[#101726] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            🏪 List a Pantry
          </div>
          <h1
            className="text-3xl font-bold text-[#101726]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Add your food resource
          </h1>
          <p className="text-[#101726]/55 text-sm mt-2">
            Help families in your community find the support they need.
          </p>
        </div>

        <StepIndicator step={step} />
        <ProgressBar step={step} total={STEPS.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-[#e8e0cc] shadow-sm overflow-hidden"
          >
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-3">Step 1 · Basic Info</p>
                  <h2 className="text-xl font-bold text-[#101726] mb-1">Tell us about your pantry</h2>
                  <p className="text-sm text-[#101726]/50">Start with the basics — name, type, and a short description.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Pantry name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Brooklyn Community Pantry"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Pantry type *</label>
                  <div className="flex flex-wrap gap-2">
                    {PANTRY_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => update('type', t)}
                        className="px-3.5 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
                        style={
                          form.type === t
                            ? { borderColor: '#5C3D8F', background: '#5C3D8F', color: 'white' }
                            : { borderColor: '#e8e0cc', background: 'white', color: '#101726' }
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe who you serve and what you offer…"
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-3">Step 2 · Location</p>
                  <h2 className="text-xl font-bold text-[#101726] mb-1">Where is the pantry?</h2>
                  <p className="text-sm text-[#101726]/50">Add the physical address so families can find you.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Street address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#101726]/30" />
                    <input
                      type="text"
                      placeholder="123 Main St"
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">City *</label>
                    <input
                      type="text"
                      placeholder="Brooklyn"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">State *</label>
                    <input
                      type="text"
                      placeholder="NY"
                      value={form.state}
                      onChange={(e) => update('state', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">ZIP code *</label>
                  <input
                    type="text"
                    placeholder="11201"
                    value={form.zip}
                    onChange={(e) => update('zip', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                  />
                </div>
                <div className="h-36 bg-[#f0ece0] rounded-xl flex items-center justify-center border border-[#e8e0cc]">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-[#101726]/20 mx-auto mb-2" />
                    <p className="text-xs text-[#101726]/35">Map preview will appear after address entry</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pantry Details */}
            {step === 3 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-3">Step 3 · Pantry Details</p>
                  <h2 className="text-xl font-bold text-[#101726] mb-1">Hours & services</h2>
                  <p className="text-sm text-[#101726]/50">Let visitors know when you&apos;re open and who you serve.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-2">Operating days</label>
                  <div className="space-y-2">
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={day}
                          checked={!!form.hours[day]}
                          onChange={(e) => toggleDay(day, e.target.checked)}
                          className="w-4 h-4 accent-[#5C3D8F]"
                        />
                        <label htmlFor={day} className="text-sm text-[#101726] w-24">{day}</label>
                        {form.hours[day] && (
                          <input
                            type="text"
                            value={form.hours[day]}
                            onChange={(e) => setForm((prev) => ({ ...prev, hours: { ...prev.hours, [day]: e.target.value } }))}
                            className="flex-1 px-3 py-1 rounded-lg border border-[#e8e0cc] text-xs focus:outline-none focus:ring-1 focus:ring-[#5C3D8F]/30"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Who do you serve?</label>
                  <input
                    type="text"
                    placeholder="e.g. All residents, seniors only, families with children"
                    value={form.serves}
                    onChange={(e) => update('serves', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-2">Dietary options available</label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleDietary(tag)}
                        className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                        style={
                          form.dietary.includes(tag)
                            ? { borderColor: '#008A81', background: '#008A8112', color: '#008A81' }
                            : { borderColor: '#e8e0cc', background: 'white', color: '#101726' }
                        }
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-3">Step 4 · Photos</p>
                  <h2 className="text-xl font-bold text-[#101726] mb-1">Add photos</h2>
                  <p className="text-sm text-[#101726]/50">Photos help families recognize your pantry and build trust.</p>
                </div>
                <div className="border-2 border-dashed border-[#e8e0cc] rounded-2xl p-10 text-center hover:border-[#5C3D8F]/50 transition-colors cursor-pointer">
                  <Camera className="w-10 h-10 text-[#101726]/20 mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#101726]/60 mb-1">Drag & drop photos here</p>
                  <p className="text-xs text-[#101726]/35 mb-4">PNG, JPG up to 10MB each</p>
                  <button className="px-5 py-2 rounded-xl text-sm font-semibold border-2 border-[#5C3D8F] text-[#5C3D8F] hover:bg-[#5C3D8F]/5 transition-colors">
                    Browse files
                  </button>
                </div>
                <p className="text-xs text-[#101726]/40 text-center">
                  Add at least 1 photo to increase listing visibility by 3x.
                </p>
              </div>
            )}

            {/* Step 5: Verification */}
            {step === 5 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-3">Step 5 · Verification</p>
                  <h2 className="text-xl font-bold text-[#101726] mb-1">Your contact details</h2>
                  <p className="text-sm text-[#101726]/50">We&apos;ll verify your listing before it goes live.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Your name *</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.contactName}
                    onChange={(e) => update('contactName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Email address *</label>
                  <input
                    type="email"
                    placeholder="you@org.com"
                    value={form.contactEmail}
                    onChange={(e) => update('contactEmail', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.contactPhone}
                    onChange={(e) => update('contactPhone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                  />
                </div>
                <div className="flex items-center gap-2.5 py-3 px-4 rounded-xl bg-blue-50 border border-blue-100">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-700">
                    Your contact info is only used for verification and will not be shown publicly.
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Preview */}
            {step === 6 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-3">Step 6 · Preview</p>
                  <h2 className="text-xl font-bold text-[#101726] mb-1">Review your listing</h2>
                  <p className="text-sm text-[#101726]/50">This is how your pantry will appear to families.</p>
                </div>
                <div className="bg-[#fff6E0] rounded-2xl border border-[#e8e0cc] p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-[#101726] text-base">{form.name || 'Pantry Name'}</h3>
                      <p className="text-xs text-[#101726]/50 mt-0.5">{form.type || 'Food Pantry'}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                      ✓ Pending
                    </span>
                  </div>
                  {form.description && (
                    <p className="text-sm text-[#101726]/65 mb-3 leading-relaxed">{form.description}</p>
                  )}
                  <div className="flex flex-col gap-1.5 text-xs text-[#101726]/55">
                    {form.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{form.address}, {form.city}, {form.state} {form.zip}</span>
                      </div>
                    )}
                    {Object.keys(form.hours).length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <span>🕐</span>
                        <span>{Object.keys(form.hours).slice(0, 3).join(', ')}{Object.keys(form.hours).length > 3 ? '…' : ''}</span>
                      </div>
                    )}
                    {form.dietary.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {form.dietary.map((d) => (
                          <span key={d} className="px-2 py-0.5 rounded-full bg-[#008A8112] text-[#008A81] font-medium">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={form.agreeTerms}
                    onChange={(e) => update('agreeTerms', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#5C3D8F]"
                  />
                  <label htmlFor="terms" className="text-sm text-[#101726]/60 leading-relaxed">
                    I confirm the information above is accurate and I am authorized to list this resource.
                    I agree to Lemontree&apos;s{' '}
                    <span className="text-[#5C3D8F] hover:underline cursor-pointer">Terms of Service</span>.
                  </label>
                </div>
              </div>
            )}

            {/* Step 7: Submit */}
            {step === 7 && (
              <div className="px-6 py-6 space-y-5 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: '#5C3D8F18' }}>
                  <Send className="w-8 h-8 text-[#5C3D8F]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-2">Step 7 · Submit</p>
                  <h2 className="text-xl font-bold text-[#101726] mb-2">Ready to submit?</h2>
                  <p className="text-sm text-[#101726]/55">
                    Your listing for <strong className="text-[#101726]">{form.name || 'your pantry'}</strong> will be reviewed and published within 2–3 business days.
                  </p>
                </div>
                <div className="bg-[#fff6E0] rounded-xl p-4 text-left space-y-2">
                  {[
                    ['Name', form.name],
                    ['Type', form.type],
                    ['City', form.city],
                    ['Contact', form.contactEmail],
                  ].map(([label, value]) => value ? (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-[#101726]/50">{label}</span>
                      <span className="font-medium text-[#101726]">{value}</span>
                    </div>
                  ) : null)}
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2"
                  style={{ background: '#5C3D8F' }}
                >
                  Submit Listing <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Navigation */}
            {step < 7 && (
              <div className="px-6 pb-6 flex items-center justify-between gap-3">
                <button
                  onClick={prev}
                  disabled={step === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#e8e0cc] text-[#101726] hover:bg-[#f0ece0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-xs text-[#101726]/35 font-medium">{step} of {STEPS.length}</span>
                <button
                  onClick={next}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: '#5C3D8F' }}
                >
                  {step === 6 ? <><Eye className="w-4 h-4" /> Review</> : <>Continue <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
