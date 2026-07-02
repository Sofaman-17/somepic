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
import { createSale, updateSale } from '@/lib/actions/sales'
import type { Sale } from '@/types'

interface SaleFormModalProps {
  open: boolean
  onClose: () => void
  sale?: Sale | null
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function SaleFormModal({ open, onClose, sale }: SaleFormModalProps) {
  const isEditing = !!sale

  const [form, setForm] = useState({
    channel: (sale?.channel ?? 'vinted') as Sale['channel'],
    status: (sale?.status ?? 'completada') as Sale['status'],
    amount: sale?.amount?.toString() ?? '',
    fees: sale?.fees?.toString() ?? '',
    product_type: (sale?.product_type ?? 'book') as Sale['product_type'],
    buyer_name: sale?.buyer_name ?? '',
    notes: sale?.notes ?? '',
    sold_at: sale?.sold_at ? sale.sold_at.split('T')[0] : todayISO(),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function resetForm() {
    setForm({
      channel: sale?.channel ?? 'vinted',
      status: sale?.status ?? 'completada',
      amount: sale?.amount?.toString() ?? '',
      fees: sale?.fees?.toString() ?? '',
      product_type: sale?.product_type ?? 'book',
      buyer_name: sale?.buyer_name ?? '',
      notes: sale?.notes ?? '',
      sold_at: sale?.sold_at ? sale.sold_at.split('T')[0] : todayISO(),
    })
    setError(null)
  }

  async function handleSubmit() {
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      setError('El importe debe ser un número válido.')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      channel: form.channel,
      status: form.status,
      amount: parseFloat(form.amount),
      fees: form.fees ? parseFloat(form.fees) : null,
      product_type: form.product_type,
      buyer_name: form.buyer_name.trim() || undefined,
      notes: form.notes.trim() || undefined,
      sold_at: new Date(form.sold_at).toISOString(),
    }

    const result = isEditing
      ? await updateSale(sale!.id, payload)
      : await createSale(payload)

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

  // Comisión estimada según canal (orientativa)
  const estimatedFee = form.amount
    ? {
        vinted: (parseFloat(form.amount) * 0.05).toFixed(2),
        gumroad: (parseFloat(form.amount) * 0.10).toFixed(2),
        wallapop: '0.00',
        directo: '0.00',
        otro: '0.00',
      }[form.channel]
    : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar venta' : 'Registrar venta'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {error && (
            <p className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Canal</Label>
              <Select value={form.channel} onValueChange={(v) => set('channel', v as Sale['channel'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vinted">👗 Vinted</SelectItem>
                  <SelectItem value="gumroad">💻 Gumroad</SelectItem>
                  <SelectItem value="wallapop">📦 Wallapop</SelectItem>
                  <SelectItem value="directo">🤝 Directo</SelectItem>
                  <SelectItem value="otro">💰 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v as Sale['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="reembolsada">Reembolsada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-amount">Importe bruto (€) <span className="text-destructive">*</span></Label>
              <Input
                id="s-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="8.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-fees">
                Comisión (€)
                {estimatedFee && parseFloat(estimatedFee) > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">≈{estimatedFee}</span>
                )}
              </Label>
              <Input
                id="s-fees"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.80"
                value={form.fees}
                onChange={(e) => set('fees', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo de producto</Label>
              <Select value={form.product_type} onValueChange={(v) => set('product_type', v as Sale['product_type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">📚 Libro físico</SelectItem>
                  <SelectItem value="digital">💾 Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-date">Fecha de venta</Label>
              <Input
                id="s-date"
                type="date"
                value={form.sold_at}
                onChange={(e) => set('sold_at', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-buyer">Nombre del comprador</Label>
            <Input
              id="s-buyer"
              placeholder="María G."
              value={form.buyer_name}
              onChange={(e) => set('buyer_name', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-notes">Notas</Label>
            <Textarea
              id="s-notes"
              placeholder="Detalles del envío, observaciones..."
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {/* Resumen neto en tiempo real */}
          {form.amount && !isNaN(parseFloat(form.amount)) && (
            <div className="rounded-md bg-muted px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Neto estimado:</span>
              <span className="text-sm font-bold text-green-600">
                €{(parseFloat(form.amount) - (parseFloat(form.fees) || 0)).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? 'Guardando…' : 'Registrando…'}</>
              : isEditing ? 'Guardar cambios' : 'Registrar venta'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
