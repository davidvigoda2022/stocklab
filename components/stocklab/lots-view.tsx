'use client'

import { useMemo, useState } from 'react'
import { AlertOctagon, CalendarClock, Download, PackagePlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CONSERVATIONS, CURRENCY, INITIAL_PRODUCTS, type Conservation } from '@/lib/catalogue'
import {
  ECHEANCES,
  INITIAL_LOTS,
  STATUTS,
  daysUntil,
  formatDate,
  getEcheance,
  isInStock,
  type Echeance,
  type Lot,
  type LotStatut,
} from '@/lib/lots'
import { cn } from '@/lib/utils'
import { ECHEANCE_STYLE } from './expiry-badge'
import { LotDialog } from './lot-dialog'
import { LotsTable, type LotRow } from './lots-table'

const ALL = 'all'
const ECHEANCE_KEYS = Object.keys(ECHEANCES) as Echeance[]
const conservationItems = [
  { value: ALL, label: 'Toutes températures' },
  ...(Object.keys(CONSERVATIONS) as Conservation[]).map((c) => ({
    value: c,
    label: `${CONSERVATIONS[c].label} (${CONSERVATIONS[c].short})`,
  })),
]

function exportCsv(rows: LotRow[]) {
  const header = ['Produit', 'Référence', 'N° de lot', 'Péremption', 'Jours restants', 'Quantité', 'Quantité initiale', 'Emplacement', 'Réception', 'Ouverture', 'Statut']
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map(({ lot, product, days }) =>
    [
      product.designation, product.reference, lot.numero, formatDate(lot.datePeremption), days, lot.quantite,
      lot.quantiteInitiale, lot.emplacement, formatDate(lot.dateReception),
      lot.dateOuverture ? formatDate(lot.dateOuverture) : '', STATUTS[lot.statut].label,
    ].map(escape).join(';'),
  )
  const blob = new Blob(['\uFEFF' + [header.map(escape).join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'stocklab-lots-peremptions.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function LotsView({ today }: { today: string }) {
  const [lots, setLots] = useState<Lot[]>(INITIAL_LOTS)
  const [search, setSearch] = useState('')
  const [echeance, setEcheance] = useState<Echeance | typeof ALL>(ALL)
  const [conservation, setConservation] = useState(ALL)
  const [showClosed, setShowClosed] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const products = INITIAL_PRODUCTS
  const activeProducts = useMemo(() => products.filter((p) => p.actif), [products])

  const allRows = useMemo<LotRow[]>(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    const rows = lots.flatMap((lot) => {
      const product = byId.get(lot.productId)
      if (!product) return []
      const days = daysUntil(lot.datePeremption, today)
      return [{ lot, product, days, echeance: getEcheance(days), fefo: false }]
    })
    const firstByProduct = new Map<string, LotRow>()
    for (const row of rows) {
      const usable = (row.lot.statut === 'disponible' || row.lot.statut === 'entame') && row.days >= 0 && row.lot.quantite > 0
      if (!usable) continue
      const current = firstByProduct.get(row.product.id)
      if (!current || row.days < current.days) firstByProduct.set(row.product.id, row)
    }
    const fefoIds = new Set([...firstByProduct.values()].map((r) => r.lot.id))
    return rows.map((r) => ({ ...r, fefo: fefoIds.has(r.lot.id) && rows.filter((x) => x.product.id === r.product.id && isInStock(x.lot)).length > 1 }))
  }, [lots, products, today])

  const stockRows = allRows.filter((r) => isInStock(r.lot))
  const counts = Object.fromEntries(ECHEANCE_KEYS.map((k) => [k, stockRows.filter((r) => r.echeance === k).length])) as Record<Echeance, number>
  const exposedValue = stockRows
    .filter((r) => r.echeance === 'critique' || r.echeance === 'proche')
    .reduce((sum, r) => sum + r.lot.quantite * (r.product.prixUnitaire ?? 0), 0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allRows
      .filter((r) => showClosed || isInStock(r.lot))
      .filter((r) => echeance === ALL || (isInStock(r.lot) && r.echeance === echeance))
      .filter((r) => conservation === ALL || r.product.conservation === conservation)
      .filter(
        (r) =>
          !q ||
          [r.product.designation, r.product.reference, r.product.codeInterne, r.lot.numero, r.lot.emplacement]
            .join(' ')
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => Number(isInStock(b.lot)) - Number(isInStock(a.lot)) || a.days - b.days)
  }, [allRows, search, echeance, conservation, showClosed])

  function updateLot(id: string, patch: Partial<Lot>) {
    setLots((list) => list.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function handleStatusChange(lot: Lot, statut: LotStatut) {
    updateLot(lot.id, { statut, ...(statut === 'epuise' ? { quantite: 0 } : {}) })
  }

  function handleConsumeOne(lot: Lot) {
    const quantite = Math.max(0, lot.quantite - 1)
    updateLot(lot.id, {
      quantite,
      statut: quantite === 0 ? 'epuise' : 'entame',
      dateOuverture: lot.dateOuverture ?? today,
    })
  }

  const fmtMoney = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-5 px-8 py-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-card text-primary shadow-xs ring-1 ring-border">
            <CalendarClock className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Stock</p>
            <h1 className="text-2xl font-semibold text-balance">Lots &amp; péremptions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Suivi des lots en stock, de leurs dates de péremption et de l&apos;ordre de consommation (FEFO).
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 bg-card" onClick={() => exportCsv(filtered)}>
            <Download aria-hidden="true" />
            Exporter
          </Button>
          <Button className="h-9 px-4" onClick={() => setDialogOpen(true)}>
            <PackagePlus aria-hidden="true" />
            Réceptionner un lot
          </Button>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Lots en stock" value={stockRows.length} />
        <Stat label="Périmés à retirer" value={counts.perime} tone={counts.perime > 0 ? 'text-red-700' : undefined} />
        <Stat label="Expirent sous 30 jours" value={counts.critique} tone={counts.critique > 0 ? 'text-orange-700' : undefined} />
        <Stat label="Valeur exposée (≤ 90 j)" value={`${fmtMoney.format(exposedValue)} ${CURRENCY}`} />
      </dl>

      {counts.perime > 0 && echeance !== 'perime' && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-900"
        >
          <span className="inline-flex items-center gap-2">
            <AlertOctagon className="size-4 shrink-0 text-red-600" aria-hidden="true" />
            {counts.perime} lot{counts.perime > 1 ? 's' : ''} périmé{counts.perime > 1 ? 's' : ''} encore en stock :
            retirez-{counts.perime > 1 ? 'les' : 'le'} de l&apos;usage et procédez à la destruction.
          </span>
          <Button size="sm" variant="outline" className="border-red-200 bg-card text-red-800 hover:bg-red-100" onClick={() => setEcheance('perime')}>
            Afficher les périmés
          </Button>
        </div>
      )}

      <section aria-label="Liste des lots" className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="flex flex-col gap-3 border-b px-5 py-4">
          <div role="group" aria-label="Filtrer par échéance" className="flex flex-wrap gap-1.5">
            <FilterChip active={echeance === ALL} onClick={() => setEcheance(ALL)} label="Toutes échéances" count={stockRows.length} />
            {ECHEANCE_KEYS.map((k) => (
              <FilterChip
                key={k}
                active={echeance === k}
                onClick={() => setEcheance(k)}
                label={ECHEANCES[k].filterLabel}
                count={counts[k]}
                dot={ECHEANCE_STYLE[k].dot}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-64 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par produit, référence, n° de lot ou emplacement…"
                aria-label="Rechercher un lot"
                className="h-9 pl-9"
              />
            </div>
            <Select items={conservationItems} value={conservation} onValueChange={(v) => setConservation((v as string) ?? ALL)}>
              <SelectTrigger className="h-9 w-56" aria-label="Filtrer par température de conservation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conservationItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={showClosed} onCheckedChange={setShowClosed} />
              Afficher épuisés et détruits
            </label>
          </div>
        </div>

        <LotsTable rows={filtered} onStatusChange={handleStatusChange} onConsumeOne={handleConsumeOne} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
          <span>
            {filtered.length} lot{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''} sur {lots.length}
          </span>
          <span>Échéances calculées au {formatDate(today)} · tri par péremption la plus proche</span>
        </div>
      </section>

      <LotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={activeProducts}
        today={today}
        onSave={(lot) => {
          setLots((list) => [{ ...lot, id: crypto.randomUUID() }, ...list])
          setDialogOpen(false)
        }}
      />
    </main>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3 shadow-xs">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 text-xl font-semibold tabular-nums', tone)}>{value}</dd>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  dot,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  dot?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-accent',
      )}
    >
      {dot && <span className={cn('size-2 rounded-full', dot)} aria-hidden="true" />}
      {label}
      <span className={cn('rounded-full px-1.5 tabular-nums', active ? 'bg-white/20' : 'bg-secondary text-muted-foreground')}>
        {count}
      </span>
    </button>
  )
}
