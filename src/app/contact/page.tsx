'use client';

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { useState } from 'react';
import toast from 'react-hot-toast';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const faqs = [
  { q: 'How long do withdrawals take?', a: 'Withdrawals are processed within 24 hours for most accounts. VIP and Elite accounts receive same-day processing.' },
  { q: 'Is my investment insured?', a: 'Your principal is held in cold storage and protected through institutional risk management. We maintain a reserve fund for unexpected events.' },
  { q: 'Can I have multiple investment plans?', a: 'Yes! You can run multiple plans simultaneously. Many of our users diversify across Growth and Elite plans for maximum returns.' },
  { q: 'How do I verify my KYC?', a: 'Go to Dashboard → Settings → KYC Verification. Upload a government-issued ID (passport, driver\'s license, or national ID). Approval takes 24-48 hours.' },
  { q: 'What cryptocurrencies can I deposit?', a: 'We accept BTC, ETH, USDT (TRC-20 & ERC-20), BNB, and SOL for deposits. Withdrawals are available in all supported assets.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#0a0b10]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            We&apos;re Here to Help
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            Contact <span className="text-gradient">Our Team</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Have a question, need support, or want to explore a custom arrangement? Our team responds within 24 hours.
          </p>
        </div>

        {/* Contact Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Info Cards */}
          <div className="space-y-4">
            {[
              { icon: <EmailOutlinedIcon sx={{ color: '#d4af37', fontSize: 22 }} />, title: 'Email Support', val: 'support@trendytrades.com', sub: 'Response within 24h' },
              { icon: <ChatBubbleOutlineIcon sx={{ color: '#a8810b', fontSize: 22 }} />, title: 'Live Chat', val: 'Available in Dashboard', sub: 'Instant for verified users' },
              { icon: <LocationOnOutlinedIcon sx={{ color: '#00e676', fontSize: 22 }} />, title: 'Headquarters', val: 'Singapore, SG 018960', sub: 'Global operations team' },
              { icon: <AccessTimeIcon sx={{ color: '#ffea00', fontSize: 22 }} />, title: 'Business Hours', val: '24/7 Support', sub: 'Round-the-clock assistance' },
            ].map((item) => (
              <div key={item.title} className="glass-panel p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-white/50 text-xs mb-1">{item.title}</div>
                  <div className="text-white font-semibold text-sm">{item.val}</div>
                  <div className="text-white/30 text-xs">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 glass-panel p-7 md:p-10">
            <h2 className="text-xl font-bold text-white mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="John Smith"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]/60 transition-all placeholder:text-white/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/50 mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]/60 transition-all placeholder:text-white/20 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Subject</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]/60 transition-all text-sm"
                >
                  <option value="">Select a topic</option>
                  <option>Account & Registration</option>
                  <option>Deposits & Withdrawals</option>
                  <option>Investment Plans</option>
                  <option>Copy Trading</option>
                  <option>KYC Verification</option>
                  <option>Technical Issue</option>
                  <option>Partnership / Institutional</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]/60 transition-all placeholder:text-white/20 text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a8810b] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="glass-panel overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white font-semibold text-sm">{faq.q}</span>
                  <span className="text-[#d4af37] ml-4 shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
