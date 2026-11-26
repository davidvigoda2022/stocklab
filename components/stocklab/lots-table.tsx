'use client'

import {
  Ban,
  CircleCheck,
  MoreHorizontal,
  PackageCheck,
  PackageOpen,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Product } from '@/lib/catalogue'
import { STATUTS, formatDate, formatRelative, type Echeance, type Lot, type LotStatut } from '@/lib/lots'
import { cn } from '@/lib/utils'
import { ConservationBadge } from './conservation-badge'
import { ExpiryBadge } from './expiry-badge'

export interface LotRow {
  lot: Lot
  product: Product
  days: number
  echeance: Echeance
  fefo: boolean
}

interface LotsTableProps {
  rows: LotRow[]
  onStatusChange: (lot: Lot, statut: LotStatut) => void
  onConsumeOne: (lot: Lot) => void
}

const STATUT_STYLE: Record<LotStatut, string> = {
  disponible: 'text-primary',
  entame: 'text-sky-700',
  quarantaine: 'text-orange-700',
  epuise: 'text-muted-foreground',
  detruit: 'text-muted-foreground',
}

const STATUT_DOT: Record<LotStatut, string> = {
  disponible: 'bg-primary',
  entame: 'bg-sky-600',
  quarantaine: 'bg-orange-500',
  epuise: 'bg-muted-foreground/60',
  detruit: 'bg-muted-foreground/60',
}

export function LotsTable({ rows, onStatusChange, onConsumeOne }: LotsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">Aucun lot ne correspond</p>
        <p className="text-sm text-muted-foreground">Modifiez la recherche ou les filtres d&apos;échéance.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th scope="col" className="py-3 pr-4 pl-5 font-medium">Produit</th>
            <th scope="col" className="px-4 py-3 font-medium">N° de lot</th>
            <th scope="col" className="px-4 py-3 font-medium">Péremption</th>
            <th scope="col" className="px-4 py-3 font-medium">Quantité</th>
            <th scope="col" className="px-4 py-3 font-medium">Emplacement</th>
            <th scope="col" className="px-4 py-3 font-medium">Statut</th>
            <th scope="col" className="py-3 pr-5 pl-2 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ lot, product, days, echeance, fefo }) => {
            const closed = lot.statut === 'epuise' || lot.statut === 'detruit'
            const pct = lot.quantiteInitiale ? Math.round((lot.quantite / lot.quantiteInitiale) * 100) : 0
            return (
              <tr
                key={lot.id}
                className={cn(
                  'border-b transition-colors last:border-0 hover:bg-accent/60',
                  closed && 'bg-muted/60 text-muted-foreground',
                  !closed && echeance === 'perime' && 'bg-red-50/60',
                )}
              >
                <td className="py-3.5 pr-4 pl-5">
                  <div className="flex flex-col gap-1">
                    <span className={cn('font-medium text-pretty', !closed && 'text-foreground')}>
                      {product.designation}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-mono">Réf. {product.reference}</span>
                      <ConservationBadge value={product.conservation} />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-mono text-[13px] font-medium text-foreground">{lot.numero}</span>
                    {fefo && (
                      <span
                        className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-primary"
                        title="Premier expiré, premier sorti : à utiliser avant les autres lots de ce produit"
                      >
                        <CircleCheck className="size-3" aria-hidden="true" />
                        FEFO · en premier
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium whitespace-nowrap text-foreground tabular-nums">
                      {formatDate(lot.datePeremption)}
                    </span>
                    {closed ? (
                      <span className="text-xs">—</span>
                    ) : (
                      <ExpiryBadge echeance={echeance} label={formatRelative(days)} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex w-28 flex-col gap-1.5">
                    <span className="whitespace-nowrap tabular-nums">
                      <span className="font-medium text-foreground">{lot.quantite}</span>
                      <span className="text-muted-foreground"> / {lot.quantiteInitiale} {product.unite.toLowerCase()}{lot.quantiteInitiale > 1 ? 's' : ''}</span>
                    </span>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-secondary"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Reste ${pct} %`}
                    >
                      <div className="h-full rounded-full bg-chart-2" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="whitespace-nowrap">{lot.emplacement}</span>
                    <span className="text-xs text-muted-foreground">
                      Reçu le {formatDate(lot.dateReception)}
                      {lot.dateOuverture && ` · ouvert le ${formatDate(lot.dateOuverture)}`}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', STATUT_STYLE[lot.statut])}>
                    <span className={cn('size-1.5 rounded-full', STATUT_DOT[lot.statut])} aria-hidden="true" />
                    {STATUTS[lot.statut].label}
                  </span>
                </td>
                <td className="py-3.5 pr-5 pl-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label={`Actions pour le lot ${lot.numero}`} />}
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {closed ? (
                        <DropdownMenuItem onClick={() => onStatusChange(lot, lot.quantite > 0 ? 'disponible' : 'entame')} disabled={lot.quantite === 0}>
                          <PackageCheck aria-hidden="true" />
                          Remettre en stock
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => onConsumeOne(lot)} disabled={lot.statut === 'quarantaine' || echeance === 'perime'}>
                            <PackageOpen aria-hidden="true" />
                            Sortir 1 {product.unite.toLowerCase()}
                          </DropdownMenuItem>
                          {lot.statut === 'quarantaine' ? (
                            <DropdownMenuItem onClick={() => onStatusChange(lot, lot.dateOuverture ? 'entame' : 'disponible')}>
                              <ShieldCheck aria-hidden="true" />
                              Lever la quarantaine
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onStatusChange(lot, 'quarantaine')}>
                              <ShieldAlert aria-hidden="true" />
                              Mettre en quarantaine
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onStatusChange(lot, 'epuise')}>
                            <Ban aria-hidden="true" />
                            Marquer épuisé
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onStatusChange(lot, 'detruit')}>
                            <Trash2 aria-hidden="true" />
                            {echeance === 'perime' ? 'Retirer et détruire' : 'Détruire le lot'}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
