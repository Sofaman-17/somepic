'use client'

import { useState } from 'react'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductFormModal } from '@/components/productos/product-form-modal'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { deleteDigitalProduct } from '@/lib/actions/products'
import { formatCurrency } from '@/lib/utils'
import type { DigitalProduct } from '@/types'

interface ProductCardProps {
  product: DigitalProduct
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'outline' | 'secondary' }> = {
  borrador: { label: 'Borrador', variant: 'outline' },
  publicado: { label: 'Publicado', variant: 'success' },
  archivado: { label: 'Archivado', variant: 'secondary' },
}

const typeEmoji: Record<string, string> = {
  ebook: '📖', plantilla: '📋', curso: '🎓', pack: '📦', otro: '💾',
}

export function ProductCard({ product }: ProductCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const status = statusConfig[product.status]

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-2xl">{typeEmoji[product.type]}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm leading-snug">{product.title}</p>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {product.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t">
            <div className="text-center">
              <p className="text-sm font-bold">{formatCurrency(product.price)}</p>
              <p className="text-[10px] text-muted-foreground">Precio</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">{product.sales_count}</p>
              <p className="text-[10px] text-muted-foreground">Ventas</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-green-600">{formatCurrency(product.revenue_total)}</p>
              <p className="text-[10px] text-muted-foreground">Ingresos</p>
            </div>
          </div>

          {product.gumroad_url && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={product.gumroad_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />Ver en Gumroad
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <ProductFormModal open={editOpen} onClose={() => setEditOpen(false)} product={product} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteDigitalProduct(product.id)}
        title={`¿Eliminar "${product.title}"?`}
        description="Se eliminará el producto. Las ventas asociadas quedarán sin referencia."
      />
    </>
  )
}
