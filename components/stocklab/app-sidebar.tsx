import {
  ArrowLeftRight,
  BookOpenText,
  Boxes,
  CalendarClock,
  FileBarChart,
  FlaskConical,
  LayoutDashboard,
  Settings,
  Truck,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type SidebarPage = 'catalogue' | 'lots'

const NAV = [
  {
    label: 'Pilotage',
    items: [{ label: 'Tableau de bord', icon: LayoutDashboard }],
  },
  {
    label: 'Stock',
    items: [
      { label: 'Inventaire', icon: Boxes },
      { label: 'Lots & péremptions', icon: CalendarClock, href: '/lots', page: 'lots' },
      { label: 'Mouvements', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Référentiel',
    items: [
      { label: 'Catalogue', icon: BookOpenText, href: '/', page: 'catalogue' },
      { label: 'Fournisseurs', icon: Truck },
    ],
  },
  {
    label: 'Analyse',
    items: [{ label: 'Rapports', icon: FileBarChart }],
  },
]

export function AppSidebar({ active: activePage = 'catalogue' }: { active?: SidebarPage }) {
  return (
    <aside className="sticky top-0 flex h-svh w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <FlaskConical className="size-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-white">StockLab</p>
          <p className="text-xs text-sidebar-foreground/70">Laboratoire central</p>
        </div>
      </div>

      <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.label} className="mt-4 first:mt-1">
            <p className="px-3 pb-1.5 text-[11px] font-medium tracking-wider text-sidebar-foreground/50 uppercase">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = 'page' in item && item.page === activePage
                const href = ('href' in item && item.href) || '#'
                return (
                  <li key={item.label}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-white',
                        active && 'bg-sidebar-accent font-medium text-white',
                      )}
                    >
                      <Icon
                        className={cn('size-4', active ? 'text-sidebar-primary' : 'opacity-80')}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <a
          href="#"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-white"
        >
          <Settings className="size-4 opacity-80" aria-hidden="true" />
          Paramètres
        </a>
        <div className="mt-2 flex items-center gap-3 px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-white">
            SB
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm text-white">Dr S. Benali</p>
            <p className="truncate text-xs text-sidebar-foreground/70">Biologiste responsable</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
