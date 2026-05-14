'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn, slugify } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useService } from '@/features/services/hooks/useService'
import { updateService } from '@/features/services/services/updateService.service'
import type { BusinessService } from '@/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
    description: z.string().max(500).optional(),
    service_type: z.enum(['appointment', 'time_slot']),
    min_duration_minutes: z.number().min(1, 'At least 1 minute'),
    variable_duration: z.boolean(),
    max_duration_minutes: z.number().min(1).nullable().optional(),
    duration_note: z.string().max(200).optional(),
    buffer_time_minutes: z.number().min(0).optional(),
    pricing_type: z.enum(['fixed', 'range', 'on_request']),
    price_amount: z.number().min(0).nullable().optional(),
    price_min: z.number().min(0).nullable().optional(),
    price_max: z.number().min(0).nullable().optional(),
    price_note: z.string().max(200).optional(),
    currency: z.string().optional(),
    max_capacity: z.number().min(1).optional(),
    requires_confirmation: z.boolean(),
    is_active: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.variable_duration && val.max_duration_minutes != null) {
      if (val.max_duration_minutes < val.min_duration_minutes) {
        ctx.addIssue({
          code: 'custom',
          message: `Must be ≥ min duration (${val.min_duration_minutes} min)`,
          path: ['max_duration_minutes'],
        })
      }
    }
    if (val.pricing_type === 'fixed' && val.price_amount == null) {
      ctx.addIssue({ code: 'custom', message: 'Price is required', path: ['price_amount'] })
    }
    if (val.pricing_type === 'range') {
      if (val.price_min == null) {
        ctx.addIssue({ code: 'custom', message: 'Min price is required', path: ['price_min'] })
      }
      if (val.price_max == null) {
        ctx.addIssue({ code: 'custom', message: 'Max price is required', path: ['price_max'] })
      }
      if (val.price_min != null && val.price_max != null && val.price_max < val.price_min) {
        ctx.addIssue({
          code: 'custom',
          message: `Must be ≥ min price (${val.price_min})`,
          path: ['price_max'],
        })
      }
    }
  })

type FormData = z.infer<typeof schema>

function serviceToFormData(s: BusinessService): FormData {
  return {
    name: s.name,
    slug: s.slug,
    description: s.description ?? '',
    service_type: s.service_type,
    min_duration_minutes: s.min_duration_minutes,
    variable_duration: s.max_duration_minutes != null,
    max_duration_minutes: s.max_duration_minutes,
    duration_note: s.duration_note ?? '',
    buffer_time_minutes: s.buffer_time_minutes,
    pricing_type: s.pricing_type,
    price_amount: s.price_amount,
    price_min: s.price_min,
    price_max: s.price_max,
    price_note: s.price_note ?? '',
    currency: s.currency,
    max_capacity: s.max_capacity,
    requires_confirmation: s.requires_confirmation,
    is_active: s.is_active,
  }
}

interface EditServiceModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string | null
  businessId: string
  onSuccess: () => void
  existingServices: BusinessService[]
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { label: string; value: T }[]
}) {
  return (
    <div className="flex rounded-lg border border-slate-300 overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            i < options.length - 1 && 'border-r border-slate-300',
            value === opt.value
              ? 'bg-indigo-600 text-white border-r-indigo-600'
              : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-1">{children}</p>
  )
}

