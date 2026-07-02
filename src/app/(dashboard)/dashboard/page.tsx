import { BookOpen, ShoppingBag, TrendingUp, Euro, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/stat-card'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { ContentPipeline } from '@/components/dashboard/content-pipeline'
import { QuickAIWidget } from '@/components/dashboard/quick-ai-widget'
import { RevenueAreaChart } from '@/components/charts/revenue-area-chart'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { buildDailyRevenueData } from '@/lib/chart-utils'
import { formatCurrency } from '@/lib/utils'
import type { Sale, ContentPiece } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: sales },
    { data: books },
    { data: digitalProducts },
    { data: contentPieces },
  ] = await Promise.all([
    supabase.from('sales').select('*').order('sold_at', { ascending: false }).limit(100),
    supabase.from('books').select('id, status'),
    supabase.from('digital_products').select('id, status, revenue_total'),
    supabase.from('content_pieces').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const allSales = (sales ?? []) as Sale[]
  const completedSales = allSales.filter((s) => s.status === 'completada')
  const totalRevenue = completedSales.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0)
  const booksAvailable = (books ?? []).filter((b) => b.status === 'disponible').length
  const digitalPublished = (digitalProducts ?? []).filter((p) => p.status === 'publicado').length
  const digitalRevenue = (digitalProducts ?? []).reduce((acc, p) => acc + (p.revenue_total ?? 0), 0)
  const contentInProduction = (contentPieces ?? []).filter(
    (c) => !['publicado', 'archivado'].includes(c.status)
  ).length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const salesThisMonth = completedSales.filter((s) => new Date(s.sold_at) >= startOfMonth)
  const revenueThisMonth = salesThisMonth.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0)

  // Datos para el gráfico (calculados en servidor)
  const dailyData = buildDailyRevenueData(allSales, 30)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visión general del negocio"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/analytics">Ver analytics completo →</Link>
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Ingresos totales netos" value={formatCurrency(totalRevenue)} description="Todos los canales · Neto" icon={Euro} />
        <StatCard title="Ingresos este mes" value={formatCurrency(revenueThisMonth)} description={`${salesThisMonth.length} ventas`} icon={Calendar} />
        <StatCard title="Ventas totales" value={completedSales.length} description="Ventas completadas" icon={TrendingUp} />
        <StatCard title="Libros disponibles" value={booksAvailable} description="En Vinted / Wallapop" icon={BookOpen} />
        <StatCard title="Productos digitales" value={digitalPublished} description={`${formatCurrency(digitalRevenue)} generado`} icon={ShoppingBag} />
        <StatCard title="Contenido en pipeline" value={contentInProduction} description="Ideas + producción + grabado" icon={FileText} />
      </div>

      {/* Gráfico de ingresos diarios */}
      <RevenueAreaChart data={dailyData} />

      {/* Widgets de detalle */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4">
          <RecentSales sales={allSales.slice(0, 6) as Sale[]} />
          <ContentPipeline pieces={(contentPieces ?? []) as ContentPiece[]} />
        </div>
        <QuickAIWidget />
      </div>
    </div>
  )
}
