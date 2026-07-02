'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile, updatePassword } from '@/lib/actions/profile'
import type { Profile } from '@/types'

interface SettingsFormProps {
  profile: Profile
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [name, setName] = useState(profile.full_name ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passSuccess, setPassSuccess] = useState(false)
  const [passError, setPassError] = useState<string | null>(null)

  async function handleUpdateName() {
    setNameLoading(true)
    setNameError(null)
    setNameSuccess(false)
    const result = await updateProfile({ full_name: name.trim() })
    setNameLoading(false)
    if (result.error) { setNameError(result.error); return }
    setNameSuccess(true)
    setTimeout(() => setNameSuccess(false), 3000)
  }

  async function handleUpdatePassword() {
    if (password.length < 6) { setPassError('Mínimo 6 caracteres.'); return }
    if (password !== passwordConfirm) { setPassError('Las contraseñas no coinciden.'); return }
    setPassLoading(true)
    setPassError(null)
    setPassSuccess(false)
    const result = await updatePassword({ password })
    setPassLoading(false)
    if (result.error) { setPassError(result.error); return }
    setPassSuccess(true)
    setPassword('')
    setPasswordConfirm('')
    setTimeout(() => setPassSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
          <CardDescription>Tu nombre e información de cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Rol</Label>
            <Input id="role" value={profile.role} disabled className="bg-muted capitalize" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {nameError && <p className="text-xs text-destructive">{nameError}</p>}

          <Button onClick={handleUpdateName} disabled={nameLoading || !name.trim()} size="sm">
            {nameLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando…</>
            ) : nameSuccess ? (
              <><Check className="mr-2 h-4 w-4 text-green-500" />Guardado</>
            ) : (
              'Guardar nombre'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contraseña</CardTitle>
          <CardDescription>Cambia tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-pass">Nueva contraseña</Label>
            <Input
              id="new-pass"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pass">Confirmar contraseña</Label>
            <Input
              id="confirm-pass"
              type="password"
              placeholder="Repite la contraseña"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          {passError && <p className="text-xs text-destructive">{passError}</p>}

          <Button
            onClick={handleUpdatePassword}
            disabled={passLoading || !password || !passwordConfirm}
            size="sm"
            variant="outline"
          >
            {passLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cambiando…</>
            ) : passSuccess ? (
              <><Check className="mr-2 h-4 w-4 text-green-500" />Contraseña actualizada</>
            ) : (
              'Cambiar contraseña'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info del sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sistema</CardTitle>
          <CardDescription>Información de la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              ['Versión', 'v1.0 · MVP'],
              ['Stack', 'Next.js 14 · Supabase · TypeScript'],
              ['IA', 'Claude Sonnet 4.6 (Anthropic)'],
              ['UI', 'shadcn/ui · TailwindCSS · Recharts'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-xs">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
