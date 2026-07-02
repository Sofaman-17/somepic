'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SaleChannel, SaleStatus } from '@/types'

interface SaleInput {
  channel: SaleChannel
  status: SaleStatus
  amount: number
  fees?: number | null
  product_type: 'book' | 'digital'
  book_id?: string | null
  digital_product_id?: string | null
  buyer_name?: string
  notes?: string
  sold_at: string
}

export async function createSale(input: SaleInput) {
  const supabase = await createClient()

  const { error } = await supabase.from('sales').insert({
    channel: input.channel,
    status: input.status,
    amount: input.amount,
    fees: input.fees ?? null,
    product_type: input.product_type,
    book_id: input.book_id || null,
    digital_product_id: input.digital_product_id || null,
    buyer_name: input.buyer_name || null,
    notes: input.notes || null,
    sold_at: input.sold_at,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/ventas')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateSale(id: string, input: SaleInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sales')
    .update({
      channel: input.channel,
      status: input.status,
      amount: input.amount,
      fees: input.fees ?? null,
      product_type: input.product_type,
      book_id: input.book_id || null,
      digital_product_id: input.digital_product_id || null,
      buyer_name: input.buyer_name || null,
      notes: input.notes || null,
      sold_at: input.sold_at,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/ventas')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteSale(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('sales').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/ventas')
  revalidatePath('/dashboard')
  return { success: true }
}
