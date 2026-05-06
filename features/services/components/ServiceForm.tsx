'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import type { Service } from '@/types'

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(300).optional(),
  duration: z.number().min(5, 'Minimum 5 minutes').max(480),
  price: z.number().min(0, 'Price must be 0 or more'),
  status: z.enum(['active', 'inactive']),
})

export type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  defaultValues?: Partial<Service>
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel: () => void
}

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export default function ServiceForm({ defaultValues, onSubmit, onCancel }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      duration: defaultValues?.duration ?? 30,
      price: defaultValues?.price ?? 0,
      status: defaultValues?.status ?? 'active',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Service name"
        placeholder="e.g. Classic Haircut"
        error={errors.name?.message}
        {...register('name')}
      />
      <Textarea
        label="Description"
        placeholder="Brief description of the service..."
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duration (minutes)"
          type="number"
          min={5}
          error={errors.duration?.message}
          {...register('duration', { valueAsNumber: true })}
        />
        <Input
          label="Price (USD)"
          type="number"
          min={0}
          step={0.01}
          error={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
      </div>
      <Select
        label="Status"
        options={statusOptions}
        error={errors.status?.message}
        {...register('status')}
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {defaultValues?.id ? 'Update service' : 'Create service'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
