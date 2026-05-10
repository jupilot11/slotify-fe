// Auth logic lives in features/auth/services/.
// This file is kept for backwards compatibility but is no longer the
// canonical auth entry-point.
//
// Use:
//   loginUser  → @/features/auth/services/login.service
//   logoutUser → @/features/auth/services/logout.service
//   useUser    → @/hooks/useUser

export { loginUser } from '@/features/auth/services/login.service'
export { logoutUser } from '@/features/auth/services/logout.service'
