'use client'

import { cn } from '@/lib/utils'
import type { BusinessService } from '@/types'
import { useAddServiceForm } from '@/features/services/hooks/useAddServiceForm'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

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

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  onSuccess: () => void
  existingServices: BusinessService[]
}

export default function AddServiceModal(props: AddServiceModalProps) {
  const {
    register,
    onSubmit,
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
  } = useAddServiceForm(props)

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Add Service" className="max-w-lg">
      <form onSubmit={onSubmit} className="space-y-5">
        <SectionLabel>Basic info</SectionLabel>

        <Input
          label="Service name"
          placeholder="e.g. Classic Haircut"
          error={errors.name?.message}
          {...nameField}
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

        <div className="flex flex-col gap-1.5">
          <SectionLabel>Service image</SectionLabel>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img src={imagePreview} alt="Preview" className="h-40 w-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Remove image"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
          <SegmentedControl
            value={serviceType}
            onChange={(v) => setValue('service_type', v, { shouldValidate: true })}
            options={[
              { label: 'Appointment', value: 'appointment' },
              { label: 'Time Slot', value: 'time_slot' },
            ]}
          />
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
          <SegmentedControl
            value={pricingType}
            onChange={(v) => setValue('pricing_type', v, { shouldValidate: true })}
            options={[
              { label: 'Fixed', value: 'fixed' },
              { label: 'Range', value: 'range' },
              { label: 'On Request', value: 'on_request' },
            ]}
          />
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
            Add service
          </Button>
          <Button type="button" variant="outline" onClick={props.onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
