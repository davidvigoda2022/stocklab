import { AppSidebar } from '@/components/stocklab/app-sidebar'
import { CatalogueView } from '@/components/stocklab/catalogue-view'

export default function Page() {
  return (
    <div className="flex min-h-svh">
      <AppSidebar active="catalogue" />
      <CatalogueView />
    </div>
  )
}
