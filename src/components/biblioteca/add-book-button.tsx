'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookFormModal } from '@/components/biblioteca/book-form-modal'

// Client Component pequeño que solo maneja el estado del modal.
// La página de biblioteca sigue siendo Server Component.
export function AddBookButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Añadir libro
      </Button>
      <BookFormModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
