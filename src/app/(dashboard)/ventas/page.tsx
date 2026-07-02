import { Suspense } from "react"
import { TrendingUp } from "lucide-react"
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { SaleRow } from '@/components/ventas/sale-row'
import { AddSaleButton } from '@/components/ventas/add-sale-button'
import { FilterBar } from '@/components/ui/filter-bar'
import { formatCurrency } from '@/lib/utils'
import type { Sale } from '@/types'

interface PageProps {
  searchParams: Promise<{ q?: string; channel?: string; status?: string; product_type?: string }>
}

export default async function VentasPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase.from('sales').select('*').order('sold_at', { ascending: false })

  if (params.channel && params.channel !== 'todos') query = query.eq('channel', params.channel)
  if (params.status && params.status !== 'todos') query = query.eq('status', params.status)
  if (params.product_type && params.product_type !== 'todos') query = query.eq('product_type', params.product_type)

  const { data: sales } = await query
  let allSales = (sales ?? []) as Sale[]

  if (params.q) {
    const q = params.q.toLowerCase()
    allSales = allSales.filter((s) => s.buyer_name?.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q))
  }

  // Stats siempre sobre todas las ventas
  const { data: allRaw } = await supabase.from('sales').select('*')
  const all = (allRaw ?? []) as Sale[]
  const completed = all.filter((s) => s.status === 'completada')
  const totalRevenue = completed.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0)
  const totalFees = completed.reduce((acc, s) => acc + (s.fees ?? 0), 0)
  const bookSales = completed.filter((s) => s.product_type === 'book')
  const digitalSales = completed.filter((s) => s.product_type === 'digital')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth = completed.filter((s) => new Date(s.sold_at) >= startOfMonth)
  const revenueThisMonth = thisMonth.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0)

  const revenueByChannel = completed.reduce<Record<string, number>>((acc, s) => {
    acc[s.channel] = (acc[s.channel] ?? 0) + (s.net_amount ?? s.amount)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas"
        description="Todos los canales · Vinted, Gumroad, Wallapop"
        action={<AddSaleButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ingresos netos totales" value={formatCurrency(totalRevenue)} description={`${formatCurrency(totalFees)} en comisiones`} icon={TrendingUp} />
        <StatCard title="Este mes" value={formatCurrency(revenueThisMonth)} description={`${thisMonth.length} ventas`} icon={TrendingUp} />
        <StatCard title="Libros" value={bookSales.length} description={formatCurrency(bookSales.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0))} icon={TrendingUp} />
        <StatCard title="Digitales" value={digitalSales.length} description={formatCurrency(digitalSales.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0))} icon={TrendingUp} />
      </div>

      {Object.keys(revenueByChannel).length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(revenueByChannel).sort((a, b) => b[1] - a[1]).map(([channel, revenue]) => (
            <Card key={channel}>
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{channel}</span>
                <span className="text-sm font-bold text-green-600">{formatCurrency(revenue)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">
            Historial {allSales.length !== all.length ? `(${allSales.length} de ${all.length})` : `(${all.length})`}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Buscar por comprador o notas…"
              filters={[
                {
                  key: 'channel',
                  placeholder: 'Todos los canales',
                  options: [
                    { value: 'vinted', label: '👗 Vinted' },
                    { value: 'gumroad', label: '💻 Gumroad' },
                    { value: 'wallapop', label: '📦 Wallapop' },
                    { value: 'directo', label: '🤝 Directo' },
                    { value: 'otro', label: '💰 Otro' },
                  ],
                },
                {
                  key: 'status',
                  placeholder: 'Todos los estados',
                  options: [
                    { value: 'completada', label: 'Completada' },
                    { value: 'pendiente', label: 'Pendiente' },
                    { value: 'reembolsada', label: 'Reembolsada' },
                    { value: 'cancelada', label: 'Cancelada' },
                  ],
                },
                {
                  key: 'product_type',
                  placeholder: 'Tipo de producto',
                  options: [
                    { value: 'book', label: '📚 Libros' },
                    { value: 'digital', label: '💾 Digitales' },
                  ],
                },
              ]}
            />
          </Suspense>
        </CardHeader>
        <CardContent className="p-0">
          {allSales.length === 0 ? (
            <div className="py-16 text-center">
              <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {params.q || params.channel || params.status || params.product_type
                  ? 'No hay ventas que coincidan con los filtros.'
                  : 'No hay ventas registradas.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Canal</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Comprador</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Tipo</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground">Bruto</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground">Comisión</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground">Neto</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Estado</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground">Fecha</th>
                    <th className="py-3 px-4 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {allSales.map((sale) => <SaleRow key={sale.id} sale={sale} />)}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
