'use client'

const PASSWORD_CHECKS = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Special char', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

const STRENGTH_LEVELS = [
  { label: 'Weak', barColor: 'bg-red-500', textColor: 'text-red-500', segments: 1 },
  { label: 'Fair', barColor: 'bg-orange-400', textColor: 'text-orange-500', segments: 2 },
  { label: 'Good', barColor: 'bg-indigo-500', textColor: 'text-indigo-600', segments: 3 },
  { label: 'Strong', barColor: 'bg-emerald-500', textColor: 'text-emerald-600', segments: 4 },
]

function getStrengthIndex(passed: number) {
  if (passed <= 2) return 0
  if (passed === 3) return 1
  if (passed === 4) return 2
  return 3
}

export default function PasswordStrength({ value }: { value: string }) {
  if (!value) return null

  const passed = PASSWORD_CHECKS.filter((c) => c.test(value)).length
  const idx = getStrengthIndex(passed)
  const { label, barColor, textColor, segments } = STRENGTH_LEVELS[idx]

  return (
    <div className="space-y-2.5 pt-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < segments ? barColor : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold transition-colors duration-300 w-12 text-right ${textColor}`}>
          {label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PASSWORD_CHECKS.map(({ label: checkLabel, test }) => {
          const pass = test(value)
          return (
            <span
              key={checkLabel}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 ${
                pass
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {pass ? (
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="h-3 w-3 flex items-center justify-center leading-none">·</span>
              )}
              {checkLabel}
            </span>
          )
        })}
      </div>
    </div>
  )
}
