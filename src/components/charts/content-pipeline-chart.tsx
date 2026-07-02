'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ContentPipelineChartProps {
  data: { estado: string; total: number; ai: number; manual: number }[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function ContentPipelineChart({ data }: ContentPipelineChartProps) {
  const hasData = data.some((d) => d.total > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline de contenido</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
          Sin contenido registrado aún
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline de contenido</CardTitle>
        <CardDescription>Piezas por estado · IA vs Manual</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="estado"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="ai" name="✨ IA" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} maxBarSize={40} />
            <Bar dataKey="manual" name="✍️ Manual" stackId="a" fill="#c4b5fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground justify-end">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2.5 bg-violet-500 rounded-sm" />
            ✨ Generado con IA
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2.5 bg-violet-300 rounded-sm" />
            ✍️ Manual
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
