'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Business } from '@/types'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { updateBusiness } from '@/services/business.service'
import { BUSINESS_CATEGORIES } from '@/constants'

const settingsSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100),
  description: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(200).optional(),
  category: z.enum(['barbershop', 'clinic', 'salon', 'other']),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface SettingsClientProps {
  business: Business
}

export default function SettingsClient({ business }: SettingsClientProps) {
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: business.name,
      description: business.description ?? '',
      phone: business.phone ?? '',
      address: business.address ?? '',
      category: business.category,
    },
  })

  const onSubmit = async (data: SettingsFormData) => {
    await updateBusiness(business.id, data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Business name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Description"
            placeholder="Tell clients what your business is about..."
            error={errors.description?.message}
            {...register('description')}
          />
          <Select
            label="Category"
            options={BUSINESS_CATEGORIES}
            error={errors.category?.message}
            {...register('category')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Phone number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Address"
            placeholder="123 Main St, City, State"
            error={errors.address?.message}
            {...register('address')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
            <span className="text-sm text-slate-500">Your booking URL:</span>
            <code className="text-sm font-mono text-indigo-600">
              slotify.app/{business.slug}
            </code>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
          Save changes
        </Button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Changes saved!</span>
        )}
      </div>
    </form>
  )
}
