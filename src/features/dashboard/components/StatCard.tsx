import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  className?: string
}

export default function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-1 text-xs',
                trend === 'up' && 'text-green-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-slate-500'
              )}
            >
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">{icon}</div>
        )}
      </div>
    </Card>
  )
}
