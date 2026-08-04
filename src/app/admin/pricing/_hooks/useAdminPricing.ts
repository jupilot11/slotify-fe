'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SubscriptionPlan } from '@/types'
import { getAdminPricingPlans } from '@/features/subscription/services/getAdminPricingPlans.service'
import { createPricingPlan } from '@/features/subscription/services/createPricingPlan.service'
import { updatePricingPlan } from '@/features/subscription/services/updatePricingPlan.service'
import { deletePricingPlan } from '@/features/subscription/services/deletePricingPlan.service'

export type PlanFormData = Omit<SubscriptionPlan, 'id' | 'created_at'>

export interface UseAdminPricingResult {
  plans: SubscriptionPlan[]
  isLoading: boolean
  error: string | null
  successMessage: string | null
  isSubmitting: boolean
  submitError: string | null
  editPlan: SubscriptionPlan | null
  isEditOpen: boolean
  deletePlan: SubscriptionPlan | null
  openEdit: (plan: SubscriptionPlan | null) => void
  closeEdit: () => void
  openDelete: (plan: SubscriptionPlan) => void
  closeDelete: () => void
  handleCreate: (data: PlanFormData) => Promise<void>
  handleUpdate: (data: PlanFormData) => Promise<void>
  handleDelete: () => Promise<void>
}

export function useAdminPricing(): UseAdminPricingResult {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletePlan, setDeletePlan] = useState<SubscriptionPlan | null>(null)

  useEffect(() => {
    if (!successMessage) return
    const t = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(t)
  }, [successMessage])

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminPricingPlans()
      setPlans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const openEdit = useCallback((plan: SubscriptionPlan | null) => {
    setEditPlan(plan)
    setIsEditOpen(true)
    setSubmitError(null)
  }, [])

  const closeEdit = useCallback(() => {
    setIsEditOpen(false)
    setEditPlan(null)
    setSubmitError(null)
  }, [])

  const openDelete = useCallback((plan: SubscriptionPlan) => {
    setDeletePlan(plan)
    setSubmitError(null)
  }, [])

  const closeDelete = useCallback(() => {
    setDeletePlan(null)
    setSubmitError(null)
  }, [])

  const handleCreate = useCallback(async (data: PlanFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await createPricingPlan(data)
      setIsEditOpen(false)
      setEditPlan(null)
      setSuccessMessage('Plan created.')
      await fetchPlans()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create plan')
    } finally {
      setIsSubmitting(false)
    }
  }, [fetchPlans])

  const handleUpdate = useCallback(async (data: PlanFormData) => {
    if (!editPlan) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await updatePricingPlan({ id: editPlan.id, ...data })
      setIsEditOpen(false)
      setEditPlan(null)
      setSuccessMessage('Plan updated.')
      await fetchPlans()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update plan')
    } finally {
      setIsSubmitting(false)
    }
  }, [editPlan, fetchPlans])

  const handleDelete = useCallback(async () => {
    if (!deletePlan) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await deletePricingPlan(deletePlan.id)
      setDeletePlan(null)
      setSuccessMessage('Plan deleted.')
      await fetchPlans()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to delete plan')
    } finally {
      setIsSubmitting(false)
    }
  }, [deletePlan, fetchPlans])

  return {
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
  }
}
