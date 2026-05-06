import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export default function TopBar({ title, subtitle, actions, className }: TopBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-white shrink-0',
        className
      )}
    >
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
