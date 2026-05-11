'use client'

import { useState } from 'react'
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

export default function NewBusinessPage() {
  const router = useRouter()
  const { reload } = useBusinessContext()
  const { status, error, submit } = useCreateBusiness()

  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS)
  const { categories } = useBusinessCategories()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isDisabled = isLoading || isSuccess

  const onSubmit = handleSubmit(async (data) => {
    const result = await submit({
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
      logo_url: data.logo_url || undefined,
      banner_url: data.banner_url || undefined,
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
        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Create a New Business</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the details below. You can always update these later.
          </p>
        </div>

        {/* Error alert */}
        {error && (
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
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Basic info */}
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

          {/* Contact */}
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

          {/* Location */}
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

          {/* Media */}
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

          {/* Business Hours */}
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

          {/* Actions */}
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
              isLoading={isLoading}
              disabled={isDisabled}
              className="flex-1 sm:flex-none"
            >
              {isSuccess ? 'Business created!' : 'Create business'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
