'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, FileText, ShoppingBag,
  TrendingUp, Settings, Zap, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/analytics', icon: BarChart2, description: 'Gráficos · Tendencias' },
  { label: 'Biblioteca', href: '/biblioteca', icon: BookOpen, description: 'Libros físicos · Vinted' },
  { label: 'Contenido', href: '/contenido', icon: FileText, description: 'TikTok · Reels · Shorts' },
  { label: 'Productos', href: '/productos', icon: ShoppingBag, description: 'Digitales · Gumroad' },
  { label: 'Ventas', href: '/ventas', icon: TrendingUp, description: 'Todos los canales' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">OS interno</p>
          <p className="text-xs text-muted-foreground">v1.0 · MVP</p>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                {item.description && (
                  <span className={cn('text-[10px] leading-none', isActive ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {item.description}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="p-4">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
            pathname === '/settings' && 'bg-accent text-accent-foreground'
          )}
        >
          <Settings className="h-4 w-4" />
          <span className="font-medium">Ajustes</span>
        </Link>
      </div>
    </aside>
  )
}
