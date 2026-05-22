'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLang } from '@/lib/i18n/LangContext'

const testimonials = [
  {
    name: 'Ramesh Patil',
    location: 'Nashik, Maharashtra',
    initials: 'RP',
    color: 'bg-emerald-100 text-emerald-700',
    quote:
      'My daughter had a high fever at 2 AM. Instead of a 3-hour drive to Pune, I spoke to a doctor in 8 minutes. The prescription was on my phone within minutes.',
  },
  {
    name: 'Sunita Devi',
    location: 'Bhopal, Madhya Pradesh',
    initials: 'SD',
    color: 'bg-blue-100 text-blue-700',
    quote:
      'The Hindi interface made everything so easy. I described my chest pain and the doctor immediately arranged an ambulance. SwasthyaSetu saved my life.',
  },
  {
    name: 'Kiran Shinde',
    location: 'Kolhapur, Maharashtra',
    initials: 'KS',
    color: 'bg-purple-100 text-purple-700',
    quote:
      'Getting a prescription in Marathi that I could show at the local chemist has changed everything for our village. No more misunderstandings.',
  },
]

const features = [
  { icon: '📶', title: 'Works on 2G', desc: 'Optimised for slow rural networks. Audio calls work even with 2G signal.' },
  { icon: '🌐', title: 'In Your Language', desc: 'Consult in Hindi, Marathi, or English. No language barrier, ever.' },
  { icon: '🤖', title: 'AI Triage First', desc: 'Our AI assistant screens your symptoms and guides you to the right specialist.' },
  { icon: '🚑', title: '24/7 Emergency', desc: 'One-tap ambulance booking with live location tracking and 108 integration.' },
  { icon: '📋', title: 'Digital Prescriptions', desc: 'Verified prescriptions sent to your phone, readable at any pharmacy.' },
  { icon: '🔒', title: 'Private & Secure', desc: 'All your health records are encrypted and only visible to you and your doctor.' },
]

const steps = [
  {
    n: '01',
    title: 'Describe Symptoms',
    desc: 'Tell our AI assistant what you feel. It screens your symptoms and finds the right doctor.',
    icon: '💬',
  },
  {
    n: '02',
    title: 'Book a Slot',
    desc: 'Pick a doctor, choose video or audio call, and book in under 60 seconds.',
    icon: '📅',
  },
  {
    n: '03',
    title: 'Consult & Get Care',
    desc: 'Join the call, get a diagnosis, and receive a verified prescription on your phone.',
    icon: '🩺',
  },
]

const stats = [
  { value: '50,000+', label: 'Consultations Done' },
  { value: '1,200+', label: 'Verified Doctors' },
  { value: '8 min', label: 'Avg. Response Time' },
  { value: '18', label: 'States Covered' },
]

