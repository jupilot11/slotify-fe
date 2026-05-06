'use client'

import { useRouter } from 'next/navigation'
import AuthDialog from '@/features/auth/components/AuthDialog'

export default function LoginPageClient() {
  const router = useRouter()
  return <AuthDialog isOpen={true} onClose={() => router.push('/')} />
}
