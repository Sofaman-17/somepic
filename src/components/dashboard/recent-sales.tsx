import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Sale } from '@/types'

interface RecentSalesProps {
  sales: Sale[]
}

const channelLabels: Record<string, string> = {
  vinted: 'Vinted',
  gumroad: 'Gumroad',
  wallapop: 'Wallapop',
  directo: 'Directo',
  otro: 'Otro',
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ventas recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aún no hay ventas registradas.
          </p>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{sale.buyer_name ?? 'Comprador anónimo'}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] py-0">
                      {channelLabels[sale.channel]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(sale.sold_at)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    +{formatCurrency(sale.net_amount ?? sale.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(sale.amount)} bruto
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
