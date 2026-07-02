'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface RevenueAreaChartProps {
  data: { date: string; ingresos: number; ventas: number }[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-primary">
        Ingresos: <span className="font-bold">€{payload[0]?.value?.toFixed(2)}</span>
      </p>
      <p className="text-muted-foreground">
        Ventas: <span className="font-bold">{payload[1]?.value}</span>
      </p>
    </div>
  )
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  // Muestra solo cada 5 días en el eje X para no saturar
  const tickIndices = new Set(
    data.map((_, i) => i).filter((i) => i % 5 === 0 || i === data.length - 1)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ingresos diarios</CardTitle>
        <CardDescription>Últimos 30 días · Neto de comisiones</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val, i) => (tickIndices.has(i) ? val : '')}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradientIngresos)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="ventas"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              fill="none"
              dot={false}
              strokeDasharray="4 2"
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground justify-end">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-indigo-500 rounded" />
            Ingresos (€)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-purple-500 rounded" style={{ borderTop: '1px dashed' }} />
            Nº ventas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
