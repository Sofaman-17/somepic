import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import type { Profile } from '@/types'

// Mapa de rutas → títulos para el Header
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/biblioteca': 'Biblioteca',
  '/dashboard/contenido': 'Contenido',
  '/dashboard/productos': 'Productos',
  '/dashboard/ventas': 'Ventas',
  '/dashboard/settings': 'Ajustes',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verifica sesión en el servidor — no confía en el cliente
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtiene el perfil con el rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="OS Interno" profile={profile as Profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
