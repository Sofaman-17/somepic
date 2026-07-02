import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

// Este Route Handler actúa como proxy seguro entre el cliente y la API de Anthropic.
// La API key nunca sale del servidor. El cliente solo ve el stream de texto.

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  // Verifica sesión — solo usuarios autenticados pueden usar la IA
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  const body = await request.json()
  const { topic, platform, tone, format, linked_product, extra_context } = body

  if (!topic?.trim()) {
    return new Response('El tema es obligatorio', { status: 400 })
  }

  // Construye el prompt según la plataforma y el formato solicitado
  const platformInstructions: Record<string, string> = {
    tiktok: 'TikTok (vídeo vertical, 30-60 segundos, ritmo rápido, lenguaje muy directo y coloquial)',
    instagram: 'Instagram Reels (vídeo vertical, 15-30 segundos, estética cuidada, CTA claro)',
    youtube: 'YouTube Shorts (vídeo vertical, hasta 60 segundos, más educativo, posibilidad de intro)',
    todos: 'múltiples plataformas (TikTok, Instagram Reels y YouTube Shorts simultáneamente)',
  }

  const toneInstructions: Record<string, string> = {
    educativo: 'educativo y valioso, como un experto que enseña algo útil',
    entretenido: 'entretenido y con humor, ligero y fácil de consumir',
    viral: 'diseñado para viralidad: controversial, sorprendente o que genere debate',
    personal: 'personal y auténtico, como si compartieras tu experiencia real',
    directo: 'directo y sin rodeos, ve al grano desde el primer segundo',
  }

  const productContext = linked_product
    ? `\n\nProducto digital al que apunta este contenido: "${linked_product}". Incluye un CTA natural al final que lleve a ese producto sin ser demasiado agresivo en la venta.`
    : ''

  const extraContext = extra_context?.trim()
    ? `\n\nContexto adicional del creador: ${extra_context}`
    : ''

  const systemPrompt = `Eres un experto en creación de contenido viral para redes sociales, especializado en el nicho de libros, conocimiento y productos digitales.

Tu tarea es generar scripts de vídeo corto altamente optimizados para creadores de contenido que venden libros físicos (en Vinted) y productos digitales (en Gumroad).

IMPORTANTE:
- Siempre empieza con un hook DEMOLEDOR en la primera línea (las primeras palabras son lo que decide si el usuario sigue viendo)
- Usa frases cortas y directas
- Estructura: Hook → Problema/Curiosidad → Solución/Valor → CTA
- El script debe poder leerse en voz alta cómodamente en el tiempo indicado
- Responde SIEMPRE en español
- NO uses asteriscos ni markdown en el script, es texto directo que se va a leer en cámara`

  const userPrompt = `Genera contenido para ${platformInstructions[platform] ?? platformInstructions.tiktok}.

Tema: ${topic}
Tono: ${toneInstructions[tone] ?? toneInstructions.directo}
Formato solicitado: ${format === 'completo' ? 'hook + script completo' : format === 'hook' ? 'solo el hook (3-5 opciones)' : 'hook + puntos clave del script'}${productContext}${extraContext}

Estructura tu respuesta así:

HOOK:
[El hook de apertura — debe ser la primera frase del vídeo, máximo 2 líneas]

SCRIPT:
[El script completo listo para grabar, con indicaciones de pausa si son necesarias]

CTA:
[La llamada a la acción final, natural y no agresiva]

NOTAS:
[2-3 sugerencias breves sobre cómo grabar este vídeo: ángulo, energía, edición]`

  // Crea un ReadableStream que envía los chunks de texto según llegan de Anthropic
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        const anthropicStream = await anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        })

        // Envía cada chunk de texto al cliente en tiempo real
        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }

        controller.close()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error generando contenido'
        controller.enqueue(encoder.encode(`\n\nError: ${message}`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
