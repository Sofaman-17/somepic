import { createBrowserClient } from '@supabase/ssr'

// Este cliente se usa en Client Components ('use client')
// Nunca expone la service_role key — solo usa la anon key pública
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
