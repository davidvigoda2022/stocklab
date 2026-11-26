import type { Metadata } from 'next'
import { connection } from 'next/server'
import { AppSidebar } from '@/components/stocklab/app-sidebar'
import { LotsView } from '@/components/stocklab/lots-view'

export const metadata: Metadata = {
  title: 'Lots & péremptions — StockLab',
  description: 'Suivi des lots de réactifs, des dates de péremption et de la consommation FEFO.',
}

export default async function LotsPage() {
  await connection()
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="flex min-h-svh">
      <AppSidebar active="lots" />
      <LotsView today={today} />
    </div>
  )
}