export default function EditServiceModal({
  isOpen,
  onClose,
  serviceId,
  businessId,
  onSuccess,
  existingServices,
}: EditServiceModalProps) {
  const { service, status: loadStatus } = useService(isOpen ? serviceId : null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [populated, setPopulated] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(null)
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchedName = watch('name')
  const serviceType = watch('service_type')
  const pricingType = watch('pricing_type')
  const variableDuration = watch('variable_duration')

  useEffect(() => {
    if (populated && watchedName !== undefined) {
      setValue('slug', slugify(watchedName))
    }
  }, [watchedName, populated, setValue])

  useEffect(() => {
    if (!isOpen) {
      setPopulated(false)
      setSubmitError(null)
      setImageFile(null)
      setImagePreview(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (service && !populated) {
      reset(serviceToFormData(service))
      setImagePreview(service.image_url ?? null)
      setPopulated(true)
    }
  }, [service, populated, reset])

  async function onSubmit(data: FormData) {
    if (!serviceId) return
    setSubmitError(null)
    try {
      let image_url: string | null = service?.image_url ?? null
      if (imageFile) {
        const supabase = createClient()
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const path = `services/${businessId}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('slotify')
          .upload(path, imageFile, { upsert: true })
        if (uploadErr) throw new Error(`Image upload failed: ${uploadErr.message}`)
        const { data: { publicUrl } } = supabase.storage.from('slotify').getPublicUrl(path)
        image_url = publicUrl
      } else if (!imagePreview) {
        image_url = null
      }

      await updateService({
        service_id: serviceId,
        business_id: businessId,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url,
        service_type: data.service_type,
        min_duration_minutes: data.min_duration_minutes,
        max_duration_minutes: data.variable_duration ? (data.max_duration_minutes ?? null) : null,
        duration_note: data.duration_note || null,
        buffer_time_minutes: data.buffer_time_minutes ?? 0,
        pricing_type: data.pricing_type,
        price_amount: data.price_amount,
        price_min: data.price_min,
        price_max: data.price_max,
        price_note: data.price_note || null,
        currency: data.currency || 'PHP',
        max_capacity: data.max_capacity ?? 1,
        requires_confirmation: data.requires_confirmation,
        is_active: data.is_active,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const isLoading = loadStatus === 'idle' || loadStatus === 'loading'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Service" className="max-w-lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <SectionLabel>Basic info</SectionLabel>

          <Input
            label="Service name"
            placeholder="e.g. Classic Haircut"
            error={errors.name?.message}
            {...register('name', {
              validate: (v) =>
                !existingServices
                  .filter((s) => s.id !== serviceId)
                  .some((s) => s.name.toLowerCase() === v.trim().toLowerCase()) ||
                'A service with this name already exists',
            })}
          />

          <Input
            label="Slug"
            placeholder="e.g. classic-haircut"
            helperText="Auto-generated from name."
            error={errors.slug?.message}
            readOnly
            {...register('slug')}
          />

          <Textarea
            label="Description"
            placeholder="Brief description of the service…"
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Image */}
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Service image</SectionLabel>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={imagePreview} alt="Preview" className="h-40 w-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Change image"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Remove image"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Click to upload an image</span>
                <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <SectionLabel>Service type</SectionLabel>
            {serviceType !== undefined && (
              <SegmentedControl
                value={serviceType}
                onChange={(v) => setValue('service_type', v, { shouldValidate: true })}
                options={[
                  { label: 'Appointment', value: 'appointment' },
                  { label: 'Time Slot', value: 'time_slot' },
                ]}
              />
            )}
          </div>

          <SectionLabel>Duration</SectionLabel>

          <Input
            label="Min duration (minutes)"
            type="number"
            min={1}
            error={errors.min_duration_minutes?.message}
            {...register('min_duration_minutes', { valueAsNumber: true })}
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
              {...register('variable_duration')}
            />
            <span className="text-sm text-slate-700">Variable duration (set a max)</span>
          </label>

          {variableDuration && (
            <Input
              label="Max duration (minutes)"
              type="number"
              min={1}
              error={errors.max_duration_minutes?.message}
              {...register('max_duration_minutes', { valueAsNumber: true })}
            />
          )}

          <Input
            label="Buffer time (minutes)"
            type="number"
            min={0}
            helperText="Time between bookings"
            error={errors.buffer_time_minutes?.message}
            {...register('buffer_time_minutes', { valueAsNumber: true })}
          />

          <Input
            label="Duration note"
            placeholder="e.g. Depends on hair length"
            error={errors.duration_note?.message}
            {...register('duration_note')}
          />

          <div className="flex flex-col gap-1.5">
            <SectionLabel>Pricing</SectionLabel>
            {pricingType !== undefined && (
              <SegmentedControl
                value={pricingType}
                onChange={(v) => setValue('pricing_type', v, { shouldValidate: true })}
                options={[
                  { label: 'Fixed', value: 'fixed' },
                  { label: 'Range', value: 'range' },
                  { label: 'On Request', value: 'on_request' },
                ]}
              />
            )}
          </div>

          {pricingType === 'fixed' && (
            <Input
              label="Price"
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              error={errors.price_amount?.message}
              {...register('price_amount', { valueAsNumber: true })}
            />
          )}

          {pricingType === 'range' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min price"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                error={errors.price_min?.message}
                {...register('price_min', { valueAsNumber: true })}
              />
              <Input
                label="Max price"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                error={errors.price_max?.message}
                {...register('price_max', { valueAsNumber: true })}
              />
            </div>
          )}

          {pricingType !== 'on_request' && (
            <Input
              label="Currency"
              placeholder="PHP"
              error={errors.currency?.message}
              {...register('currency')}
            />
          )}

          <Input
            label="Price note"
            placeholder="e.g. Price may vary"
            error={errors.price_note?.message}
            {...register('price_note')}
          />

          <SectionLabel>Settings</SectionLabel>

          <Input
            label="Max capacity (bookings per slot)"
            type="number"
            min={1}
            error={errors.max_capacity?.message}
            {...register('max_capacity', { valueAsNumber: true })}
          />

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                {...register('requires_confirmation')}
              />
              <span className="text-sm text-slate-700">Requires confirmation before booking</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                {...register('is_active')}
              />
              <span className="text-sm text-slate-700">Active (visible to customers)</span>
            </label>
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Save changes
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
