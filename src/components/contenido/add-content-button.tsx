'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContentFormModal } from '@/components/contenido/content-form-modal'

export function AddContentButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva idea
      </Button>
      <ContentFormModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
