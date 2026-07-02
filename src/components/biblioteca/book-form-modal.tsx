'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createBook, updateBook } from '@/lib/actions/books'
import type { Book } from '@/types'

interface BookFormModalProps {
  open: boolean
  onClose: () => void
  book?: Book | null  // Si viene con libro → modo edición; si no → creación
}

// Estado inicial vacío para creación
const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  condition: 'bueno' as Book['condition'],
  status: 'disponible' as Book['status'],
  purchase_price: '',
  sale_price: '',
  platform: 'vinted' as Book['platform'],
  listing_url: '',
  notes: '',
}

export function BookFormModal({ open, onClose, book }: BookFormModalProps) {
  const isEditing = !!book

  // Si estamos editando, pre-rellena el formulario con los datos del libro
  const [form, setForm] = useState({
    title: book?.title ?? '',
    author: book?.author ?? '',
    isbn: book?.isbn ?? '',
    condition: (book?.condition ?? 'bueno') as Book['condition'],
    status: (book?.status ?? 'disponible') as Book['status'],
    purchase_price: book?.purchase_price?.toString() ?? '',
    sale_price: book?.sale_price?.toString() ?? '',
    platform: (book?.platform ?? 'vinted') as Book['platform'],
    listing_url: book?.listing_url ?? '',
    notes: book?.notes ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Actualiza el formulario cuando cambia el libro (para re-edición)
  const resetForm = () => {
    setForm(
      book
        ? {
            title: book.title,
            author: book.author ?? '',
            isbn: book.isbn ?? '',
            condition: book.condition,
            status: book.status,
            purchase_price: book.purchase_price?.toString() ?? '',
            sale_price: book.sale_price?.toString() ?? '',
            platform: book.platform,
            listing_url: book.listing_url ?? '',
            notes: book.notes ?? '',
          }
        : emptyForm
    )
    setError(null)
  }

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      setError('El título es obligatorio.')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      author: form.author.trim() || undefined,
      isbn: form.isbn.trim() || undefined,
      condition: form.condition,
      status: form.status,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      platform: form.platform,
      listing_url: form.listing_url.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }

    const result = isEditing
      ? await updateBook(book!.id, payload)
      : await createBook(payload)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    resetForm()
    onClose()
  }

  function handleClose() {
    if (loading) return
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar libro' : 'Añadir libro'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {error && (
            <p className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="El nombre del viento"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Autor + ISBN en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                placeholder="Patrick Rothfuss"
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                placeholder="978-..."
                value={form.isbn}
                onChange={(e) => set('isbn', e.target.value)}
              />
            </div>
          </div>

          {/* Estado + Condición en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v as Book['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="reservado">Reservado</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                  <SelectItem value="archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Condición</Label>
              <Select value={form.condition} onValueChange={(v) => set('condition', v as Book['condition'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="muy_bueno">Muy bueno</SelectItem>
                  <SelectItem value="bueno">Bueno</SelectItem>
                  <SelectItem value="aceptable">Aceptable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Precios en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="purchase_price">Precio compra (€)</Label>
              <Input
                id="purchase_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="2.00"
                value={form.purchase_price}
                onChange={(e) => set('purchase_price', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sale_price">Precio venta (€)</Label>
              <Input
                id="sale_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="8.00"
                value={form.sale_price}
                onChange={(e) => set('sale_price', e.target.value)}
              />
            </div>
          </div>

          {/* Plataforma */}
          <div className="space-y-1.5">
            <Label>Plataforma</Label>
            <Select value={form.platform} onValueChange={(v) => set('platform', v as Book['platform'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vinted">Vinted</SelectItem>
                <SelectItem value="wallapop">Wallapop</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* URL del anuncio */}
          <div className="space-y-1.5">
            <Label htmlFor="listing_url">URL del anuncio</Label>
            <Input
              id="listing_url"
              type="url"
              placeholder="https://vinted.es/items/..."
              value={form.listing_url}
              onChange={(e) => set('listing_url', e.target.value)}
            />
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Detalles adicionales..."
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? 'Guardando…' : 'Añadiendo…'}</>
            ) : (
              isEditing ? 'Guardar cambios' : 'Añadir libro'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
