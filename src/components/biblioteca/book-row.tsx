'use client'

import { useState } from 'react'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookFormModal } from '@/components/biblioteca/book-form-modal'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { deleteBook } from '@/lib/actions/books'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Book } from '@/types'

interface BookRowProps {
  book: Book
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'secondary' | 'warning' | 'outline' }> = {
  disponible: { label: 'Disponible', variant: 'success' },
  vendido: { label: 'Vendido', variant: 'secondary' },
  reservado: { label: 'Reservado', variant: 'warning' },
  archivado: { label: 'Archivado', variant: 'outline' },
}

const conditionLabels: Record<string, string> = {
  nuevo: 'Nuevo',
  muy_bueno: 'Muy bueno',
  bueno: 'Bueno',
  aceptable: 'Aceptable',
}

export function BookRow({ book }: BookRowProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const status = statusConfig[book.status]
  const margin =
    book.purchase_price && book.sale_price
      ? book.sale_price - book.purchase_price
      : null

  return (
    <>
      <div className="flex items-center gap-4 py-3 border-b last:border-0 group">
        <div className="h-12 w-9 shrink-0 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
          📚
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{book.title}</p>
          <p className="text-xs text-muted-foreground">
            {book.author ?? 'Autor desconocido'} · {conditionLabels[book.condition]}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(book.created_at)}</p>
        </div>

        <div className="text-right hidden sm:block">
          {book.sale_price && (
            <p className="text-sm font-semibold">{formatCurrency(book.sale_price)}</p>
          )}
          {margin !== null && (
            <p className="text-xs text-green-600">+{formatCurrency(margin)} margen</p>
          )}
        </div>

        <Badge variant={status.variant}>{status.label}</Badge>

        {/* Acciones — visibles al hacer hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {book.listing_url && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={book.listing_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Modal de edición */}
      <BookFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        book={book}
      />

      {/* Diálogo de confirmación de borrado */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteBook(book.id)}
        title={`¿Eliminar "${book.title}"?`}
        description="Se eliminará el libro y no podrás recuperarlo. Las ventas asociadas quedarán sin referencia."
      />
    </>
  )
}
