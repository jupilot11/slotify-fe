import { z } from 'zod'

export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be under 100 characters'),
  contactNumber: z
    .string()
    .min(7, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>
