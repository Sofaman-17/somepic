'use client'

import { useState, useRef } from 'react'
import { Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface AIGeneratorPanelProps {
  platform: string
  // Callback para insertar el resultado en el formulario principal
  onApply: (hook: string, script: string) => void
}

type GenerationState = 'idle' | 'generating' | 'done' | 'error'

// Extrae secciones del texto generado usando regex simple
function extractSection(text: string, section: 'HOOK' | 'SCRIPT' | 'CTA' | 'NOTAS'): string {
  const regex = new RegExp(`${section}:\\n([\\s\\S]*?)(?=\\n[A-Z]+:|$)`)
  const match = text.match(regex)
  return match?.[1]?.trim() ?? ''
}

export function AIGeneratorPanel({ platform, onApply }: AIGeneratorPanelProps) {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('directo')
  const [format, setFormat] = useState('completo')
  const [extraContext, setExtraContext] = useState('')
  const [linkedProduct, setLinkedProduct] = useState('')

  const [state, setState] = useState<GenerationState>('idle')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  async function handleGenerate() {
    if (!topic.trim()) return

    // Cancela cualquier generación en curso
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setState('generating')
    setOutput('')
    setError(null)

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          platform,
          tone,
          format,
          linked_product: linkedProduct.trim() || null,
          extra_context: extraContext.trim() || null,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`)
      }

      // Lee el stream de texto chunk a chunk
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No se pudo leer el stream')

      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setOutput(accumulated)

        // Auto-scroll al final mientras se genera
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight
        }
      }

      setState('done')
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setState('idle')
        return
      }
      setError((err as Error).message)
      setState('error')
    }
  }

  function handleStop() {
    abortRef.current?.abort()
    setState('done')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleApply() {
    const hook = extractSection(output, 'HOOK')
    const script = extractSection(output, 'SCRIPT')
    const cta = extractSection(output, 'CTA')

    // Combina script + CTA en el campo script
    const fullScript = [script, cta ? `\nCTA:\n${cta}` : ''].filter(Boolean).join('')

    onApply(hook, fullScript)
  }

  const isGenerating = state === 'generating'
  const hasDone = state === 'done' && output

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center gap-2 text-purple-700">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-semibold">Generador de contenido con IA</span>
      </div>

      {/* Formulario de configuración */}
      <div className="grid gap-3 rounded-lg border border-purple-100 bg-purple-50/50 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="ai-topic" className="text-xs font-medium">
            Tema del vídeo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ai-topic"
            placeholder="5 libros que cambiarán tu mentalidad financiera"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tono</Label>
            <Select value={tone} onValueChange={setTone} disabled={isGenerating}>
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="directo">⚡ Directo</SelectItem>
                <SelectItem value="educativo">📚 Educativo</SelectItem>
                <SelectItem value="entretenido">😄 Entretenido</SelectItem>
                <SelectItem value="viral">🔥 Viral</SelectItem>
                <SelectItem value="personal">💬 Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Formato</Label>
            <Select value={format} onValueChange={setFormat} disabled={isGenerating}>
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="completo">Script completo</SelectItem>
                <SelectItem value="hook">Solo hooks</SelectItem>
                <SelectItem value="esquema">Esquema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Producto vinculado</Label>
            <Input
              placeholder="Nombre del producto"
              value={linkedProduct}
              onChange={(e) => setLinkedProduct(e.target.value)}
              disabled={isGenerating}
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ai-extra" className="text-xs font-medium">
            Contexto adicional <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="ai-extra"
            placeholder="Ej: mi audiencia son jóvenes de 20-30 años interesados en finanzas personales"
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
            disabled={isGenerating}
            className="text-xs"
          />
        </div>

        <Button
          onClick={isGenerating ? handleStop : handleGenerate}
          disabled={!topic.trim() && !isGenerating}
          size="sm"
          className={cn(
            'w-full',
            isGenerating
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          )}
        >
          {isGenerating ? (
            <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Generando… (clic para parar)</>
          ) : (
            <><Sparkles className="mr-2 h-3.5 w-3.5" />Generar con IA</>
          )}
        </Button>
      </div>

      {/* Output del stream */}
      {(output || isGenerating) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Resultado generado
            </Label>
            {hasDone && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => { setOutput(''); setState('idle') }}
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleCopy}
                >
                  {copied
                    ? <><Check className="h-3 w-3 text-green-600" />Copiado</>
                    : <><Copy className="h-3 w-3" />Copiar</>
                  }
                </Button>
              </div>
            )}
          </div>

          {/* Área de texto con el stream */}
          <div
            ref={outputRef}
            className={cn(
              'min-h-[200px] max-h-[300px] overflow-y-auto rounded-lg border bg-background p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap',
              isGenerating && 'border-purple-200 bg-purple-50/30'
            )}
          >
            {output}
            {isGenerating && (
              <span className="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse align-middle" />
            )}
          </div>

          {/* Botón para aplicar al formulario */}
          {hasDone && (
            <Button
              onClick={handleApply}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Check className="mr-2 h-3.5 w-3.5" />
              Usar este contenido en el formulario
            </Button>
          )}
        </div>
      )}

      {/* Error */}
      {state === 'error' && error && (
        <p className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
