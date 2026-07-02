import type { Sale, ContentPiece } from '@/types'

// ─── INGRESOS POR DÍA (últimos N días) ───────────────────────────────────────
export function buildDailyRevenueData(sales: Sale[], days = 30) {
  const result: { date: string; ingresos: number; ventas: number }[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]

    const daySales = sales.filter(
      (s) => s.status === 'completada' && s.sold_at.startsWith(key)
    )

    result.push({
      date: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      ingresos: parseFloat(
        daySales.reduce((acc, s) => acc + (s.net_amount ?? s.amount), 0).toFixed(2)
      ),
      ventas: daySales.length,
    })
  }

  return result
}

// ─── INGRESOS POR CANAL ────────────────────────────────────────────────────
export function buildChannelData(sales: Sale[]) {
  const map: Record<string, number> = {}

  sales
    .filter((s) => s.status === 'completada')
    .forEach((s) => {
      const ch = s.channel
      map[ch] = (map[ch] ?? 0) + (s.net_amount ?? s.amount)
    })

  return Object.entries(map)
    .map(([canal, ingresos]) => ({
      canal: canal.charAt(0).toUpperCase() + canal.slice(1),
      ingresos: parseFloat(ingresos.toFixed(2)),
    }))
    .sort((a, b) => b.ingresos - a.ingresos)
}

// ─── DISTRIBUCIÓN LIBROS VS DIGITALES ─────────────────────────────────────
export function buildProductTypeData(sales: Sale[]) {
  let books = 0
  let digital = 0

  sales
    .filter((s) => s.status === 'completada')
    .forEach((s) => {
      if (s.product_type === 'book') books += s.net_amount ?? s.amount
      else digital += s.net_amount ?? s.amount
    })

  return [
    { name: 'Libros físicos', value: parseFloat(books.toFixed(2)), color: '#6366f1' },
    { name: 'Digitales', value: parseFloat(digital.toFixed(2)), color: '#8b5cf6' },
  ].filter((d) => d.value > 0)
}

// ─── EVOLUCIÓN MENSUAL ────────────────────────────────────────────────────
export function buildMonthlyData(sales: Sale[]) {
  const map: Record<string, { ingresos: number; ventas: number }> = {}

  sales
    .filter((s) => s.status === 'completada')
    .forEach((s) => {
      const d = new Date(s.sold_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map[key]) map[key] = { ingresos: 0, ventas: 0 }
      map[key].ingresos += s.net_amount ?? s.amount
      map[key].ventas += 1
    })

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // últimos 12 meses
    .map(([key, val]) => {
      const [year, month] = key.split('-')
      return {
        mes: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', {
          month: 'short',
          year: '2-digit',
        }),
        ingresos: parseFloat(val.ingresos.toFixed(2)),
        ventas: val.ventas,
      }
    })
}

// ─── PIPELINE DE CONTENIDO ────────────────────────────────────────────────
export function buildContentPipelineData(pieces: ContentPiece[]) {
  const estados = ['idea', 'en_produccion', 'grabado', 'editado', 'publicado']
  const labels: Record<string, string> = {
    idea: 'Idea',
    en_produccion: 'Producción',
    grabado: 'Grabado',
    editado: 'Editado',
    publicado: 'Publicado',
  }

  return estados.map((status) => ({
    estado: labels[status],
    total: pieces.filter((p) => p.status === status).length,
    ai: pieces.filter((p) => p.status === status && p.ai_generated).length,
    manual: pieces.filter((p) => p.status === status && !p.ai_generated).length,
  }))
}
