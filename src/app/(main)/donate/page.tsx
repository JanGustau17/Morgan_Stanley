'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Heart, Users, Utensils, TrendingUp, ChevronRight } from 'lucide-react';

const AMOUNTS = [10, 25, 50, 100, 250];

const IMPACT_STATS = [
  { icon: Utensils, value: '2.4M', label: 'Meals facilitated', color: '#008A81' },
  { icon: Users, value: '900K+', label: 'Families reached', color: '#5C3D8F' },
  { icon: Heart, value: '12,988', label: 'Helped yesterday', color: '#E8522A' },
  { icon: TrendingUp, value: '30+', label: 'Corporate partners', color: '#ffcc10' },
];

const RECENT_DONORS = [
  { name: 'Sarah M.', amount: 50, time: '2m ago', avatar: 'SM' },
  { name: 'James R.', amount: 25, time: '8m ago', avatar: 'JR' },
  { name: 'Priya K.', amount: 100, time: '15m ago', avatar: 'PK' },
  { name: 'Anonymous', amount: 10, time: '22m ago', avatar: '?' },
  { name: 'David L.', amount: 250, time: '1h ago', avatar: 'DL' },
];

type Step = 'amount' | 'details' | 'success';

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [step, setStep] = useState<Step>('amount');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount ?? 0;

  function handleAmountSelect(amt: number) {
    setSelectedAmount(amt);
    setCustomAmount('');
  }

  function handleSubmit() {
    if (step === 'amount' && finalAmount > 0) {
      setStep('details');
      return;
    }
    if (step === 'details') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 1500);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff6E0]">
      {/* Hero */}
      <div className="bg-[#101726] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-[#ffcc10] text-[#101726] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
          >
            <Heart className="w-3 h-3" /> Make a Difference
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Help feed your community
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/65 text-lg max-w-xl mx-auto"
          >
            Every dollar helps us connect more families with the food resources they deserve.
          </motion.p>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {IMPACT_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8e0cc] text-center"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: stat.color + '18' }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold text-[#101726]">{stat.value}</div>
              <div className="text-xs text-[#101726]/50 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Donation Form */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {step === 'amount' && (
                <motion.div
                  key="amount"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-[#e8e0cc] shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-[#e8e0cc]">
                    <h2 className="font-bold text-[#101726] text-lg">Choose an amount</h2>
                    <p className="text-sm text-[#101726]/50 mt-0.5">100% goes toward food outreach programs</p>
                  </div>
                  <div className="px-6 py-5 space-y-5">
                    {/* Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                      {AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => handleAmountSelect(amt)}
                          className="py-3 rounded-xl text-sm font-bold border-2 transition-all duration-150 hover:-translate-y-0.5"
                          style={
                            selectedAmount === amt && !customAmount
                              ? { background: '#5C3D8F', color: 'white', borderColor: '#5C3D8F' }
                              : { background: 'white', color: '#101726', borderColor: '#e8e0cc' }
                          }
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div>
                      <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">
                        Custom amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#101726]/40 font-medium">$</span>
                        <input
                          type="number"
                          min="1"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setSelectedAmount(null);
                          }}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm text-[#101726] placeholder-[#101726]/30 focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                        />
                      </div>
                    </div>

                    {/* Recurring Toggle */}
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#fff6E0] border border-[#e8e0cc]">
                      <div>
                        <p className="text-sm font-semibold text-[#101726]">Make it monthly</p>
                        <p className="text-xs text-[#101726]/50">Ongoing support, cancel anytime</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={recurring}
                        onClick={() => setRecurring((v) => !v)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#5C3D8F] ${
                          recurring ? 'bg-[#5C3D8F]' : 'bg-[#e8e0cc]'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                            recurring ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={finalAmount <= 0}
                      className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: '#5C3D8F' }}
                    >
                      Donate ${finalAmount || '—'}{recurring ? '/mo' : ''} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-[#e8e0cc] shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-[#e8e0cc]">
                    <button
                      onClick={() => setStep('amount')}
                      className="text-xs text-[#101726]/50 hover:text-[#101726] mb-2 flex items-center gap-1"
                    >
                      ← Back
                    </button>
                    <h2 className="font-bold text-[#101726] text-lg">Your details</h2>
                    <p className="text-sm text-[#101726]/50 mt-0.5">
                      Donating <strong className="text-[#5C3D8F]">${finalAmount}{recurring ? '/mo' : ''}</strong>
                    </p>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Full name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm text-[#101726] placeholder-[#101726]/30 focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#101726]/70 mb-1.5">Email address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e8e0cc] text-sm text-[#101726] placeholder-[#101726]/30 focus:outline-none focus:ring-2 focus:ring-[#5C3D8F]/25 focus:border-[#5C3D8F]"
                      />
                    </div>

                    {/* Secure Indicator */}
                    <div className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-green-50 border border-green-100">
                      <Lock className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-xs text-green-700 font-medium">
                        Secure payment · SSL encrypted · No card stored
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !name || !email}
                      className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: '#5C3D8F' }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Processing…
                        </span>
                      ) : (
                        <>Complete Donation <Lock className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                  className="bg-white rounded-2xl border border-[#e8e0cc] shadow-sm p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: '#008A8118' }}
                  >
                    <Check className="w-10 h-10 text-[#008A81]" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-[#101726] mb-2">
                    Thank you, {name || 'Friend'}! 💚
                  </h2>
                  <p className="text-[#101726]/60 text-base mb-1">
                    Your donation of <strong className="text-[#5C3D8F]">${finalAmount}{recurring ? '/month' : ''}</strong> is making a real impact.
                  </p>
                  <p className="text-sm text-[#101726]/45 mb-8">
                    A confirmation will be sent to {email || 'your email'}.
                  </p>
                  <div className="bg-[#fff6E0] rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#101726]/40 mb-2">Your impact estimate</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🍽️</span>
                      <div>
                        <p className="font-bold text-[#101726]">
                          ~{Math.round(finalAmount * 3)} meals facilitated
                        </p>
                        <p className="text-xs text-[#101726]/50">Based on average outreach conversion rate</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setStep('amount'); setName(''); setEmail(''); }}
                    className="text-sm text-[#5C3D8F] font-semibold hover:underline"
                  >
                    Make another donation
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Recent Donors */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-[#e8e0cc] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8e0cc]">
                <h3 className="font-bold text-[#101726] text-sm">Recent donors</h3>
              </div>
              <div className="divide-y divide-[#f0ece0]">
                {RECENT_DONORS.map((donor, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: '#5C3D8F' }}
                    >
                      {donor.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#101726] truncate">{donor.name}</p>
                      <p className="text-xs text-[#101726]/45">{donor.time}</p>
                    </div>
                    <span className="text-sm font-bold text-[#008A81]">${donor.amount}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-[#101726] rounded-2xl p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Where it goes</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Flyer outreach programs', pct: 60 },
                  { label: 'Volunteer coordination', pct: 25 },
                  { label: 'Platform operations', pct: 15 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="opacity-75">{item.label}</span>
                      <span className="font-bold">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, background: '#ffcc10' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
