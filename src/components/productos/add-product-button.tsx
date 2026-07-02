'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductFormModal } from '@/components/productos/product-form-modal'

export function AddProductButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo producto
      </Button>
      <ProductFormModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
