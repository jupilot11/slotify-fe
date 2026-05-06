'use client'

import { useState } from 'react'
import type { Service } from '@/types'
import ServiceCard from '@/features/services/components/ServiceCard'
import ServiceForm from '@/features/services/components/ServiceForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { useModal } from '@/hooks/useModal'
import { createService, updateService, deleteService } from '@/services/catalog.service'

interface ServicesClientProps {
  initialServices: Service[]
  businessId: string
}

export default function ServicesClient({ initialServices, businessId }: ServicesClientProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const createModal = useModal()
  const editModal = useModal()

  const handleCreate = async (data: Omit<Service, 'id' | 'businessId'>) => {
    const result = await createService({ ...data, businessId })
    if (result.data) {
      setServices((prev) => [...prev, result.data!])
      createModal.close()
    }
  }

  const handleEdit = async (data: Omit<Service, 'id' | 'businessId'>) => {
    if (!editingService) return
    const result = await updateService(editingService.id, data)
    if (result.data) {
      setServices((prev) => prev.map((s) => (s.id === editingService.id ? result.data! : s)))
      editModal.close()
      setEditingService(null)
    }
  }

  const handleDelete = async (service: Service) => {
    if (!confirm(`Delete "${service.name}"?`)) return
    await deleteService(service.id)
    setServices((prev) => prev.filter((s) => s.id !== service.id))
  }

  const openEdit = (service: Service) => {
    setEditingService(service)
    editModal.open()
  }

  const activeServices = services.filter((s) => s.status === 'active')
  const inactiveServices = services.filter((s) => s.status === 'inactive')

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {activeServices.length} active · {inactiveServices.length} inactive
        </p>
        <Button onClick={createModal.open} size="sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add service
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Create your first service to start accepting bookings."
          action={
            <Button onClick={createModal.open}>
              Add your first service
            </Button>
          }
          icon={
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
      ) : (
        <div className="space-y-6">
          {activeServices.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-slate-500 mb-3">Active</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
          {inactiveServices.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-slate-500 mb-3">Inactive</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {inactiveServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="New service">
        <ServiceForm
          onSubmit={handleCreate}
          onCancel={createModal.close}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit service">
        {editingService && (
          <ServiceForm
            defaultValues={editingService}
            onSubmit={handleEdit}
            onCancel={() => {
              editModal.close()
              setEditingService(null)
            }}
          />
        )}
      </Modal>
    </>
  )
}
