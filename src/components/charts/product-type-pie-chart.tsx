'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ProductTypePieChartProps {
  data: { name: string; value: number; color: string }[]
  total: number
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background shadow-lg p-3 text-xs">
      <p className="font-semibold">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.color }} className="font-bold">
        €{payload[0].value.toFixed(2)}
      </p>
    </div>
  )
}

export function ProductTypePieChart({ data, total }: ProductTypePieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Libros vs Digitales</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
          Sin datos de ventas aún
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Libros vs Digitales</CardTitle>
        <CardDescription>Distribución de ingresos netos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Total en el centro del donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">€{total.toFixed(0)}</p>
          </div>
        </div>

        {/* Leyenda manual para más control visual */}
        <div className="flex justify-center gap-6 mt-1">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-semibold">€{entry.value.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
