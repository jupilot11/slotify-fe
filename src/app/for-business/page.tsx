import Link from 'next/link'
import Button from '@/components/ui/Button'
import Logo from '@/components/layout/Logo'

const features = [
  {
    title: 'Public booking pages',
    description: 'Share a link and let clients book 24/7 — no phone calls, no back-and-forth.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    title: 'Smart dashboard',
    description: "See today's bookings at a glance, manage services, and track revenue.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Multi-business support',
    description: 'Built for barbershops, salons, clinics, and any service provider.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Service management',
    description: 'Create services with custom durations and prices. Toggle them on or off.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: 'Booking management',
    description: 'Confirm, complete, or cancel appointments with one click.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Works on any device',
    description: 'Your clients can book from their phone, tablet, or computer — no app needed.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
]

const businessTypes = ['Barbershops', 'Hair Salons', 'Dental Clinics', 'Massage Therapists', 'Personal Trainers']

export default function ForBusinessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Logo />
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Back to Slotify
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 py-20 sm:py-28 lg:py-36 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-8 border border-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Smart appointment booking for service businesses
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Booking made{' '}
            <span className="text-indigo-600">effortless</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Slotify helps service businesses manage appointments — so you spend less time
            scheduling and more time doing what you love.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login">
              <Button size="lg">Start for free</Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">See how it works</Button>
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-400">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* Business types */}
      <div className="bg-slate-50 border-y border-slate-200 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs text-slate-400 text-center mb-4 font-semibold uppercase tracking-widest">
            Built for
          </p>
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap text-slate-600 font-semibold text-sm">
            {businessTypes.map((cat) => (
              <span key={cat} className="whitespace-nowrap">{cat}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From public booking pages to a full management dashboard — Slotify has you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-indigo-600 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start accepting bookings today
          </h2>
          <p className="text-indigo-100 mb-8 text-lg leading-relaxed">
            Join hundreds of businesses already using Slotify to manage their appointments.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login">
              <button
                type="button"
                className="bg-white text-indigo-600 rounded-lg px-8 py-3 font-semibold text-base hover:bg-indigo-50 transition-colors"
              >
                Get started free
              </button>
            </Link>
            <Link href="/">
              <button
                type="button"
                className="text-indigo-200 text-sm hover:text-white transition-colors"
              >
                Browse as a customer →
              </button>
            </Link>
          </div>
          <p className="mt-5 text-indigo-200/70 text-sm">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-white font-bold text-lg">Slotify</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Slotify. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Browse services
            </Link>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
