import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { RevenueAreaChart } from '@/components/charts/revenue-area-chart'
import { ChannelBarChart } from '@/components/charts/channel-bar-chart'
import { ProductTypePieChart } from '@/components/charts/product-type-pie-chart'
import { MonthlyLineChart } from '@/components/charts/monthly-line-chart'
import { ContentPipelineChart } from '@/components/charts/content-pipeline-chart'
import { StatCard } from '@/components/dashboard/stat-card'
import {
  buildDailyRevenueData,
  buildChannelData,
  buildProductTypeData,
  buildMonthlyData,
  buildContentPipelineData,
} from '@/lib/chart-utils'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'
import type { Sale, ContentPiece } from '@/types'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [{ data: sales }, { data: contentPieces }] = await Promise.all([
    supabase.from('sales').select('*').order('sold_at', { ascending: false }),
    supabase.from('content_pieces').select('*'),
  ])

  const allSales = (sales ?? []) as Sale[]
  const allPieces = (contentPieces ?? []) as ContentPiece[]

  // Prepara todos los datos en el servidor
  const dailyData = buildDailyRevenueData(allSales, 30)
  const channelData = buildChannelData(allSales)
  const typeData = buildProductTypeData(allSales)
  const monthlyData = buildMonthlyData(allSales)
  const pipelineData = buildContentPipelineData(allPieces)

  // Métricas de comparación mes actual vs mes anterior
  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const completed = allSales.filter((s) => s.status === 'completada')
  const thisMonthSales = completed.filter((s) => new Date(s.sold_at) >= startThisMonth)
  const lastMonthSales = completed.filter(
    (s) => new Date(s.sold_at) >= startLastMonth && new Date(s.sold_at) <= endLastMonth
  )

  const thisMonthRev = thisMonthSales.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0)
  const lastMonthRev = lastMonthSales.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0)
  const revChange = lastMonthRev > 0
    ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100
    : null

  const totalNetRevenue = completed.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0)
  const avgOrderValue = completed.length > 0 ? totalNetRevenue / completed.length : 0

  // Mejor canal
  const bestChannel = channelData[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Métricas y tendencias del negocio"
      />

      {/* KPIs de comparación mensual */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Este mes"
          value={formatCurrency(thisMonthRev)}
          description={
            revChange !== null
              ? `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs mes anterior`
              : 'Primer mes con datos'
          }
          icon={revChange === null ? Minus : revChange >= 0 ? TrendingUp : TrendingDown}
        />
        <StatCard
          title="Mes anterior"
          value={formatCurrency(lastMonthRev)}
          description={`${lastMonthSales.length} ventas`}
          icon={BarChart2}
        />
        <StatCard
          title="Ticket medio"
          value={formatCurrency(avgOrderValue)}
          description={`Sobre ${completed.length} ventas`}
          icon={BarChart2}
        />
        <StatCard
          title="Mejor canal"
          value={bestChannel?.canal ?? '—'}
          description={bestChannel ? formatCurrency(bestChannel.ingresos) : 'Sin ventas aún'}
          icon={TrendingUp}
        />
      </div>

      {/* Gráfico principal — ingresos diarios */}
      <RevenueAreaChart data={dailyData} />

      {/* Fila de gráficos secundarios */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChannelBarChart data={channelData} />
        <ProductTypePieChart data={typeData} total={totalNetRevenue} />
      </div>

      {/* Evolución mensual */}
      <MonthlyLineChart data={monthlyData} />

      {/* Pipeline de contenido */}
      <ContentPipelineChart data={pipelineData} />
    </div>
  )
}
