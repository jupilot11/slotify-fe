import { useState, useEffect, useCallback } from 'react'
import { getAdminBusinesses } from '@/features/businesses/services/getAdminBusinesses.service'
import { updateBusinessStatus } from '@/features/businesses/services/updateBusinessStatus.service'
import type { AdminBusiness, AdminBusinessStatus } from '@/types'

const LIMIT = 20

export interface AdminBusinessesHook {
  businesses: AdminBusiness[]
  totalFiltered: number
  activeCount: number
  inactiveCount: number
  thisMonthCount: number
  loading: boolean
  error: string | null
  hasMore: boolean
  sentinelRef: (el: HTMLDivElement | null) => void
  rawSearch: string
  statusFilter: AdminBusinessStatus | ''
  modalBusiness: AdminBusiness | null
  submitting: boolean
  submitError: string | null
  setRawSearch: (s: string) => void
  setStatusFilter: (s: AdminBusinessStatus | '') => void
  openStatusModal: (biz: AdminBusiness) => void
  closeStatusModal: () => void
  submitStatusUpdate: (id: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>
}

export function useAdminBusinesses(): AdminBusinessesHook {
  const [rawSearch, setRawSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [statusFilter, setStatusFilterState] = useState<AdminBusinessStatus | ''>('')
  const [page, setPage] = useState(1)
  const [tick, setTick] = useState(0)

  const [businesses, setBusinesses] = useState<AdminBusiness[]>([])
  const [totalFiltered, setTotalFiltered] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)

  const [modalBusiness, setModalBusiness] = useState<AdminBusiness | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setCommittedSearch(rawSearch)
      setBusinesses([])
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [rawSearch])

  const setStatusFilter = useCallback((s: AdminBusinessStatus | '') => {
    setStatusFilterState(s)
    setBusinesses([])
    setPage(1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getAdminBusinesses({ search: committedSearch, status: statusFilter, page, limit: LIMIT })
      .then((result) => {
        if (cancelled) return
        setBusinesses((prev) => page === 1 ? result.businesses : [...prev, ...result.businesses])
        setTotalFiltered(result.totalFiltered)
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoading(false)
          setError(err instanceof Error ? err.message : 'Failed to load businesses')
        }
      })

    return () => { cancelled = true }
  }, [committedSearch, statusFilter, page, tick])

  const hasMore = businesses.length < totalFiltered

  useEffect(() => {
    if (!sentinelEl || !hasMore || loading) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setPage((p) => p + 1)
    }, { threshold: 0.1 })

    observer.observe(sentinelEl)
    return () => observer.disconnect()
  }, [sentinelEl, hasMore, loading])

  const now = new Date()
  const activeCount = businesses.filter((b) => b.status === 'approved').length
  const inactiveCount = businesses.filter((b) => b.status !== 'approved').length
  const thisMonthCount = businesses.filter((b) => {
    const d = new Date(b.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const sentinelRef = useCallback((el: HTMLDivElement | null) => setSentinelEl(el), [])

  const openStatusModal = useCallback((biz: AdminBusiness) => {
    setModalBusiness(biz)
    setSubmitError(null)
  }, [])

  const closeStatusModal = useCallback(() => {
    setModalBusiness(null)
    setSubmitError(null)
  }, [])

  const submitStatusUpdate = useCallback(async (
    id: string,
    status: 'approved' | 'rejected',
    reason?: string,
  ) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await updateBusinessStatus(id, status, reason)
      setSubmitting(false)
      setModalBusiness(null)
      setPage(1)
      setTick((t) => t + 1)
    } catch (err) {
      setSubmitting(false)
      setSubmitError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }, [])

  return {
    businesses,
    totalFiltered,
    activeCount,
    inactiveCount,
    thisMonthCount,
    loading,
    error,
    hasMore,
    sentinelRef,
    rawSearch,
    statusFilter,
    modalBusiness,
    submitting,
    submitError,
    setRawSearch,
    setStatusFilter,
    openStatusModal,
    closeStatusModal,
    submitStatusUpdate,
  }
}
