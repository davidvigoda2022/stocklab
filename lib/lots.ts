export type LotStatut = 'disponible' | 'entame' | 'quarantaine' | 'epuise' | 'detruit'

export interface Lot {
  id: string
  productId: string
  numero: string
  datePeremption: string
  dateReception: string
  dateOuverture: string | null
  quantiteInitiale: number
  quantite: number
  emplacement: string
  statut: LotStatut
}

export type Echeance = 'perime' | 'critique' | 'proche' | 'ok'

export const ECHEANCES: Record<Echeance, { label: string; filterLabel: string }> = {
  perime: { label: 'Périmé', filterLabel: 'Périmés' },
  critique: { label: '≤ 30 j', filterLabel: '≤ 30 jours' },
  proche: { label: '31–90 j', filterLabel: '31–90 jours' },
  ok: { label: '> 90 j', filterLabel: '> 90 jours' },
}

export const STATUTS: Record<LotStatut, { label: string }> = {
  disponible: { label: 'Disponible' },
  entame: { label: 'Entamé' },
  quarantaine: { label: 'Quarantaine' },
  epuise: { label: 'Épuisé' },
  detruit: { label: 'Détruit' },
}

export const EMPLACEMENTS = [
  'Armoire A1 — Ambiante',
  'Armoire A2 — Ambiante',
  'Réfrigérateur R1 (2–8 °C)',
  'Réfrigérateur R2 (2–8 °C)',
  'Congélateur C1 (≤ -20 °C)',
  'Réserve consommables',
]

const DAY_MS = 86_400_000

function toUtc(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function daysUntil(iso: string, today: string) {
  return Math.round((toUtc(iso) - toUtc(today)) / DAY_MS)
}

export function getEcheance(days: number): Echeance {
  if (days < 0) return 'perime'
  if (days <= 30) return 'critique'
  if (days <= 90) return 'proche'
  return 'ok'
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function formatRelative(days: number) {
  if (days === 0) return "Expire aujourd'hui"
  if (days < 0) return `Périmé depuis ${-days} j`
  if (days < 60) return `Dans ${days} j`
  return `Dans ${Math.round(days / 30)} mois`
}

export const isInStock = (l: Lot) => l.statut === 'disponible' || l.statut === 'entame' || l.statut === 'quarantaine'

export const INITIAL_LOTS: Lot[] = [
  { id: 'l1', productId: 'p1', numero: '1985423', datePeremption: '2027-03-14', dateReception: '2026-09-02', dateOuverture: '2026-10-12', quantiteInitiale: 4, quantite: 3, emplacement: 'Armoire A1 — Ambiante', statut: 'entame' },
  { id: 'l2', productId: 'p1', numero: '2011876', datePeremption: '2027-08-30', dateReception: '2026-10-20', dateOuverture: null, quantiteInitiale: 3, quantite: 3, emplacement: 'Armoire A1 — Ambiante', statut: 'disponible' },
  { id: 'l3', productId: 'p2', numero: '1972210', datePeremption: '2026-11-18', dateReception: '2026-05-11', dateOuverture: '2026-08-03', quantiteInitiale: 2, quantite: 1, emplacement: 'Armoire A1 — Ambiante', statut: 'entame' },
  { id: 'l4', productId: 'p3', numero: 'AS24117', datePeremption: '2026-10-21', dateReception: '2026-02-14', dateOuverture: '2026-07-01', quantiteInitiale: 3, quantite: 1, emplacement: 'Réfrigérateur R1 (2–8 °C)', statut: 'entame' },
  { id: 'l5', productId: 'p3', numero: 'AS25032', datePeremption: '2027-05-31', dateReception: '2026-09-28', dateOuverture: null, quantiteInitiale: 4, quantite: 4, emplacement: 'Réfrigérateur R1 (2–8 °C)', statut: 'disponible' },
  { id: 'l6', productId: 'p4', numero: 'CR25009', datePeremption: '2026-12-15', dateReception: '2026-04-09', dateOuverture: '2026-09-15', quantiteInitiale: 4, quantite: 2, emplacement: 'Réfrigérateur R1 (2–8 °C)', statut: 'entame' },
  { id: 'l7', productId: 'p5', numero: '74629301', datePeremption: '2027-01-20', dateReception: '2026-08-18', dateOuverture: null, quantiteInitiale: 6, quantite: 6, emplacement: 'Réfrigérateur R2 (2–8 °C)', statut: 'disponible' },
  { id: 'l8', productId: 'p5', numero: '74511288', datePeremption: '2026-11-08', dateReception: '2026-05-22', dateOuverture: '2026-10-01', quantiteInitiale: 6, quantite: 2, emplacement: 'Réfrigérateur R2 (2–8 °C)', statut: 'entame' },
  { id: 'l9', productId: 'p6', numero: 'D5021', datePeremption: '2027-06-12', dateReception: '2026-10-05', dateOuverture: null, quantiteInitiale: 10, quantite: 8, emplacement: 'Armoire A2 — Ambiante', statut: 'disponible' },
  { id: 'l10', productId: 'p7', numero: '3721488203', datePeremption: '2026-12-02', dateReception: '2026-06-17', dateOuverture: null, quantiteInitiale: 3, quantite: 2, emplacement: 'Réfrigérateur R2 (2–8 °C)', statut: 'quarantaine' },
  { id: 'l11', productId: 'p7', numero: '3721502117', datePeremption: '2027-04-09', dateReception: '2026-10-14', dateOuverture: null, quantiteInitiale: 4, quantite: 4, emplacement: 'Réfrigérateur R2 (2–8 °C)', statut: 'disponible' },
  { id: 'l12', productId: 'p8', numero: '3346211', datePeremption: '2026-10-05', dateReception: '2025-10-30', dateOuverture: '2026-03-02', quantiteInitiale: 5, quantite: 2, emplacement: 'Congélateur C1 (≤ -20 °C)', statut: 'entame' },
  { id: 'l13', productId: 'p8', numero: '3359874', datePeremption: '2027-09-30', dateReception: '2026-10-02', dateOuverture: null, quantiteInitiale: 5, quantite: 5, emplacement: 'Congélateur C1 (≤ -20 °C)', statut: 'disponible' },
  { id: 'l14', productId: 'p9', numero: 'TP2511', datePeremption: '2027-02-26', dateReception: '2026-07-07', dateOuverture: '2026-10-22', quantiteInitiale: 2, quantite: 2, emplacement: 'Réfrigérateur R1 (2–8 °C)', statut: 'entame' },
  { id: 'l15', productId: 'p10', numero: 'E1000-2604', datePeremption: '2029-04-30', dateReception: '2026-06-01', dateOuverture: '2026-06-03', quantiteInitiale: 20, quantite: 11, emplacement: 'Réserve consommables', statut: 'entame' },
  { id: 'l16', productId: 'p4', numero: 'CR24088', datePeremption: '2026-06-30', dateReception: '2025-12-10', dateOuverture: '2026-02-01', quantiteInitiale: 3, quantite: 0, emplacement: 'Réfrigérateur R1 (2–8 °C)', statut: 'epuise' },
]
