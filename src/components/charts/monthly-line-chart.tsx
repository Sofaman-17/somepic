'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface MonthlyLineChartProps {
  data: { mes: string; ingresos: number; ventas: number }[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold capitalize">{label}</p>
      <p className="text-indigo-600">Ingresos: <span className="font-bold">€{payload[0]?.value?.toFixed(2)}</span></p>
      <p className="text-muted-foreground">Ventas: <span className="font-bold">{payload[1]?.value}</span></p>
    </div>
  )
}

export function MonthlyLineChart({ data }: MonthlyLineChartProps) {
  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolución mensual</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
          Necesitas al menos 2 meses de datos para ver la evolución
        </CardContent>
      </Card>
    )
  }

  // Línea de referencia: promedio de ingresos
  const avg = data.reduce((acc, d) => acc + d.ingresos, 0) / data.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolución mensual</CardTitle>
        <CardDescription>Últimos 12 meses · Ingresos netos y nº de ventas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avg}
              stroke="#e2e8f0"
              strokeDasharray="4 2"
              label={{ value: `Avg €${avg.toFixed(0)}`, position: 'right', fontSize: 9, fill: '#94a3b8' }}
            />
            <Line
              type="monotone"
              dataKey="ingresos"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="ventas"
              stroke="#a78bfa"
              strokeWidth={1.5}
              dot={{ fill: '#a78bfa', r: 2, strokeWidth: 0 }}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground justify-end">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-indigo-500 rounded" />
            Ingresos (€)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-purple-400 rounded" />
            Nº ventas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
