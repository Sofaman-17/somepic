import { Suspense } from "react"
import { FileText } from "lucide-react"
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { ContentCard } from '@/components/contenido/content-card'
import { AddContentButton } from '@/components/contenido/add-content-button'
import { FilterBar } from '@/components/ui/filter-bar'
import type { ContentPiece } from '@/types'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; platform?: string; ai?: string }>
}

export default async function ContenidoPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase.from('content_pieces').select('*').order('created_at', { ascending: false })

  if (params.status && params.status !== 'todos') query = query.eq('status', params.status)
  if (params.platform && params.platform !== 'todos') query = query.eq('platform', params.platform)
  if (params.ai === 'si') query = query.eq('ai_generated', true)
  if (params.ai === 'no') query = query.eq('ai_generated', false)

  const { data: pieces } = await query
  let allPieces = (pieces ?? []) as ContentPiece[]

  if (params.q) {
    const q = params.q.toLowerCase()
    allPieces = allPieces.filter(
      (p) => p.title.toLowerCase().includes(q) || p.hook?.toLowerCase().includes(q)
    )
  }

  const { data: allRaw } = await supabase.from('content_pieces').select('id, status, ai_generated')
  const totals = allRaw ?? []

  const byStatus = {
    ideas: totals.filter((p) => p.status === 'idea').length,
    publicados: totals.filter((p) => p.status === 'publicado').length,
    aiGenerated: totals.filter((p) => p.ai_generated).length,
  }

  const pipelineGroups = [
    { key: 'idea', label: 'Ideas' },
    { key: 'en_produccion', label: 'En producción' },
    { key: 'grabado', label: 'Grabado' },
    { key: 'editado', label: 'Editado' },
    { key: 'publicado', label: 'Publicado' },
  ]

  const isFiltered = !!(params.q || params.status || params.platform || params.ai)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contenido"
        description="Pipeline AI · TikTok, Instagram Reels, YouTube Shorts"
        action={<AddContentButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total piezas" value={totals.length} icon={FileText} />
        <StatCard title="Ideas" value={byStatus.ideas} icon={FileText} />
        <StatCard title="Publicadas" value={byStatus.publicados} icon={FileText} />
        <StatCard title="Generadas con IA" value={byStatus.aiGenerated} description={`${Math.round((byStatus.aiGenerated / Math.max(totals.length, 1)) * 100)}%`} icon={FileText} />
      </div>

      <Suspense>
        <FilterBar
          searchPlaceholder="Buscar por título o hook…"
          filters={[
            {
              key: 'status',
              placeholder: 'Todos los estados',
              options: [
                { value: 'idea', label: 'Idea' },
                { value: 'en_produccion', label: 'En producción' },
                { value: 'grabado', label: 'Grabado' },
                { value: 'editado', label: 'Editado' },
                { value: 'publicado', label: 'Publicado' },
                { value: 'archivado', label: 'Archivado' },
              ],
            },
            {
              key: 'platform',
              placeholder: 'Todas las plataformas',
              options: [
                { value: 'tiktok', label: '🎵 TikTok' },
                { value: 'instagram', label: '📸 Instagram' },
                { value: 'youtube', label: '▶️ YouTube' },
                { value: 'todos', label: '🌐 Todos' },
              ],
            },
            {
              key: 'ai',
              placeholder: 'Origen',
              options: [
                { value: 'si', label: '✨ Solo IA' },
                { value: 'no', label: '✍️ Solo manual' },
              ],
            },
          ]}
        />
      </Suspense>

      <div className="space-y-8">
        {isFiltered ? (
          // Vista plana cuando hay filtros activos
          allPieces.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No hay contenido que coincida con los filtros.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allPieces.map((piece) => <ContentCard key={piece.id} piece={piece} />)}
            </div>
          )
        ) : (
          // Vista agrupada por pipeline cuando no hay filtros
          pipelineGroups.map((group) => {
            const groupPieces = allPieces.filter((p) => p.status === group.key)
            if (groupPieces.length === 0) return null
            return (
              <div key={group.key}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  {group.label} · {groupPieces.length}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groupPieces.map((piece) => <ContentCard key={piece.id} piece={piece} />)}
                </div>
              </div>
            )
          })
        )}

        {!isFiltered && allPieces.length === 0 && (
          <div className="py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No hay contenido aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}
