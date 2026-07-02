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
import { createDigitalProduct, updateDigitalProduct } from '@/lib/actions/products'
import type { DigitalProduct } from '@/types'

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  product?: DigitalProduct | null
}

export function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const isEditing = !!product

  const [form, setForm] = useState({
    title: product?.title ?? '',
    description: product?.description ?? '',
    type: (product?.type ?? 'ebook') as DigitalProduct['type'],
    status: (product?.status ?? 'borrador') as DigitalProduct['status'],
    price: product?.price?.toString() ?? '',
    gumroad_url: product?.gumroad_url ?? '',
    sales_count: product?.sales_count?.toString() ?? '0',
    revenue_total: product?.revenue_total?.toString() ?? '0',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function resetForm() {
    setForm({
      title: product?.title ?? '',
      description: product?.description ?? '',
      type: product?.type ?? 'ebook',
      status: product?.status ?? 'borrador',
      price: product?.price?.toString() ?? '',
      gumroad_url: product?.gumroad_url ?? '',
      sales_count: product?.sales_count?.toString() ?? '0',
      revenue_total: product?.revenue_total?.toString() ?? '0',
    })
    setError(null)
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError('El título es obligatorio.'); return }
    if (!form.price || isNaN(parseFloat(form.price))) { setError('El precio debe ser un número válido.'); return }

    setLoading(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      status: form.status,
      price: parseFloat(form.price),
      gumroad_url: form.gumroad_url.trim() || undefined,
      sales_count: parseInt(form.sales_count) || 0,
      revenue_total: parseFloat(form.revenue_total) || 0,
    }

    const result = isEditing
      ? await updateDigitalProduct(product!.id, payload)
      : await createDigitalProduct(payload)

    setLoading(false)
    if (result.error) { setError(result.error); return }
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
          <DialogTitle>{isEditing ? 'Editar producto' : 'Nuevo producto digital'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {error && (
            <p className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="p-title">Título <span className="text-destructive">*</span></Label>
            <Input id="p-title" placeholder="Plantilla Notion para creadores" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Descripción</Label>
            <Textarea id="p-desc" placeholder="Describe el producto..." rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v as DigitalProduct['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ebook">📖 eBook</SelectItem>
                  <SelectItem value="plantilla">📋 Plantilla</SelectItem>
                  <SelectItem value="curso">🎓 Curso</SelectItem>
                  <SelectItem value="pack">📦 Pack</SelectItem>
                  <SelectItem value="otro">💾 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v as DigitalProduct['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Precio (€) <span className="text-destructive">*</span></Label>
              <Input id="p-price" type="number" min="0" step="0.01" placeholder="9.99" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-sales">Nº ventas</Label>
              <Input id="p-sales" type="number" min="0" placeholder="0" value={form.sales_count} onChange={(e) => set('sales_count', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-revenue">Ingresos (€)</Label>
              <Input id="p-revenue" type="number" min="0" step="0.01" placeholder="0.00" value={form.revenue_total} onChange={(e) => set('revenue_total', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-gumroad">URL Gumroad</Label>
            <Input id="p-gumroad" type="url" placeholder="https://gumroad.com/l/..." value={form.gumroad_url} onChange={(e) => set('gumroad_url', e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? 'Guardando…' : 'Creando…'}</> : isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
