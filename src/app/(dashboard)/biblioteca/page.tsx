import { Suspense } from "react"
import { BookOpen } from "lucide-react"
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { BookRow } from '@/components/biblioteca/book-row'
import { AddBookButton } from '@/components/biblioteca/add-book-button'
import { StatCard } from '@/components/dashboard/stat-card'
import { FilterBar } from '@/components/ui/filter-bar'
import { formatCurrency } from '@/lib/utils'
import type { Book } from '@/types'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; platform?: string; condition?: string }>
}

export default async function BibliotecaPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  // Construye la query con los filtros activos
  let query = supabase.from('books').select('*').order('created_at', { ascending: false })

  if (params.status && params.status !== 'todos') {
    query = query.eq('status', params.status)
  }
  if (params.platform && params.platform !== 'todos') {
    query = query.eq('platform', params.platform)
  }
  if (params.condition && params.condition !== 'todos') {
    query = query.eq('condition', params.condition)
  }

  const { data: books } = await query

  // Filtro de texto en memoria (Supabase ilike para búsqueda parcial)
  let allBooks = (books ?? []) as Book[]
  if (params.q) {
    const q = params.q.toLowerCase()
    allBooks = allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q)
    )
  }

  // Stats siempre sobre todos los libros (sin filtros)
  const { data: allBooksRaw } = await supabase.from('books').select('id, status, purchase_price, sale_price')
  const total = allBooksRaw ?? []
  const disponibles = total.filter((b) => b.status === 'disponible')
  const vendidos = total.filter((b) => b.status === 'vendido')
  const totalInvertido = total.reduce((acc, b) => acc + (b.purchase_price ?? 0), 0)
  const potencialVenta = disponibles.reduce((acc, b) => acc + (b.sale_price ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca"
        description="Gestión de libros físicos · Vinted y Wallapop"
        action={<AddBookButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total libros" value={total.length} icon={BookOpen} />
        <StatCard title="Disponibles" value={disponibles.length} description={`${formatCurrency(potencialVenta)} potencial`} icon={BookOpen} />
        <StatCard title="Vendidos" value={vendidos.length} icon={BookOpen} />
        <StatCard title="Capital invertido" value={formatCurrency(totalInvertido)} icon={BookOpen} />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">
            Libros {allBooks.length !== total.length && `(${allBooks.length} de ${total.length})`}
            {allBooks.length === total.length && `(${total.length})`}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Buscar por título, autor o ISBN…"
              filters={[
                {
                  key: 'status',
                  placeholder: 'Todos los estados',
                  options: [
                    { value: 'disponible', label: 'Disponible' },
                    { value: 'reservado', label: 'Reservado' },
                    { value: 'vendido', label: 'Vendido' },
                    { value: 'archivado', label: 'Archivado' },
                  ],
                },
                {
                  key: 'platform',
                  placeholder: 'Todas las plataformas',
                  options: [
                    { value: 'vinted', label: 'Vinted' },
                    { value: 'wallapop', label: 'Wallapop' },
                    { value: 'otro', label: 'Otro' },
                  ],
                },
                {
                  key: 'condition',
                  placeholder: 'Cualquier condición',
                  options: [
                    { value: 'nuevo', label: 'Nuevo' },
                    { value: 'muy_bueno', label: 'Muy bueno' },
                    { value: 'bueno', label: 'Bueno' },
                    { value: 'aceptable', label: 'Aceptable' },
                  ],
                },
              ]}
            />
          </Suspense>
        </CardHeader>
        <CardContent>
          {allBooks.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {params.q || params.status || params.platform || params.condition
                  ? 'No hay libros que coincidan con los filtros.'
                  : 'No hay libros aún. Añade tu primer libro.'}
              </p>
            </div>
          ) : (
            <div>{allBooks.map((book) => <BookRow key={book.id} book={book} />)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
