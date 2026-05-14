'use client'

import { useEffect, useRef, useState } from 'react'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'
import { useBusinessServices } from '@/features/services/hooks/useBusinessServices'
import { useDeleteService } from '@/features/services/hooks/useDeleteService'
import AddServiceModal from '@/features/services/components/AddServiceModal'
import EditServiceModal from '@/features/services/components/EditServiceModal'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import type { BusinessService } from '@/types'

function formatDuration(min: number, max: number | null): string {
  if (max != null && max !== min) return `${min}–${max} min`
  return `${min} min`
}

function formatPrice(service: BusinessService): string {
  const { pricing_type, price_amount, price_min, price_max, currency } = service
  const sym = currency || 'PHP'
  if (pricing_type === 'fixed' && price_amount != null) return `${sym} ${price_amount.toFixed(2)}`
  if (pricing_type === 'range' && price_min != null && price_max != null)
    return `${sym} ${price_min.toFixed(2)} – ${price_max.toFixed(2)}`
  return 'On request'
}

interface ServiceCardMenuProps {
  onEdit: () => void
  onDelete: () => void
}

function ServiceCardMenu({ onEdit, onDelete }: ServiceCardMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/60 hover:text-slate-700 transition-colors"
        aria-label="Service options"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit() }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete() }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

const SERVICE_TYPE_GRADIENTS: Record<string, string> = {
  appointment: 'from-indigo-500 to-violet-500',
  time_slot: 'from-sky-500 to-cyan-400',
}

interface ServiceCardProps {
  service: BusinessService
  onEdit: (service: BusinessService) => void
  onDelete: (service: BusinessService) => void
}

function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const gradient = SERVICE_TYPE_GRADIENTS[service.service_type] ?? 'from-slate-400 to-slate-500'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative h-36 shrink-0">
        {service.image_url ? (
          <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-3">
          <Badge
            variant={service.service_type === 'appointment' ? 'info' : 'default'}
            className="bg-white/20 text-white border-0 backdrop-blur-sm"
          >
            {service.service_type === 'appointment' ? 'Appointment' : 'Time Slot'}
          </Badge>
        </div>
        <div className="absolute top-1.5 right-1.5">
          <ServiceCardMenu onEdit={() => onEdit(service)} onDelete={() => onDelete(service)} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 leading-snug">{service.name}</h3>
          {!service.is_active && <Badge variant="warning" className="shrink-0">Inactive</Badge>}
        </div>

        {service.description && (
          <p className="text-xs text-slate-500 line-clamp-2">{service.description}</p>
        )}

        <p className="text-base font-bold text-indigo-600 mt-0.5">{formatPrice(service)}</p>

        <div className="mt-auto pt-3 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDuration(service.min_duration_minutes, service.max_duration_minutes)}
          </span>
          {service.max_capacity > 1 && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Up to {service.max_capacity}
            </span>
          )}
          {service.requires_confirmation && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirmation required
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface DeleteDialogProps {
  isOpen: boolean
  service: BusinessService | null
  isDeleting: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

function DeleteDialog({ isOpen, service, isDeleting, error, onConfirm, onClose }: DeleteDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete service">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">{service?.name}</span>? This action cannot
          be undone.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isDeleting}
            className="flex-1 !bg-red-600 hover:!bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function ServicesPage() {
  const { selectedBusiness } = useBusinessContext()
  const { services, status, error, reload } = useBusinessServices(selectedBusiness?.id ?? null)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<BusinessService | null>(null)
  const [deletingService, setDeletingService] = useState<BusinessService | null>(null)

  const { isDeleting, error: deleteError, remove } = useDeleteService(reload)

  const isLoading = status === 'idle' || status === 'loading'

  function handleDeleteConfirm() {
    if (!deletingService || !selectedBusiness) return
    remove(deletingService.id, selectedBusiness.id).then(() => setDeletingService(null))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Services</h1>
          <p className="mt-1 text-sm text-slate-600">Manage the services your business offers.</p>
        </div>
        {!isLoading && services.length > 0 && (
          <Button onClick={() => setAddModalOpen(true)}>Add service</Button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && services.length === 0 && (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title="No services yet"
          description="Add your first service to let customers start booking with you."
          action={<Button onClick={() => setAddModalOpen(true)}>Add your first service</Button>}
        />
      )}

      {!isLoading && !error && services.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={setEditingService}
              onDelete={setDeletingService}
            />
          ))}
        </div>
      )}

      {selectedBusiness && (
        <>
          <AddServiceModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            businessId={selectedBusiness.id}
            onSuccess={reload}
            existingServices={services}
          />

          <EditServiceModal
            isOpen={editingService !== null}
            onClose={() => setEditingService(null)}
            serviceId={editingService?.id ?? null}
            businessId={selectedBusiness.id}
            onSuccess={reload}
            existingServices={services}
          />

          <DeleteDialog
            isOpen={deletingService !== null}
            service={deletingService}
            isDeleting={isDeleting}
            error={deleteError}
            onConfirm={handleDeleteConfirm}
            onClose={() => setDeletingService(null)}
          />
        </>
      )}
    </div>
  )
}
