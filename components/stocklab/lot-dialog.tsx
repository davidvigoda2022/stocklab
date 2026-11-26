'use client'

import { useState, type ReactNode } from 'react'
import { PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Product } from '@/lib/catalogue'
import { EMPLACEMENTS, daysUntil, type Lot } from '@/lib/lots'

interface LotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  today: string
  onSave: (lot: Omit<Lot, 'id'>) => void
}

export function LotDialog({ open, onOpenChange, ...rest }: LotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {open && <LotForm {...rest} onCancel={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

type Draft = {
  productId: string
  numero: string
  datePeremption: string
  dateReception: string
  quantite: string
  emplacement: string
}

type Errors = Partial<Record<keyof Draft, string>>

function LotForm({
  products,
  today,
  onSave,
  onCancel,
}: Omit<LotDialogProps, 'open' | 'onOpenChange'> & { onCancel: () => void }) {
  const [draft, setDraft] = useState<Draft>({
    productId: '',
    numero: '',
    datePeremption: '',
    dateReception: today,
    quantite: '',
    emplacement: '',
  })
  const [errors, setErrors] = useState<Errors>({})

  const productItems = products.map((p) => ({ value: p.id, label: p.designation }))
  const emplacementItems = EMPLACEMENTS.map((e) => ({ value: e, label: e }))
  const shortExpiry =
    draft.datePeremption && daysUntil(draft.datePeremption, today) >= 0 && daysUntil(draft.datePeremption, today) <= 90

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const e: Errors = {}
    if (!draft.productId) e.productId = 'Choisissez le produit reçu.'
    if (!draft.numero.trim()) e.numero = 'Le numéro de lot est obligatoire.'
    if (!draft.datePeremption) e.datePeremption = 'La date de péremption est obligatoire.'
    else if (daysUntil(draft.datePeremption, today) < 0) e.datePeremption = 'Ce lot est déjà périmé : refusez la livraison.'
    if (!draft.dateReception) e.dateReception = 'Indiquez la date de réception.'
    const qty = Number(draft.quantite)
    if (!Number.isInteger(qty) || qty < 1 || qty > 9999) e.quantite = 'Quantité entière entre 1 et 9999.'
    if (!draft.emplacement) e.emplacement = "Choisissez l'emplacement de rangement."
    setErrors(e)
    if (Object.keys(e).length > 0) {
      document.getElementById(`lot-${Object.keys(e)[0]}`)?.focus()
      return
    }
    onSave({
      productId: draft.productId,
      numero: draft.numero.trim(),
      datePeremption: draft.datePeremption,
      dateReception: draft.dateReception,
      dateOuverture: null,
      quantiteInitiale: qty,
      quantite: qty,
      emplacement: draft.emplacement,
      statut: 'disponible',
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
      <div className="flex items-start gap-3 border-b px-6 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <PackagePlus className="size-5" aria-hidden="true" />
        </div>
        <div>
          <DialogTitle className="text-lg font-semibold">Réceptionner un lot</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enregistrez le numéro de lot et la date de péremption figurant sur l&apos;emballage.
          </DialogDescription>
        </div>
      </div>

      <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
        <Field id="lot-productId" label="Produit" error={errors.productId} className="sm:col-span-2">
          <Select items={productItems} value={draft.productId || null} onValueChange={(v) => set('productId', (v as string) ?? '')}>
            <SelectTrigger id="lot-productId" className="h-9 w-full" aria-invalid={Boolean(errors.productId)}>
              <SelectValue placeholder="Sélectionner un produit du catalogue" />
            </SelectTrigger>
            <SelectContent>
              {productItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id="lot-numero" label="Numéro de lot" error={errors.numero}>
          <Input
            id="lot-numero"
            value={draft.numero}
            onChange={(e) => set('numero', e.target.value)}
            placeholder="ex. 2011876"
            className="h-9 font-mono"
            aria-invalid={Boolean(errors.numero)}
          />
        </Field>

        <Field id="lot-quantite" label="Quantité reçue" error={errors.quantite}>
          <Input
            id="lot-quantite"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={draft.quantite}
            onChange={(e) => set('quantite', e.target.value)}
            placeholder="ex. 4"
            className="h-9"
            aria-invalid={Boolean(errors.quantite)}
          />
        </Field>

        <Field
          id="lot-datePeremption"
          label="Date de péremption"
          error={errors.datePeremption}
          hint={shortExpiry && !errors.datePeremption ? 'Péremption courte (≤ 90 j) : signalez-le au fournisseur.' : undefined}
        >
          <Input
            id="lot-datePeremption"
            type="date"
            value={draft.datePeremption}
            onChange={(e) => set('datePeremption', e.target.value)}
            className="h-9"
            aria-invalid={Boolean(errors.datePeremption)}
          />
        </Field>

        <Field id="lot-dateReception" label="Date de réception" error={errors.dateReception}>
          <Input
            id="lot-dateReception"
            type="date"
            value={draft.dateReception}
            max={today}
            onChange={(e) => set('dateReception', e.target.value)}
            className="h-9"
            aria-invalid={Boolean(errors.dateReception)}
          />
        </Field>

        <Field id="lot-emplacement" label="Emplacement" error={errors.emplacement} className="sm:col-span-2">
          <Select items={emplacementItems} value={draft.emplacement || null} onValueChange={(v) => set('emplacement', (v as string) ?? '')}>
            <SelectTrigger id="lot-emplacement" className="h-9 w-full" aria-invalid={Boolean(errors.emplacement)}>
              <SelectValue placeholder="Où le lot est-il rangé ?" />
            </SelectTrigger>
            <SelectContent>
              {emplacementItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t bg-muted/40 px-6 py-4">
        <Button type="button" variant="outline" className="h-9 bg-card" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="h-9 px-4">
          Enregistrer le lot
        </Button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-[13px]">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-destructive" role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-orange-700">{hint}</p>
      ) : null}
    </div>
  )
}
