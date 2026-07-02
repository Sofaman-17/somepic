'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SaleFormModal } from '@/components/ventas/sale-form-modal'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { deleteSale } from '@/lib/actions/sales'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Sale } from '@/types'

interface SaleRowProps {
  sale: Sale
}

const channelConfig: Record<string, { label: string; emoji: string }> = {
  vinted: { label: 'Vinted', emoji: '👗' },
  gumroad: { label: 'Gumroad', emoji: '💻' },
  wallapop: { label: 'Wallapop', emoji: '📦' },
  directo: { label: 'Directo', emoji: '🤝' },
  otro: { label: 'Otro', emoji: '💰' },
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'outline' }> = {
  completada: { label: 'Completada', variant: 'success' },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  reembolsada: { label: 'Reembolsada', variant: 'destructive' },
  cancelada: { label: 'Cancelada', variant: 'outline' },
}

export function SaleRow({ sale }: SaleRowProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const channel = channelConfig[sale.channel]
  const status = statusConfig[sale.status]

  return (
    <>
      <tr className="border-b hover:bg-muted/30 transition-colors group">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span>{channel.emoji}</span>
            <span className="text-sm font-medium">{channel.label}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="text-sm">{sale.buyer_name ?? '—'}</span>
        </td>
        <td className="py-3 px-4">
          <Badge variant={sale.product_type === 'book' ? 'secondary' : 'info'} className="text-[10px]">
            {sale.product_type === 'book' ? '📚 Libro' : '💾 Digital'}
          </Badge>
        </td>
        <td className="py-3 px-4 text-right">
          <span className="text-sm">{formatCurrency(sale.amount)}</span>
        </td>
        <td className="py-3 px-4 text-right">
          <span className="text-xs text-muted-foreground">{formatCurrency(sale.fees ?? 0)}</span>
        </td>
        <td className="py-3 px-4 text-right">
          <span className="text-sm font-semibold text-green-600">
            {formatCurrency(sale.net_amount ?? sale.amount)}
          </span>
        </td>
        <td className="py-3 px-4">
          <Badge variant={status.variant}>{status.label}</Badge>
        </td>
        <td className="py-3 px-4 text-right">
          <span className="text-xs text-muted-foreground">{formatDate(sale.sold_at)}</span>
        </td>
        <td className="py-3 px-4">
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
        </td>
      </tr>

      <SaleFormModal open={editOpen} onClose={() => setEditOpen(false)} sale={sale} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteSale(sale.id)}
        title="¿Eliminar esta venta?"
        description="Se eliminará el registro de venta permanentemente."
      />
    </>
  )
}
