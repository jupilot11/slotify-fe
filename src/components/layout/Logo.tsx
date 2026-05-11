import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  href?: string
}

export default function Logo({ className, href = '/' }: LogoProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5', className)}>
      <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
        <span className="text-white text-sm font-bold">S</span>
      </div>
      <span className="text-xl font-bold text-slate-900">Slotify</span>
    </Link>
  )
}
