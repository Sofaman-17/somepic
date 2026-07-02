'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentFormModal } from '@/components/contenido/content-form-modal'

// Widget del dashboard que abre directamente el modal de generación de contenido
// con la pestaña de IA activa. Acceso en un clic desde el dashboard principal.
export function QuickAIWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-purple-800">
            <Sparkles className="h-4 w-4" />
            Generador de contenido IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Genera scripts para TikTok, Reels y Shorts con IA. Hook, script completo y CTA adaptados a tu nicho.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {['🎵 TikTok', '📸 Reels', '▶️ Shorts'].map((platform) => (
              <div key={platform} className="rounded-md bg-purple-100/60 px-2 py-1.5 text-[10px] font-medium text-purple-700">
                {platform}
              </div>
            ))}
          </div>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Generar ahora
          </Button>
        </CardContent>
      </Card>

      <ContentFormModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
