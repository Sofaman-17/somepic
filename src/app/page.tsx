// La raíz redirige al middleware que decidirá:
// - Si hay sesión → /dashboard
// - Si no hay sesión → /login
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
