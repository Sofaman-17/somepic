'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ContentStatus, ContentPlatform } from '@/types'

interface ContentInput {
  title: string
  script?: string
  hook?: string
  platform: ContentPlatform
  status: ContentStatus
  ai_generated: boolean
  publish_date?: string | null
  video_url?: string
  linked_product_id?: string | null
  notes?: string
}

export async function createContentPiece(input: ContentInput) {
  const supabase = await createClient()

  const { error } = await supabase.from('content_pieces').insert({
    title: input.title,
    script: input.script || null,
    hook: input.hook || null,
    platform: input.platform,
    status: input.status,
    ai_generated: input.ai_generated,
    publish_date: input.publish_date || null,
    video_url: input.video_url || null,
    linked_product_id: input.linked_product_id || null,
    notes: input.notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contenido')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateContentPiece(id: string, input: ContentInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('content_pieces')
    .update({
      title: input.title,
      script: input.script || null,
      hook: input.hook || null,
      platform: input.platform,
      status: input.status,
      ai_generated: input.ai_generated,
      publish_date: input.publish_date || null,
      video_url: input.video_url || null,
      linked_product_id: input.linked_product_id || null,
      notes: input.notes || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contenido')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteContentPiece(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('content_pieces').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contenido')
  revalidatePath('/dashboard')
  return { success: true }
}
