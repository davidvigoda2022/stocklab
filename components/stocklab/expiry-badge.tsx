import { AlertOctagon, AlertTriangle, CalendarCheck, Clock } from 'lucide-react'
import { ECHEANCES, type Echeance } from '@/lib/lots'
import { cn } from '@/lib/utils'

export const ECHEANCE_STYLE: Record<Echeance, { icon: typeof Clock; className: string; dot: string }> = {
  perime: { icon: AlertOctagon, className: 'bg-red-50 text-red-800 ring-red-200', dot: 'bg-red-600' },
  critique: { icon: AlertTriangle, className: 'bg-orange-50 text-orange-800 ring-orange-200', dot: 'bg-orange-500' },
  proche: { icon: Clock, className: 'bg-yellow-50 text-yellow-800 ring-yellow-200', dot: 'bg-yellow-500' },
  ok: { icon: CalendarCheck, className: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-600' },
}

export function ExpiryBadge({ echeance, label }: { echeance: Echeance; label?: string }) {
  const { icon: Icon, className } = ECHEANCE_STYLE[echeance]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label ?? ECHEANCES[echeance].label}
    </span>
  )
}
