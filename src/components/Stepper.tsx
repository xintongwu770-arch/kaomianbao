import { useI18n } from '../lib/i18n'

interface StepperProps {
  value: number
  onChange: (next: number) => void
  min?: number
}

export default function Stepper({ value, onChange, min = 0 }: StepperProps) {
  const { t } = useI18n()
  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 active:bg-slate-200 select-none"
        aria-label={t('aria_dec')}
      >
        −
      </button>
      <span className="w-8 text-center font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 active:bg-slate-200 select-none"
        aria-label={t('aria_inc')}
      >
        +
      </button>
    </div>
  )
}
