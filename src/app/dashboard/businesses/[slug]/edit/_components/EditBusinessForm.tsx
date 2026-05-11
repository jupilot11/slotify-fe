'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import BusinessHoursEditor, {
  DEFAULT_HOURS,
  type DayHours,
} from '@/features/businesses/components/BusinessHoursEditor'
import { useBusinessCategories } from '@/features/businesses/hooks/useBusinessCategories'
import { useBusinessDetails } from '@/features/businesses/hooks/useBusinessDetails'
import { useUpdateBusiness } from '@/features/businesses/hooks/useUpdateBusiness'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'
import Modal from '@/components/ui/Modal'

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const optionalEmail = z
  .string()
  .optional()
  .refine((v) => !v || /\S+@\S+\.\S+/.test(v), { message: 'Invalid email address' })

const optionalUrl = z
  .string()
  .optional()
  .refine((v) => !v || /^https?:\/\/.+/.test(v), { message: 'Must start with http:// or https://' })

const schema = z.object({
  name: z.string().min(1, 'Business name is required').max(100),
  category_id: z.string().optional(),
  description: z.string().max(500).optional(),
  email: optionalEmail,
  phone: z.string().max(20).optional(),
  website_url: optionalUrl,
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  logo_url: optionalUrl,
  banner_url: optionalUrl,
})

type FormData = z.infer<typeof schema>

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonField({ tall = false }: { tall?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className={tall ? 'h-20' : 'h-10'} />
    </div>
  )
}

function EditBusinessSkeleton() {
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Card>
          <CardHeader><Skeleton className="h-5 w-20" /></CardHeader>
          <CardContent className="space-y-4">
            <SkeletonField />
            <SkeletonField />
            <SkeletonField tall />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><Skeleton className="h-5 w-16" /></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonField />
              <SkeletonField />
            </div>
            <SkeletonField />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><Skeleton className="h-5 w-20" /></CardHeader>
          <CardContent className="space-y-4">
            <SkeletonField />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><Skeleton className="h-5 w-14" /></CardHeader>
          <CardContent className="space-y-4">
            <SkeletonField />
            <SkeletonField />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent className="space-y-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditBusinessForm({ slug }: { slug: string }) {
  const router = useRouter()
  const { data: business, loading: businessLoading, error, reload: reloadDetails } = useBusinessDetails(slug)
  const { categories } = useBusinessCategories()
  const { reload: reloadContext } = useBusinessContext()

  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [showSuccess, setShowSuccess] = useState(false)
  const { submit: updateBusiness, error: updateError } = useUpdateBusiness()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (business && categories.length > 0) {
      reset({
        name: business.name,
        category_id: business.category_id ?? undefined,
        description: business.description ?? undefined,
        email: business.email ?? undefined,
        phone: business.phone ?? undefined,
        website_url: business.website_url ?? undefined,
        address: business.address ?? undefined,
        city: business.city ?? undefined,
        province: business.province ?? undefined,
        postal_code: business.postal_code ?? undefined,
        logo_url: business.logo_url ?? undefined,
        banner_url: business.banner_url ?? undefined,
      })
      if (business.hours?.length > 0) setHours(business.hours)
    }
  }, [business, categories, reset])

  const isReady = !businessLoading && !error && !!business && categories.length > 0

  if (!isReady) return <EditBusinessSkeleton />

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const isSubmitting = submitStatus === 'loading'
  const isSuccess = submitStatus === 'success'
  const isDisabled = isSubmitting || isSuccess

  const onSubmit = handleSubmit(async (data) => {
    setSubmitStatus('loading')
    const ok = await updateBusiness(business.id, { ...data, hours })
    if (ok) {
      setSubmitStatus('success')
      setShowSuccess(true)
    } else {
      setSubmitStatus('idle')
    }
  })

  function handleSuccessClose() {
    setShowSuccess(false)
    reloadDetails()
    reloadContext()
    router.push(`/dashboard/businesses/${slug}`)
  }

  return (
    <>
      <Modal isOpen={showSuccess} onClose={handleSuccessClose} title="Changes Saved">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Business updated successfully.</p>
              <p className="mt-1 text-sm text-slate-500">Your changes have been saved.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSuccessClose}>Done</Button>
          </div>
        </div>
      </Modal>

      <div className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Edit Business</h1>
            <p className="mt-1 text-sm text-slate-500">Update your business details below.</p>
          </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Business name *"
                placeholder="e.g. Juan's Barbershop"
                disabled={isDisabled}
                error={errors.name?.message}
                {...register('name')}
              />
              <Select
                label="Category"
                options={categories}
                disabled={isDisabled}
                error={errors.category_id?.message}
                {...register('category_id')}
              />
              <Textarea
                label="Description"
                placeholder="Tell customers what your business is about..."
                disabled={isDisabled}
                error={errors.description?.message}
                {...register('description')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="hello@business.com"
                  disabled={isDisabled}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  disabled={isDisabled}
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>
              <Input
                label="Website"
                type="url"
                placeholder="https://yourbusiness.com"
                disabled={isDisabled}
                error={errors.website_url?.message}
                {...register('website_url')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Street address"
                placeholder="123 Main Street"
                disabled={isDisabled}
                error={errors.address?.message}
                {...register('address')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="Makati"
                  disabled={isDisabled}
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="Province"
                  placeholder="Metro Manila"
                  disabled={isDisabled}
                  error={errors.province?.message}
                  {...register('province')}
                />
                <Input
                  label="Postal code"
                  placeholder="1200"
                  disabled={isDisabled}
                  error={errors.postal_code?.message}
                  {...register('postal_code')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Logo URL"
                type="url"
                placeholder="https://..."
                disabled={isDisabled}
                error={errors.logo_url?.message}
                {...register('logo_url')}
              />
              <Input
                label="Banner URL"
                type="url"
                placeholder="https://..."
                disabled={isDisabled}
                error={errors.banner_url?.message}
                {...register('banner_url')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Business Hours</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Adjust your operating hours as needed.</p>
              </div>
            </CardHeader>
            <CardContent>
              <BusinessHoursEditor value={hours} onChange={setHours} disabled={isDisabled} />
            </CardContent>
          </Card>

          {updateError && (
            <p className="text-sm text-red-600">{updateError}</p>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDisabled}
              onClick={() => router.back()}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isDisabled}
              className="flex-1 sm:flex-none"
            >
              {isSuccess ? 'Changes saved!' : 'Save changes'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </>
  )
}
