'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SaleFormModal } from '@/components/ventas/sale-form-modal'

export function AddSaleButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Registrar venta
      </Button>
      <SaleFormModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
