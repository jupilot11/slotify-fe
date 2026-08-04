'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { SubscriptionPlan, BillingInterval } from '@/types'
import type { PlanFormData } from '../_hooks/useAdminPricing'

interface Props {
  isOpen: boolean
  plan: SubscriptionPlan | null
  isSubmitting: boolean
  submitError: string | null
  onClose: () => void
  onSubmit: (data: PlanFormData) => Promise<void>
}

const EMPTY_FORM: PlanFormData = {
  name: '',
  display_name: '',
  description: null,
  price_php: 0,
  currency: 'PHP',
  billing_interval: 'monthly',
  trial_period_days: null,
  max_businesses: 1,
  max_users: null,
  max_services: null,
  featured_months: 0,
  sort_order: 0,
  is_active: true,
}

function planToForm(plan: SubscriptionPlan): PlanFormData {
  return {
    name: plan.name,
    display_name: plan.display_name,
    description: plan.description,
    price_php: plan.price_php,
    currency: plan.currency,
    billing_interval: plan.billing_interval,
    trial_period_days: plan.trial_period_days,
    max_businesses: plan.max_businesses,
    max_users: plan.max_users,
    max_services: plan.max_services,
    featured_months: plan.featured_months,
    sort_order: plan.sort_order,
    is_active: plan.is_active,
  }
}

export default function PricingFormModal({ isOpen, plan, isSubmitting, submitError, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<PlanFormData>(plan ? planToForm(plan) : EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof PlanFormData, string>>>({})

  useEffect(() => {
    if (isOpen) {
      setForm(plan ? planToForm(plan) : EMPTY_FORM)
      setErrors({})
    }
  }, [isOpen, plan])

  function set<K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof PlanFormData, string>> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.display_name.trim()) errs.display_name = 'Required'
    if (form.price_php < 0) errs.price_php = 'Must be ≥ 0'
    if (!form.billing_interval) errs.billing_interval = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate() || isSubmitting) return
    onSubmit(form)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={plan ? 'Edit Plan' : 'Add Plan'} className="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Plan Name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
            placeholder="e.g. basic"
            required
          />
          <Input
            label="Display Name"
            value={form.display_name}
            onChange={(e) => set('display_name', e.target.value)}
            error={errors.display_name}
            placeholder="e.g. Basic Plan"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Price (₱) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.price_php}
              onChange={(e) => set('price_php', parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {errors.price_php && <p className="text-xs text-red-600">{errors.price_php}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => set('currency', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="PHP">PHP</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Billing Interval <span className="text-red-500">*</span>
            </label>
            <select
              value={form.billing_interval}
              onChange={(e) => set('billing_interval', e.target.value as BillingInterval)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </select>
            {errors.billing_interval && <p className="text-xs text-red-600">{errors.billing_interval}</p>}
          </div>

          <Input
            label="Trial Period (days)"
            type="number"
            min={0}
            value={form.trial_period_days ?? ''}
            onChange={(e) => set('trial_period_days', e.target.value === '' ? null : parseInt(e.target.value))}
            placeholder="Optional"
          />

          <Input
            label="Max Businesses"
            type="number"
            min={1}
            value={form.max_businesses}
            onChange={(e) => set('max_businesses', parseInt(e.target.value) || 1)}
          />

          <Input
            label="Max Users"
            type="number"
            min={1}
            value={form.max_users ?? ''}
            onChange={(e) => set('max_users', e.target.value === '' ? null : parseInt(e.target.value))}
            placeholder="Optional"
          />

          <Input
            label="Max Services"
            type="number"
            min={1}
            value={form.max_services ?? ''}
            onChange={(e) => set('max_services', e.target.value === '' ? null : parseInt(e.target.value))}
            placeholder="Optional (unlimited if blank)"
          />

          <Input
            label="Featured Months"
            type="number"
            min={0}
            value={form.featured_months}
            onChange={(e) => set('featured_months', parseInt(e.target.value) || 0)}
          />

          <Input
            label="Sort Order"
            type="number"
            min={0}
            value={form.sort_order}
            onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value || null)}
            rows={3}
            placeholder="Describe this plan…"
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Active</p>
            <p className="text-xs text-slate-400">Visible to customers when active</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_active}
            onClick={() => set('is_active', !form.is_active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {submitError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-red-600">{submitError}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Plan'}
        </Button>
      </div>
    </Modal>
  )
}
