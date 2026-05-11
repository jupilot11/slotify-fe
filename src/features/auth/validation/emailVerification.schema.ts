import { z } from 'zod'

export const emailVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>