export default function Home() {
  const { t, lang, setLang } = useLang()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const languages = [
    { code: 'en' as const, label: 'English' },
    { code: 'hi' as const, label: 'हिंदी' },
    { code: 'mr' as const, label: 'मराठी' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-lg text-white">
              🩺
            </span>
            <span className="text-lg font-bold text-slate-900">SwasthyaSetu</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-emerald-600">How It Works</a>
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-emerald-600">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-emerald-600">About Us</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 rounded-full border border-slate-200 p-1 md:flex">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium transition',
                    lang === l.code ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-800',
                  ].join(' ')}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <Link href="/login" className="hidden text-sm font-medium text-slate-600 transition hover:text-emerald-600 md:block">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile lang switcher */}
        <div className="flex justify-center gap-1 px-6 pb-3 md:hidden">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition',
                lang === l.code ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-6 pb-24 pt-20 text-white">
          {/* subtle grid pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white/90">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-300" />
              Serving Rural India since 2024
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.15] tracking-tight md:text-6xl">
              {t('landing.hero_title')}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-emerald-100 md:text-xl">
              India has <strong className="text-white">700 million</strong> rural citizens. Only{' '}
              <strong className="text-white">30%</strong> of doctors serve them. We're changing that —
              one consultation at a time.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
              >
                Book a Consultation →
              </Link>
              <Link
                href="/signup?role=doctor"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Join as Doctor
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 px-4 py-5 backdrop-blur-sm">
                  <div className="text-3xl font-extrabold text-white">{s.value}</div>
                  <div className="mt-1 text-sm text-emerald-200">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEM BANNER ── */}
        <section className="border-b border-slate-100 bg-amber-50 px-6 py-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">The Reality</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-800 md:text-3xl">
              A rural patient travels an average of <span className="text-amber-600">50 km</span> to see a specialist.
              We deliver the same care in <span className="text-emerald-600">8 minutes</span>.
            </h2>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Simple Process</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">From symptoms to prescription in minutes</h2>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.n} className="relative">
                  {i < steps.length - 1 && (
                    <div className="absolute left-full top-10 hidden h-px w-full -translate-y-0 border-t-2 border-dashed border-emerald-200 md:block" style={{ width: 'calc(100% - 2rem)', left: 'calc(100% + 1rem)' }} />
                  )}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7 shadow-sm transition hover:shadow-md">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">{step.n}</span>
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Why SwasthyaSetu</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">Built for the last mile</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-500">
                Every feature is designed for patients who've been underserved by traditional healthcare — low bandwidth, language barriers, and all.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl group-hover:bg-emerald-100 transition">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-800">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Real Stories</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">Lives changed across rural India</h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-7 shadow-sm">
                  <div className="mb-5 text-4xl text-slate-300">"</div>
                  <p className="flex-1 text-sm leading-relaxed text-slate-600">{t.quote}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${t.color}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT US ── */}
        <section id="about" className="bg-slate-900 px-6 py-20 text-white">
          <div className="mx-auto max-w-6xl grid gap-16 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Our Story</p>
              <h2 className="mt-3 text-3xl font-bold leading-snug">
                We grew up in villages that had no doctors. Now we're building one for every village.
              </h2>
              <p className="mt-5 text-slate-400 leading-relaxed">
                SwasthyaSetu was born at a college hackathon when our team — all from small towns in Maharashtra —
                realised that our parents would drive 2 hours for a 10-minute doctor visit. We knew technology
                could fix this.
              </p>
              <p className="mt-4 text-slate-400 leading-relaxed">
                We built SwasthyaSetu (meaning <em>Bridge to Health</em>) to connect rural patients directly
                with verified specialist doctors through video and audio calls, in their own language, on any phone.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4">
                  <p className="text-2xl font-bold text-emerald-400">₹0</p>
                  <p className="mt-1 text-xs text-slate-400">Platform fee, forever</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4">
                  <p className="text-2xl font-bold text-emerald-400">Open Source</p>
                  <p className="mt-1 text-xs text-slate-400">Community-driven</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4">
                  <p className="text-2xl font-bold text-emerald-400">NGO-backed</p>
                  <p className="mt-1 text-xs text-slate-400">Not for profit mission</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              {[
                { icon: '🎯', title: 'Our Mission', desc: 'Make quality healthcare accessible to every Indian, regardless of geography, language, or income.' },
                { icon: '🤝', title: 'Our Commitment', desc: 'Every doctor on SwasthyaSetu is verified. Every consultation is secure and private.' },
                { icon: '📱', title: 'Our Technology', desc: 'Built for low-bandwidth environments. Works on 2G, any Android phone, even basic smartphones.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-5">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOCTOR CTA ── */}
        <section className="border-t border-slate-100 bg-emerald-50 px-6 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <span className="text-3xl">👨‍⚕️</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-800">Are you a doctor?</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Join 1,200+ doctors serving patients across rural India. Set your own hours, consult from anywhere, and make a real difference.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup?role=doctor"
                className="rounded-full bg-emerald-600 px-8 py-4 font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Join as a Doctor →
              </Link>
              <Link
                href="/login"
                className="rounded-full border-2 border-emerald-600 px-8 py-4 font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                Already registered? Login
              </Link>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold md:text-4xl">Start your free consultation today</h2>
          <p className="mt-3 text-emerald-100">
            Available in English, हिंदी &amp; मराठी · Works on 2G · No hidden fees
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
          >
            Get Started Free →
          </Link>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 px-6 py-14 text-slate-400">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">🩺</span>
                <span className="font-bold text-white">SwasthyaSetu</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                Bridging rural India with quality healthcare through technology.
              </p>
              <p className="mt-4 text-xs">Made with ❤️ in India</p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">For Patients</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-white transition">Book Consultation</Link></li>
                <li><Link href="/ai-chat" className="hover:text-white transition">AI Health Assistant</Link></li>
                <li><Link href="/emergency" className="hover:text-white transition">Emergency Help</Link></li>
                <li><Link href="/prescriptions" className="hover:text-white transition">My Prescriptions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">For Doctors</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup?role=doctor" className="hover:text-white transition">Join the Network</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Doctor Login</Link></li>
                <li><a href="#" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition">Earnings & Fees</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="mailto:support@swasthyasetu.in" className="hover:text-white transition">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
            <p className="text-xs">© 2025 SwasthyaSetu. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-900 px-3 py-1 text-emerald-400">Emergency: 108</span>
              <span className="rounded-full bg-slate-800 px-3 py-1">support@swasthyasetu.in</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
