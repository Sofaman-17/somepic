import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Este cliente se usa en Server Components, Server Actions y Route Handlers
// Lee las cookies de la request para mantener la sesión del usuario
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll puede lanzar en Server Components de solo lectura.
            // Se puede ignorar si hay middleware que refresca la sesión.
          }
        },
      },
    }
  )
}
