'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { DigitalProductStatus, DigitalProductType } from '@/types'

interface ProductInput {
  title: string
  description?: string
  type: DigitalProductType
  status: DigitalProductStatus
  price: number
  gumroad_url?: string
  sales_count?: number
  revenue_total?: number
}

export async function createDigitalProduct(input: ProductInput) {
  const supabase = await createClient()

  const { error } = await supabase.from('digital_products').insert({
    title: input.title,
    description: input.description || null,
    type: input.type,
    status: input.status,
    price: input.price,
    gumroad_url: input.gumroad_url || null,
    sales_count: input.sales_count ?? 0,
    revenue_total: input.revenue_total ?? 0,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/productos')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateDigitalProduct(id: string, input: ProductInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('digital_products')
    .update({
      title: input.title,
      description: input.description || null,
      type: input.type,
      status: input.status,
      price: input.price,
      gumroad_url: input.gumroad_url || null,
      sales_count: input.sales_count ?? 0,
      revenue_total: input.revenue_total ?? 0,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/productos')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteDigitalProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('digital_products').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/productos')
  revalidatePath('/dashboard')
  return { success: true }
}
