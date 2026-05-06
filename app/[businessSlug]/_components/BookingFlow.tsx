'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Business, Service } from '@/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency, formatTime } from '@/lib/utils'
import { getAvailableSlots, createBooking } from '@/services/booking.service'

type Step = 'service' | 'datetime' | 'details' | 'confirmation'

const customerSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().optional(),
  notes: z.string().max(300).optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface BookingFlowProps {
  business: Business
  services: Service[]
}

const DATE_OPTIONS = (() => {
  const options = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    options.push({
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    })
  }
  return options
})()

export default function BookingFlow({ business, services }: BookingFlowProps) {
  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0].value)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) })

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep('datetime')
    loadSlots(service, selectedDate)
  }

  const loadSlots = async (service: Service, date: string) => {
    setLoadingSlots(true)
    setSelectedTime(null)
    const slots = await getAvailableSlots(business.id, service.id, date)
    setAvailableSlots(slots)
    setLoadingSlots(false)
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    if (selectedService) loadSlots(selectedService, date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('details')
  }

  const onSubmit = async (data: CustomerFormData) => {
    if (!selectedService || !selectedTime) return
    const result = await createBooking({
      businessId: business.id,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
      ...data,
    })
    if (result.data) {
      setConfirmedBookingId(result.data.id)
      setStep('confirmation')
    }
  }

  if (step === 'confirmation') {
    return (
      <Card className="p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Booking confirmed!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Your appointment has been submitted. You&apos;ll hear from us shortly.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
          <p className="text-sm"><span className="font-medium text-slate-700">Service:</span> <span className="text-slate-600">{selectedService?.name}</span></p>
          <p className="text-sm"><span className="font-medium text-slate-700">Date:</span> <span className="text-slate-600">{selectedDate}</span></p>
          <p className="text-sm"><span className="font-medium text-slate-700">Time:</span> <span className="text-slate-600">{selectedTime ? formatTime(selectedTime) : ''}</span></p>
          <p className="text-sm font-mono text-xs text-slate-400 mt-2">Ref: {confirmedBookingId}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setStep('service')
            setSelectedService(null)
            setSelectedTime(null)
          }}
        >
          Book another appointment
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {(['service', 'datetime', 'details'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s
                  ? 'bg-indigo-600 text-white'
                  : ['service', 'datetime', 'details'].indexOf(step) > i
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs font-medium capitalize hidden sm:block ${step === s ? 'text-indigo-600' : 'text-slate-400'}`}>
              {s === 'datetime' ? 'Date & Time' : s}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-slate-200 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step: Select service */}
      {step === 'service' && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Choose a service</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {service.name}
                    </p>
                    {service.description && (
                      <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">{service.duration} min</p>
                  </div>
                  <span className="text-lg font-bold text-slate-900 shrink-0 ml-4">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Select date & time */}
      {step === 'datetime' && selectedService && (
        <div>
          <button
            onClick={() => setStep('service')}
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-indigo-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-indigo-900">{selectedService.name}</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {selectedService.duration} min · {formatCurrency(selectedService.price)}
            </p>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 mb-3">Select a date</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleDateChange(opt.value)}
                className={`shrink-0 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  selectedDate === opt.value
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-slate-900 mb-3">Select a time</h2>
          {loadingSlots ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No available slots on this date.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleTimeSelect(slot)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Customer details */}
      {step === 'details' && selectedService && selectedTime && (
        <div>
          <button
            onClick={() => setStep('datetime')}
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-indigo-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-indigo-900">{selectedService.name}</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {selectedDate} at {formatTime(selectedTime)} · {formatCurrency(selectedService.price)}
            </p>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your details</h2>
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full name"
                placeholder="John Smith"
                error={errors.customerName?.message}
                {...register('customerName')}
              />
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                error={errors.customerEmail?.message}
                {...register('customerEmail')}
              />
              <Input
                label="Phone (optional)"
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...register('customerPhone')}
              />
              <Input
                label="Notes (optional)"
                placeholder="Any special requests..."
                {...register('notes')}
              />
              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                Confirm booking
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
