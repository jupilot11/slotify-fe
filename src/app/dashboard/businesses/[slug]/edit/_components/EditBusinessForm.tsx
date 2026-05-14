'use client'

import { useState, useEffect, useRef } from 'react'
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
import { useBusinessContext } from '@/lib/contexts/BusinessContext'
import { updateBusiness } from '@/features/businesses/services/updateBusiness.service'
import { uploadBusinessImage } from '@/features/businesses/services/uploadBusinessImage.service'
import Modal from '@/components/ui/Modal'

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
})

type FormData = z.infer<typeof schema>

type SupportingSlot = {
  existingUrl: string | null
  file: File | null
  preview: string
}

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
            <Skeleton className="h-28 w-28 rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
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

export default function EditBusinessForm({ slug }: { slug: string }) {
  const router = useRouter()
  const { data: business, loading: businessLoading, error, reload: reloadDetails } = useBusinessDetails(slug)
  const { categories } = useBusinessCategories()
  const { reload: reloadContext } = useBusinessContext()

  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [supportingSlots, setSupportingSlots] = useState<Array<SupportingSlot | null>>(
    Array(5).fill(null)
  )
  const supportingInputRef = useRef<HTMLInputElement>(null)
  const activeSlotIndex = useRef(-1)

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
      })
      setLogoPreview(business.logo_url ?? null)
      setBannerPreview(business.banner_url ?? null)
      const slots: Array<SupportingSlot | null> = Array(5).fill(null)
      ;(business.image_urls ?? []).forEach((url, i) => {
        if (i < 5) slots[i] = { existingUrl: url, file: null, preview: url }
      })
      setSupportingSlots(slots)
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

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setBannerFile(file)
    setBannerPreview(file ? URL.createObjectURL(file) : null)
  }

  function removeBanner() {
    setBannerFile(null)
    setBannerPreview(null)
    if (bannerInputRef.current) bannerInputRef.current.value = ''
  }

  function openSupportingSlot(i: number) {
    activeSlotIndex.current = i
    supportingInputRef.current?.click()
  }

  function handleSupportingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const i = activeSlotIndex.current
    if (i < 0 || i >= 5) return
    const preview = URL.createObjectURL(file)
    setSupportingSlots((prev) => {
      const next = [...prev]
      next[i] = { existingUrl: next[i]?.existingUrl ?? null, file, preview }
      return next
    })
    e.target.value = ''
  }

  function removeSupportingSlot(i: number) {
    setSupportingSlots((prev) => {
      const next = [...prev]
      next[i] = null
      return next
    })
  }

  const onSubmit = handleSubmit(async (data) => {
    setSubmitStatus('loading')
    setSubmitError(null)
    try {
      let logo_url: string | undefined
      if (logoFile) {
        logo_url = await uploadBusinessImage(business.id, logoFile, 'logo')
      } else {
        logo_url = logoPreview ?? undefined
      }

      let banner_url: string | undefined
      if (bannerFile) {
        banner_url = await uploadBusinessImage(business.id, bannerFile, 'banner')
      } else {
        banner_url = bannerPreview ?? undefined
      }

      const image_urls = (
        await Promise.all(
          supportingSlots.map(async (slot) => {
            if (!slot) return null
            if (slot.file) return uploadBusinessImage(business.id, slot.file, 'images')
            return slot.existingUrl
          })
        )
      ).filter((url): url is string => url !== null)

      await updateBusiness(business.id, {
        name: data.name,
        category_id: data.category_id || undefined,
        description: data.description || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website_url: data.website_url || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        province: data.province || undefined,
        postal_code: data.postal_code || undefined,
        logo_url,
        banner_url,
        image_urls,
        hours,
      })

      setSubmitStatus('success')
      setShowSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
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

            {/* Media: logo + banner */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-700">Logo</p>
                  {logoPreview ? (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200">
                      <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                      <div className="absolute top-1 right-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={isDisabled}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          aria-label="Change logo"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={removeLogo}
                          disabled={isDisabled}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          aria-label="Remove logo"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isDisabled}
                      className="flex flex-col items-center justify-center gap-1.5 w-28 h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">Upload logo</span>
                    </button>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-700">Banner</p>
                  {bannerPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      <img src={bannerPreview} alt="Banner preview" className="h-36 w-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          disabled={isDisabled}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          aria-label="Change banner"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={removeBanner}
                          disabled={isDisabled}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          aria-label="Remove banner"
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
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={isDisabled}
                      className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Click to upload banner</span>
                      <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
                    </button>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supporting Images */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Supporting Images</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload up to 5 photos to showcase your business.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const slot = supportingSlots[i]
                    return slot ? (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200"
                      >
                        <img
                          src={slot.preview}
                          alt={`Photo ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-1 right-1 flex gap-1">
                          <button
                            type="button"
                            onClick={() => openSupportingSlot(i)}
                            disabled={isDisabled}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            aria-label="Change photo"
                          >
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSupportingSlot(i)}
                            disabled={isDisabled}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            aria-label="Remove photo"
                          >
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openSupportingSlot(i)}
                        disabled={isDisabled}
                        className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[10px]">Photo {i + 1}</span>
                      </button>
                    )
                  })}
                </div>
                <input
                  ref={supportingInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleSupportingChange}
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

            {submitError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
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
