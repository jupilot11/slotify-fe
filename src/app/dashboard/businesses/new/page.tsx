'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import BusinessHoursEditor, {
  DEFAULT_HOURS,
  type DayHours,
} from '@/features/businesses/components/BusinessHoursEditor'
import { useCreateBusiness } from '@/features/businesses/hooks/useCreateBusiness'
import { useBusinessCategories } from '@/features/businesses/hooks/useBusinessCategories'
import { useBusinessContext } from '@/lib/contexts/BusinessContext'
import {
  uploadBusinessImageStaging,
} from '@/features/businesses/services/uploadBusinessImage.service'

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
  category_id: z.string().min(1, 'Category is required'),
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
type SupportingSlot = { file: File; preview: string }

export default function NewBusinessPage() {
  const router = useRouter()
  const { reload } = useBusinessContext()
  const { status, error, submit } = useCreateBusiness()
  const { categories } = useBusinessCategories()
  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS)

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

  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isDisabled = isLoading || isSuccess || isUploading

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
      next[i] = { file, preview }
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
    setUploadError(null)

    let logo_url: string | undefined
    let banner_url: string | undefined
    const image_urls: string[] = []
    const filledSlots = supportingSlots.filter((s): s is SupportingSlot => s !== null)
    const hasImages = logoFile || bannerFile || filledSlots.length > 0

    if (hasImages) {
      setIsUploading(true)
      try {
        await Promise.all([
          ...(logoFile
            ? [uploadBusinessImageStaging(logoFile).then((url) => { logo_url = url })]
            : []),
          ...(bannerFile
            ? [uploadBusinessImageStaging(bannerFile).then((url) => { banner_url = url })]
            : []),
          ...filledSlots.map((s) =>
            uploadBusinessImageStaging(s.file).then((url) => image_urls.push(url))
          ),
        ])
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Image upload failed')
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    const result = await submit({
      name: data.name,
      category_id: data.category_id,
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
      image_urls: image_urls.length > 0 ? image_urls : undefined,
      hours,
    })

    if (result) {
      reload()
      router.push('/dashboard')
    }
  })

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Create a New Business</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the details below. You can always update these later.
          </p>
        </div>

        {(error || uploadError) && (
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
            <p className="text-sm text-red-700">{error ?? uploadError}</p>
          </div>
        )}

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
                label="Category *"
                options={categories}
                disabled={isDisabled || categories.length === 0}
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
                      <img src={slot.preview} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
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
                <p className="text-xs text-slate-400 mt-0.5">
                  Defaults to Mon–Fri 8 AM–5 PM. Adjust as needed.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <BusinessHoursEditor value={hours} onChange={setHours} disabled={isDisabled} />
            </CardContent>
          </Card>

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
              isLoading={isLoading || isUploading}
              disabled={isDisabled}
              className="flex-1 sm:flex-none"
            >
              {isUploading
                ? 'Uploading images...'
                : isSuccess
                ? 'Business created!'
                : 'Create business'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
