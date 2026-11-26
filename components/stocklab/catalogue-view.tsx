'use client'

import { useMemo, useState } from 'react'
import { BookOpenText, Download, Info, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONSERVATIONS, INITIAL_PRODUCTS, formatConditionnement, type Product } from '@/lib/catalogue'
import { CatalogueTable } from './catalogue-table'
import { ALL, CatalogueToolbar } from './catalogue-toolbar'
import { DeleteDialog } from './delete-dialog'
import { ProductDialog } from './product-dialog'

function exportCsv(rows: Product[]) {
  const header = [
    'Référence', 'Code interne', 'Désignation', 'Catégorie', 'Plateforme', 'Fournisseur', 'Conservation',
    'Unité', 'Type de contenu', 'Nombre par unité', 'Prix unitaire', 'Seuil min', 'Stock cible', 'GTIN',
    'Suivi boîte par boîte', 'Remarques', 'Actif',
  ]
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map((p) =>
    [
      p.reference, p.codeInterne, p.designation, p.categorie, p.plateforme, p.fournisseur,
      CONSERVATIONS[p.conservation].short, p.unite, p.typeContenu, p.nombreParUnite, p.prixUnitaire,
      p.seuilMin, p.stockCible, p.gtin, p.suiviBoite ? 'Oui' : 'Non', p.remarques, p.actif ? 'Oui' : 'Non',
    ].map(escape).join(';'),
  )
  const blob = new Blob(['\uFEFF' + [header.map(escape).join(';'), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'stocklab-catalogue.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function CatalogueView() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [search, setSearch] = useState('')
  const [categorie, setCategorie] = useState(ALL)
  const [plateforme, setPlateforme] = useState(ALL)
  const [showInactive, setShowInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products
      .filter((p) => showInactive || p.actif)
      .filter((p) => categorie === ALL || p.categorie === categorie)
      .filter((p) => plateforme === ALL || p.plateforme === plateforme)
      .filter(
        (p) =>
          !q ||
          [p.designation, p.reference, p.codeInterne, p.gtin, p.fournisseur, formatConditionnement(p)]
            .join(' ')
            .toLowerCase()
            .includes(q),
      )
      .sort((a, b) => Number(b.actif) - Number(a.actif) || a.designation.localeCompare(b.designation, 'fr'))
  }, [products, search, categorie, plateforme, showInactive])

  const activeCount = products.filter((p) => p.actif).length
  const inactiveCount = products.length - activeCount
  const categoryCount = new Set(products.map((p) => p.categorie).filter(Boolean)).size
  const supplierCount = new Set(products.map((p) => p.fournisseur).filter(Boolean)).size

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setDialogOpen(true)
  }

  function handleSave(data: Omit<Product, 'id'>, id?: string) {
    setProducts((list) =>
      id ? list.map((p) => (p.id === id ? { ...data, id } : p)) : [{ ...data, id: crypto.randomUUID() }, ...list],
    )
    setDialogOpen(false)
  }

  function toggleActive(p: Product) {
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, actif: !x.actif } : x)))
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-5 px-8 py-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-card text-primary shadow-xs ring-1 ring-border">
            <BookOpenText className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Référentiel</p>
            <h1 className="text-2xl font-semibold text-balance">Catalogue des produits</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Fiches d&apos;identité des réactifs et consommables : ce qu&apos;est chaque produit et comment le conserver.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 bg-card" onClick={() => exportCsv(filtered)}>
            <Download aria-hidden="true" />
            Exporter
          </Button>
          <Button className="h-9 px-4" onClick={openNew}>
            <Plus aria-hidden="true" />
            Nouveau produit
          </Button>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Fiches actives" value={activeCount} />
        <Stat label="Fiches inactives" value={inactiveCount} />
        <Stat label="Catégories" value={categoryCount} />
        <Stat label="Fournisseurs" value={supplierCount} />
      </dl>

      <section aria-label="Liste des fiches produits" className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <CatalogueToolbar
          search={search}
          onSearchChange={setSearch}
          categorie={categorie}
          onCategorieChange={setCategorie}
          plateforme={plateforme}
          onPlateformeChange={setPlateforme}
          showInactive={showInactive}
          onShowInactiveChange={setShowInactive}
        />
        <CatalogueTable
          products={filtered}
          onEdit={openEdit}
          onToggleActive={toggleActive}
          onDelete={setDeleting}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
          <span>
            {filtered.length} fiche{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''} sur{' '}
            {products.length}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Info className="size-3.5" aria-hidden="true" />
            Les lots et dates de péremption se consultent dans Stock › Lots &amp; péremptions.
          </span>
        </div>
      </section>

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editing} onSave={handleSave} />
      <DeleteDialog
        product={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={(p) => {
          setProducts((list) => list.filter((x) => x.id !== p.id))
          setDeleting(null)
        }}
        onDeactivate={(p) => {
          toggleActive(p)
          setDeleting(null)
        }}
      />
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3 shadow-xs">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
