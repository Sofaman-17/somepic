'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ContentFormModal } from '@/components/contenido/content-form-modal'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { deleteContentPiece } from '@/lib/actions/content'
import { formatDate } from '@/lib/utils'
import type { ContentPiece } from '@/types'

interface ContentCardProps {
  piece: ContentPiece
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'outline' }> = {
  idea: { label: 'Idea', variant: 'outline' },
  en_produccion: { label: 'En producción', variant: 'warning' },
  grabado: { label: 'Grabado', variant: 'info' },
  editado: { label: 'Editado', variant: 'secondary' },
  publicado: { label: 'Publicado', variant: 'success' },
  archivado: { label: 'Archivado', variant: 'outline' },
}

const platformConfig: Record<string, { label: string; emoji: string }> = {
  tiktok: { label: 'TikTok', emoji: '🎵' },
  instagram: { label: 'Instagram', emoji: '📸' },
  youtube: { label: 'YouTube', emoji: '▶️' },
  todos: { label: 'Multi-plataforma', emoji: '🌐' },
}

export function ContentCard({ piece }: ContentCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const status = statusConfig[piece.status]
  const platform = platformConfig[piece.platform]

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-lg">{platform.emoji}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold leading-snug">{piece.title}</p>
            {piece.hook && (
              <p className="mt-1 text-xs text-muted-foreground italic line-clamp-2">
                Hook: "{piece.hook}"
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Badge variant={status.variant}>{status.label}</Badge>
            <div className="flex items-center gap-2">
              {piece.ai_generated && (
                <span className="text-[10px] bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 font-medium">
                  ✨ AI
                </span>
              )}
              <span className="text-xs text-muted-foreground">{formatDate(piece.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ContentFormModal open={editOpen} onClose={() => setEditOpen(false)} piece={piece} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteContentPiece(piece.id)}
        title={`¿Eliminar "${piece.title}"?`}
        description="Se eliminará esta pieza de contenido permanentemente."
      />
    </>
  )
}
