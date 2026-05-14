'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { slugify } from '@/lib/utils'
import { createService } from '@/features/services/services/createService.service'
import { uploadServiceImage } from '@/features/services/services/uploadServiceImage.service'
import type { BusinessService } from '@/types'

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

export type AddServiceFormData = z.infer<typeof schema>

const DEFAULT_VALUES: AddServiceFormData = {
  name: '',
  slug: '',
  description: '',
  service_type: 'appointment',
  min_duration_minutes: 30,
  variable_duration: false,
  max_duration_minutes: null,
  duration_note: '',
  buffer_time_minutes: 0,
  pricing_type: 'on_request',
  price_amount: null,
  price_min: null,
  price_max: null,
  price_note: '',
  currency: 'PHP',
  max_capacity: 1,
  requires_confirmation: false,
  is_active: true,
}

interface UseAddServiceFormProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  onSuccess: () => void
  existingServices: BusinessService[]
}

export function useAddServiceForm({
  isOpen,
  onClose,
  businessId,
  onSuccess,
  existingServices,
}: UseAddServiceFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddServiceFormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  })

  const watchedName = watch('name')
  const serviceType = watch('service_type')
  const pricingType = watch('pricing_type')
  const variableDuration = watch('variable_duration')

  useEffect(() => {
    setValue('slug', slugify(watchedName))
  }, [watchedName, setValue])

  useEffect(() => {
    if (isOpen) {
      reset(DEFAULT_VALUES)
      setSubmitError(null)
      setImageFile(null)
      setImagePreview(null)
    }
  }, [isOpen, reset])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const nameField = register('name', {
    validate: (v) =>
      !existingServices.some((s) => s.name.toLowerCase() === v.trim().toLowerCase()) ||
      'A service with this name already exists',
  })

  async function handleFormSubmit(data: AddServiceFormData) {
    setSubmitError(null)
    try {
      const image_url = imageFile ? await uploadServiceImage(businessId, imageFile) : null
      await createService({
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

  return {
    register,
    onSubmit: handleSubmit(handleFormSubmit),
    errors,
    isSubmitting,
    setValue,
    nameField,
    serviceType,
    pricingType,
    variableDuration,
    submitError,
    imagePreview,
    fileInputRef,
    handleImageChange,
    removeImage,
  }
}
