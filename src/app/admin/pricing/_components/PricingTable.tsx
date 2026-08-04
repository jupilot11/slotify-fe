'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import type { SubscriptionPlan } from '@/types'
import { useAdminPricing } from '../_hooks/useAdminPricing'
import PricingFormModal from './PricingFormModal'
import DeletePlanModal from './DeletePlanModal'

const INTERVAL_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PricingTable() {
  const {
    plans,
    isLoading,
    error,
    successMessage,
    isSubmitting,
    submitError,
    editPlan,
    isEditOpen,
    deletePlan,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useAdminPricing()

  const activeCount = plans.filter((p) => p.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pricing Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Manage subscription plans available to business owners.</p>
        </div>
        <Button onClick={() => openEdit(null)}>Add Plan</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Plans</p>
          <div className="mt-3">
            {isLoading && plans.length === 0 ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-slate-900">{plans.length}</p>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Plans</p>
          <div className="mt-3">
            {isLoading && plans.length === 0 ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-emerald-700">{activeCount}</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <CardTitle>All Plans</CardTitle>
            {!isLoading && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {plans.length}
              </span>
            )}
          </div>
        </CardHeader>

        {successMessage && (
          <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 border-b border-emerald-100">
            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-emerald-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-6 py-3 bg-red-50 border-b border-red-100">
            <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {['Plan', 'Description', 'Price', 'Interval', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && plans.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="space-y-2"><Skeleton className="h-3.5 w-24" /><Skeleton className="h-3 w-16" /></div></td>
                    <td className="px-6 py-4"><Skeleton className="h-3.5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-3.5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-3.5 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-3.5 w-24" /></td>
                    <td className="px-6 py-4"><div className="flex gap-2"><Skeleton className="h-6 w-10 rounded-md" /><Skeleton className="h-6 w-14 rounded-md" /></div></td>
                  </tr>
                ))
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-600">No pricing plans yet</p>
                      <p className="text-xs text-slate-400">Click &ldquo;Add Plan&rdquo; to create your first plan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((plan: SubscriptionPlan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{plan.display_name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{plan.name}</p>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <p className="text-slate-600 truncate" title={plan.description ?? ''}>
                        {plan.description ?? '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {plan.currency} {plan.price_php.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {INTERVAL_LABELS[plan.billing_interval] ?? plan.billing_interval}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={plan.is_active ? 'success' : 'default'}>
                        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${plan.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(plan.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(plan)}
                          className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(plan)}
                          className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PricingFormModal
        isOpen={isEditOpen}
        plan={editPlan}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onClose={closeEdit}
        onSubmit={editPlan ? handleUpdate : handleCreate}
      />

      <DeletePlanModal
        plan={deletePlan}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onClose={closeDelete}
        onConfirm={handleDelete}
      />
    </div>
  )
}
