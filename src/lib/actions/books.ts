'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { BookCondition, BookStatus } from '@/types'

// ─── TIPOS DE ENTRADA ────────────────────────────────────────────────────────

interface BookInput {
  title: string
  author?: string
  isbn?: string
  condition: BookCondition
  status: BookStatus
  purchase_price?: number | null
  sale_price?: number | null
  platform: 'vinted' | 'wallapop' | 'otro'
  listing_url?: string
  notes?: string
}

// ─── CREAR ───────────────────────────────────────────────────────────────────

export async function createBook(input: BookInput) {
  const supabase = await createClient()

  const { error } = await supabase.from('books').insert({
    title: input.title,
    author: input.author || null,
    isbn: input.isbn || null,
    condition: input.condition,
    status: input.status,
    purchase_price: input.purchase_price ?? null,
    sale_price: input.sale_price ?? null,
    platform: input.platform,
    listing_url: input.listing_url || null,
    notes: input.notes || null,
  })

  if (error) return { error: error.message }

  // Invalida el caché de la página para que Next.js refetch los datos
  revalidatePath('/dashboard/biblioteca')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── ACTUALIZAR ──────────────────────────────────────────────────────────────

export async function updateBook(id: string, input: BookInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('books')
    .update({
      title: input.title,
      author: input.author || null,
      isbn: input.isbn || null,
      condition: input.condition,
      status: input.status,
      purchase_price: input.purchase_price ?? null,
      sale_price: input.sale_price ?? null,
      platform: input.platform,
      listing_url: input.listing_url || null,
      notes: input.notes || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/biblioteca')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── ELIMINAR ─────────────────────────────────────────────────────────────────

export async function deleteBook(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('books').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/biblioteca')
  revalidatePath('/dashboard')
  return { success: true }
}
