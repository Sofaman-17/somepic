import { Suspense } from "react"
import { ShoppingBag } from "lucide-react"
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { ProductCard } from '@/components/productos/product-card'
import { AddProductButton } from '@/components/productos/add-product-button'
import { FilterBar } from '@/components/ui/filter-bar'
import { formatCurrency } from '@/lib/utils'
import type { DigitalProduct } from '@/types'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase.from('digital_products').select('*').order('created_at', { ascending: false })

  if (params.status && params.status !== 'todos') query = query.eq('status', params.status)
  if (params.type && params.type !== 'todos') query = query.eq('type', params.type)

  const { data: products } = await query
  let allProducts = (products ?? []) as DigitalProduct[]

  if (params.q) {
    const q = params.q.toLowerCase()
    allProducts = allProducts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  }

  const { data: allRaw } = await supabase.from('digital_products').select('id, status, price, revenue_total, sales_count')
  const totals = allRaw ?? []
  const published = totals.filter((p) => p.status === 'publicado')
  const totalRevenue = totals.reduce((acc, p) => acc + (p.revenue_total ?? 0), 0)
  const totalSales = totals.reduce((acc, p) => acc + (p.sales_count ?? 0), 0)
  const avgPrice = published.length > 0 ? published.reduce((acc, p) => acc + p.price, 0) / published.length : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos digitales"
        description="eBooks, plantillas y cursos · Gumroad"
        action={<AddProductButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total productos" value={totals.length} icon={ShoppingBag} />
        <StatCard title="Publicados" value={published.length} icon={ShoppingBag} />
        <StatCard title="Ingresos totales" value={formatCurrency(totalRevenue)} description={`${totalSales} ventas`} icon={ShoppingBag} />
        <StatCard title="Precio medio" value={formatCurrency(avgPrice)} icon={ShoppingBag} />
      </div>

      <Suspense>
        <FilterBar
          searchPlaceholder="Buscar por título o descripción…"
          filters={[
            {
              key: 'status',
              placeholder: 'Todos los estados',
              options: [
                { value: 'borrador', label: 'Borrador' },
                { value: 'publicado', label: 'Publicado' },
                { value: 'archivado', label: 'Archivado' },
              ],
            },
            {
              key: 'type',
              placeholder: 'Todos los tipos',
              options: [
                { value: 'ebook', label: '📖 eBook' },
                { value: 'plantilla', label: '📋 Plantilla' },
                { value: 'curso', label: '🎓 Curso' },
                { value: 'pack', label: '📦 Pack' },
                { value: 'otro', label: '💾 Otro' },
              ],
            },
          ]}
        />
      </Suspense>

      {allProducts.length === 0 ? (
        <div className="py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            {params.q || params.status || params.type
              ? 'No hay productos que coincidan con los filtros.'
              : 'No hay productos aún.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  )
}
