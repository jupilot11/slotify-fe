'use client'

import Link from 'next/link'
import { useSubscriptionPlans } from '@/features/subscription/hooks/useSubscriptionPlans'
import type { SubscriptionPlan } from '@/types'

function planFeatures(plan: SubscriptionPlan): string[] {
  const features = [
    `Add up to ${plan.max_businesses} business${plan.max_businesses > 1 ? 'es' : ''}`,
    'Unlimited services per business',
    'Public booking page',
    'Online booking dashboard',
  ]
  if (plan.featured_months > 0) {
    features.splice(1, 0, `Featured listing for ${plan.featured_months} month${plan.featured_months > 1 ? 's' : ''}`)
  }
  return features
}

function PricingCard({ plan, isPopular }: { plan: SubscriptionPlan; isPopular: boolean }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
        isPopular
          ? 'bg-indigo-600 shadow-2xl shadow-indigo-200 md:-translate-y-3 z-10'
          : 'bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isPopular ? 'text-indigo-300' : 'text-slate-400'}`}>
          {plan.display_name}
        </p>
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-4xl font-bold tracking-tight ${isPopular ? 'text-white' : 'text-slate-900'}`}>
            ₱{plan.price_php.toLocaleString()}
          </span>
          <span className={`text-sm font-medium ${isPopular ? 'text-indigo-300' : 'text-slate-400'}`}>/mo</span>
        </div>
        <p className={`text-sm leading-relaxed ${isPopular ? 'text-indigo-200' : 'text-slate-500'}`}>
          {plan.description}
        </p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {planFeatures(plan).map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <svg
              className={`h-4 w-4 shrink-0 mt-0.5 ${isPopular ? 'text-indigo-300' : 'text-indigo-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className={isPopular ? 'text-indigo-100' : 'text-slate-600'}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/login" className="block">
        <button
          type="button"
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
            isPopular
              ? 'bg-white text-indigo-600 hover:bg-indigo-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Get started
        </button>
      </Link>
    </div>
  )
}

function PricingCardSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div className={`rounded-2xl bg-white border border-slate-200 p-8 animate-pulse ${tall ? 'md:-translate-y-3' : ''}`}>
      <div className="h-3 w-14 bg-slate-200 rounded mb-4" />
      <div className="h-10 w-32 bg-slate-200 rounded mb-3" />
      <div className="h-4 w-full bg-slate-100 rounded mb-1" />
      <div className="h-4 w-3/4 bg-slate-100 rounded mb-8" />
      <div className="space-y-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 bg-slate-200 rounded shrink-0" />
            <div className="h-4 flex-1 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      <div className="h-11 bg-slate-200 rounded-xl" />
    </div>
  )
}

export default function PricingSection() {
  const { plans, isLoading, error } = useSubscriptionPlans()

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 bg-slate-50 border-y border-slate-200">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-5 border border-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Pick the plan that fits your business. Upgrade anytime.
          </p>
        </div>

        {error ? (
          <p className="text-center text-slate-400 text-sm py-10">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {isLoading
              ? [false, true, false].map((tall, i) => <PricingCardSkeleton key={i} tall={tall} />)
              : plans.map((plan) => (
                  <PricingCard key={plan.id} plan={plan} isPopular={plan.name === 'standard'} />
                ))}
          </div>
        )}

      </div>
    </section>
  )
}
