'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import AuthDialog from '@/features/auth/components/AuthDialog'

export default function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isExpired = searchParams.get('expired') === 'true'

  return (
    <>
      {isExpired && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your session has expired. Please log in again.
        </div>
      )}
      <AuthDialog isOpen={true} onClose={() => router.push('/')} inline />
    </>
  )
}
