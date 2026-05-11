'use client'

import { cn } from '@/lib/utils'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export interface DayHours {
  day_of_week: number
  is_closed: boolean
  open_time: string | null
  close_time: string | null
}

export const DEFAULT_HOURS: DayHours[] = [
  { day_of_week: 0, is_closed: true,  open_time: null,    close_time: null },
  { day_of_week: 1, is_closed: false, open_time: '08:00', close_time: '17:00' },
  { day_of_week: 2, is_closed: false, open_time: '08:00', close_time: '17:00' },
  { day_of_week: 3, is_closed: false, open_time: '08:00', close_time: '17:00' },
  { day_of_week: 4, is_closed: false, open_time: '08:00', close_time: '17:00' },
  { day_of_week: 5, is_closed: false, open_time: '08:00', close_time: '17:00' },
  { day_of_week: 6, is_closed: true,  open_time: null,    close_time: null },
]

interface BusinessHoursEditorProps {
  value: DayHours[]
  onChange: (hours: DayHours[]) => void
  disabled?: boolean
}

export default function BusinessHoursEditor({ value, onChange, disabled }: BusinessHoursEditorProps) {
  function update(index: number, patch: Partial<DayHours>) {
    onChange(value.map((h, i) => (i === index ? { ...h, ...patch } : h)))
  }

  return (
    <div className="space-y-1.5">
      {value.map((day, i) => (
        <div
          key={day.day_of_week}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5',
            day.is_closed ? 'bg-slate-50' : 'border border-slate-200 bg-white'
          )}
        >
          <span className="w-24 shrink-0 text-sm font-medium text-slate-700">
            {DAYS[day.day_of_week]}
          </span>

          <label className="flex shrink-0 cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={day.is_closed}
              disabled={disabled}
              onChange={(e) =>
                update(i, {
                  is_closed: e.target.checked,
                  open_time: e.target.checked ? null : '08:00',
                  close_time: e.target.checked ? null : '17:00',
                })
              }
              className="h-3.5 w-3.5 accent-indigo-600"
            />
            <span className="text-sm text-slate-500">Closed</span>
          </label>

          {day.is_closed ? (
            <span className="ml-auto text-sm italic text-slate-400">Closed all day</span>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <input
                type="time"
                value={day.open_time ?? ''}
                disabled={disabled}
                onChange={(e) => update(i, { open_time: e.target.value || null })}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
              <span className="text-sm text-slate-400">–</span>
              <input
                type="time"
                value={day.close_time ?? ''}
                disabled={disabled}
                onChange={(e) => update(i, { close_time: e.target.value || null })}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
