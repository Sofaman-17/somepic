'use client'

import { useState } from 'react'
import { Loader2, Sparkles, PenLine } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { AIGeneratorPanel } from '@/components/contenido/ai-generator-panel'
import { createContentPiece, updateContentPiece } from '@/lib/actions/content'
import type { ContentPiece } from '@/types'

interface ContentFormModalProps {
  open: boolean
  onClose: () => void
  piece?: ContentPiece | null
}

export function ContentFormModal({ open, onClose, piece }: ContentFormModalProps) {
  const isEditing = !!piece

  const [form, setForm] = useState({
    title: piece?.title ?? '',
    hook: piece?.hook ?? '',
    script: piece?.script ?? '',
    platform: (piece?.platform ?? 'tiktok') as ContentPiece['platform'],
    status: (piece?.status ?? 'idea') as ContentPiece['status'],
    ai_generated: piece?.ai_generated ?? false,
    publish_date: piece?.publish_date ?? '',
    notes: piece?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function resetForm() {
    setForm({
      title: piece?.title ?? '',
      hook: piece?.hook ?? '',
      script: piece?.script ?? '',
      platform: piece?.platform ?? 'tiktok',
      status: piece?.status ?? 'idea',
      ai_generated: piece?.ai_generated ?? false,
      publish_date: piece?.publish_date ?? '',
      notes: piece?.notes ?? '',
    })
    setError(null)
  }

  // Recibe el resultado del generador de IA y lo aplica al formulario
  function handleAIApply(hook: string, script: string) {
    setForm((prev) => ({
      ...prev,
      hook: hook || prev.hook,
      script: script || prev.script,
      ai_generated: true,
    }))
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError('El título es obligatorio.'); return }

    setLoading(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      hook: form.hook.trim() || undefined,
      script: form.script.trim() || undefined,
      platform: form.platform,
      status: form.status,
      ai_generated: form.ai_generated,
      publish_date: form.publish_date || null,
      notes: form.notes.trim() || undefined,
    }

    const result = isEditing
      ? await updateContentPiece(piece!.id, payload)
      : await createContentPiece(payload)

    setLoading(false)
    if (result.error) { setError(result.error); return }
    resetForm()
    onClose()
  }

  function handleClose() {
    if (loading) return
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? 'Editar contenido' : 'Nueva pieza de contenido'}
            {form.ai_generated && (
              <span className="text-[10px] bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 font-medium">
                ✨ AI
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={isEditing ? 'manual' : 'ai'}>
          <TabsList className="w-full">
            <TabsTrigger value="ai" className="flex-1 gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Generar con IA
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1 gap-2">
              <PenLine className="h-3.5 w-3.5" />
              Editar manualmente
            </TabsTrigger>
          </TabsList>

          {/* ── PESTAÑA: GENERADOR IA ─────────────────────────────── */}
          <TabsContent value="ai" className="mt-4">
            <AIGeneratorPanel
              platform={form.platform}
              onApply={handleAIApply}
            />

            {/* Indicador de que se aplicó al formulario */}
            {form.ai_generated && (form.hook || form.script) && (
              <div className="mt-3 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700">
                ✓ Contenido aplicado al formulario. Ve a "Editar manualmente" para revisar y ajustar.
              </div>
            )}
          </TabsContent>

          {/* ── PESTAÑA: EDICIÓN MANUAL ───────────────────────────── */}
          <TabsContent value="manual" className="mt-4">
            <div className="grid gap-4">
              {error && (
                <p className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              {/* Título */}
              <div className="space-y-1.5">
                <Label htmlFor="c-title">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="c-title"
                  placeholder="5 libros que cambiarán tu forma de pensar"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              {/* Hook */}
              <div className="space-y-1.5">
                <Label htmlFor="hook">
                  Hook de apertura
                  <span className="ml-1 text-xs text-muted-foreground">
                    (primera frase del vídeo)
                  </span>
                </Label>
                <Input
                  id="hook"
                  placeholder="Estos libros me arruinaron la vida... para bien"
                  value={form.hook}
                  onChange={(e) => set('hook', e.target.value)}
                />
              </div>

              {/* Plataforma + Estado */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Plataforma</Label>
                  <Select value={form.platform} onValueChange={(v) => set('platform', v as ContentPiece['platform'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                      <SelectItem value="instagram">📸 Instagram</SelectItem>
                      <SelectItem value="youtube">▶️ YouTube</SelectItem>
                      <SelectItem value="todos">🌐 Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v as ContentPiece['status'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="en_produccion">En producción</SelectItem>
                      <SelectItem value="grabado">Grabado</SelectItem>
                      <SelectItem value="editado">Editado</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                      <SelectItem value="archivado">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Script */}
              <div className="space-y-1.5">
                <Label htmlFor="script">
                  Script completo
                  {form.ai_generated && form.script && (
                    <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
                      ✨ Generado con IA
                    </span>
                  )}
                </Label>
                <Textarea
                  id="script"
                  placeholder="Escribe o pega el script aquí..."
                  rows={8}
                  value={form.script}
                  onChange={(e) => set('script', e.target.value)}
                  className="font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Fecha + IA toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="publish_date">Fecha de publicación</Label>
                  <Input
                    id="publish_date"
                    type="date"
                    value={form.publish_date}
                    onChange={(e) => set('publish_date', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Generado con IA</Label>
                  <Select
                    value={form.ai_generated ? 'si' : 'no'}
                    onValueChange={(v) => set('ai_generated', v === 'si')}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">✨ Sí, con IA</SelectItem>
                      <SelectItem value="no">✍️ Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-1.5">
                <Label htmlFor="c-notes">Notas internas</Label>
                <Textarea
                  id="c-notes"
                  placeholder="Referencias, ideas de edición..."
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !form.title.trim()}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? 'Guardando…' : 'Creando…'}</>
            ) : (
              isEditing ? 'Guardar cambios' : 'Crear pieza'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
