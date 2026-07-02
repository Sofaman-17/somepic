import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ContentPiece } from '@/types'

interface ContentPipelineProps {
  pieces: ContentPiece[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'outline' }> = {
  idea: { label: 'Idea', variant: 'outline' },
  en_produccion: { label: 'En producción', variant: 'warning' },
  grabado: { label: 'Grabado', variant: 'info' },
  editado: { label: 'Editado', variant: 'secondary' },
  publicado: { label: 'Publicado', variant: 'success' },
  archivado: { label: 'Archivado', variant: 'outline' },
}

const platformEmoji: Record<string, string> = {
  tiktok: '🎵',
  instagram: '📸',
  youtube: '▶️',
  todos: '🌐',
}

export function ContentPipeline({ pieces }: ContentPipelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline de contenido</CardTitle>
      </CardHeader>
      <CardContent>
        {pieces.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay contenido en producción.
          </p>
        ) : (
          <div className="space-y-3">
            {pieces.map((piece) => {
              const status = statusConfig[piece.status]
              return (
                <div key={piece.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-lg">{platformEmoji[piece.platform]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{piece.title}</p>
                    {piece.hook && (
                      <p className="text-xs text-muted-foreground truncate">{piece.hook}</p>
                    )}
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
