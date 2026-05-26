import Link from 'next/link'
import Logo from '@/components/layout/Logo'

const serviceCategories = [
  { label: 'Hair Salons', emoji: '✂️', slug: 'hair-salons', classes: 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100' },
  { label: 'Barber Shops', emoji: '💈', slug: 'barber-shops', classes: 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100' },
  { label: 'Nail Salons', emoji: '💅', slug: 'nail-salons', classes: 'bg-pink-50 border-pink-100 text-pink-700 hover:bg-pink-100' },
  { label: 'Massage & Spa', emoji: '🌿', slug: 'massage-spa', classes: 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  { label: 'Dental', emoji: '🦷', slug: 'dental', classes: 'bg-sky-50 border-sky-100 text-sky-700 hover:bg-sky-100' },
  { label: 'Skincare', emoji: '✨', slug: 'skincare', classes: 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100' },
  { label: 'Fitness', emoji: '🏋️', slug: 'fitness', classes: 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100' },
  { label: 'Tattoo & Piercing', emoji: '🎨', slug: 'tattoo', classes: 'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100' },
  { label: 'Lash & Brow', emoji: '👁️', slug: 'lash-brow', classes: 'bg-violet-50 border-violet-100 text-violet-700 hover:bg-violet-100' },
  { label: 'Pet Services', emoji: '🐾', slug: 'pet-services', classes: 'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100' },
]

export default function ConsumerLandingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/for-business"
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              For Business
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 pt-20 pb-28 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2.5 text-indigo-200 text-sm font-medium mb-6">
            <span className="h-px w-8 bg-indigo-400" />
            Smart appointment booking
            <span className="h-px w-8 bg-indigo-400" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-5 leading-[1.05]">
            Book the services<br />
            <span className="text-indigo-200">you love</span>
          </h1>
          <p className="text-xl text-indigo-100/80 mb-10 max-w-xl mx-auto leading-relaxed">
            Discover top-rated local professionals and book appointments instantly — no phone calls needed.
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-slate-400 text-sm select-none">Hair, nails, massage…</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-slate-400 text-sm select-none">City, zip code…</span>
            </div>
            <button
              type="button"
              className="bg-indigo-600 text-white rounded-xl px-7 py-3 font-semibold text-sm hover:bg-indigo-700 transition-colors shrink-0"
            >
              Search
            </button>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            {['Free to browse', 'No account needed', 'Book in seconds'].map((signal) => (
              <span key={signal} className="flex items-center gap-1.5 text-indigo-200/70 text-xs font-medium">
                <svg className="h-3.5 w-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {signal}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Browse by category</h2>
            <p className="text-slate-500 text-sm">Find the right professional for you</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {serviceCategories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${cat.classes}`}
              >
                <span className="text-3xl leading-none">{cat.emoji}</span>
                <span className="text-sm font-semibold text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Listings — Empty State */}
      <section className="px-4 pb-20 pt-2 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured businesses</h2>
              <p className="text-slate-500 mt-1 text-sm">Top-rated professionals near you</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
              <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No businesses listed yet</h3>
            <p className="text-slate-400 text-sm text-center max-w-xs mb-6 leading-relaxed">
              We're growing fast! Be among the first businesses on Slotify and reach new clients.
            </p>
            <Link
              href="/for-business"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              List your business
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* For Business CTA */}
      <section className="bg-slate-900 py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left max-w-lg">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.15em] mb-3">
              For Business Owners
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              Ready to grow<br />your business?
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Join Slotify and start accepting online bookings today. Manage your schedule, services, and clients — all in one beautiful dashboard.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/for-business"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl px-8 py-4 text-base font-semibold hover:bg-indigo-700 transition-colors w-full md:w-auto"
            >
              Learn more
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="text-slate-400 text-sm hover:text-white transition-colors"
            >
              Sign up for free →
            </Link>
          </div>
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
            <Link href="/for-business" className="text-slate-400 hover:text-white transition-colors">
              For Business
            </Link>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
