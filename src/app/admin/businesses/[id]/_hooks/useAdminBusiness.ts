import { useState, useEffect, useCallback } from 'react'
import { getAdminBusiness } from '@/features/businesses/services/getAdminBusiness.service'
import { updateBusinessStatus } from '@/features/businesses/services/updateBusinessStatus.service'
import type { AdminBusinessDetail } from '@/types'

interface State {
  business: AdminBusinessDetail | null
  loading: boolean
  error: string | null
  modalOpen: boolean
  submitting: boolean
  submitError: string | null
}

export interface AdminBusinessHook extends State {
  openStatusModal: () => void
  closeStatusModal: () => void
  submitStatusUpdate: (id: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>
}

export function useAdminBusiness(id: string): AdminBusinessHook {
  const [state, setState] = useState<State>({
    business: null,
    loading: true,
    error: null,
    modalOpen: false,
    submitting: false,
    submitError: null,
  })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    getAdminBusiness(id)
      .then((data) => {
        if (!cancelled) setState((prev) => ({ ...prev, business: data, loading: false }))
      })
      .catch((err) => {
        if (!cancelled) setState((prev) => ({
          ...prev,
          business: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load business',
        }))
      })

    return () => { cancelled = true }
  }, [id, tick])

  const openStatusModal = useCallback(() => {
    setState((prev) => ({ ...prev, modalOpen: true, submitError: null }))
  }, [])

  const closeStatusModal = useCallback(() => {
    setState((prev) => ({ ...prev, modalOpen: false, submitError: null }))
  }, [])

  const submitStatusUpdate = useCallback(async (
    _id: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    setState((prev) => ({ ...prev, submitting: true, submitError: null }))
    try {
      await updateBusinessStatus(id, status, reason)
      setState((prev) => ({ ...prev, submitting: false, modalOpen: false }))
      setTick((t) => t + 1)
    } catch (err) {
      setState((prev) => ({
        ...prev,
        submitting: false,
        submitError: err instanceof Error ? err.message : 'Failed to update status',
      }))
    }
  }, [id])

  return { ...state, openStatusModal, closeStatusModal, submitStatusUpdate }
}
