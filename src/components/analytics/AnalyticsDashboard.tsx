import { useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import type { Order } from '@/types/orders'
import { canAccessView } from '@/lib/auth'
import * as RechartsPrimitive from 'recharts'

import type { UserRole } from '@/lib/auth'

export function AnalyticsDashboard({ userRole }: { userRole: UserRole }) {
    // Only show if user has analytics permission
    if (!canAccessView(userRole, 'analytics')) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                You do not have permission to view analytics.
            </div>
        )
    }

    // Load all orders
    const [orders] = useKV<Order[]>('orders', [])
    const [goodsReceiptOrders] = useKV<Order[]>('goods-receipt-orders', [])
    const [varianceResolutionOrders] = useKV<Order[]>('variance-resolution-orders', [])
    const [replenishmentOrders] = useKV<Order[]>('replenishment-orders', [])

    // Combine all orders
    const allOrders = useMemo(() => [
        ...(orders || []),
        ...(goodsReceiptOrders || []),
        ...(varianceResolutionOrders || []),
        ...(replenishmentOrders || [])
    ], [orders, goodsReceiptOrders, varianceResolutionOrders, replenishmentOrders])

    // KPI: Variance Rate
    const varianceRate = useMemo(() => {
        const total = allOrders.length
        const withVariance = allOrders.filter(o => o.status === 'RECEIVED_VARIANCE').length
        return total > 0 ? ((withVariance / total) * 100).toFixed(1) : '0.0'
    }, [allOrders])

    // KPI: Anomaly Frequency (placeholder)
    const anomalyFrequency = '3 usage spikes'

    // KPI: Receipt Timeliness
    const receiptTimeliness = useMemo(() => {
        // Only consider orders that have both APPROVED_FOR_FULFILLMENT and RECEIVED_COMPLETE audit entries
        let totalTime = 0
        let count = 0
        allOrders.forEach(order => {
            const approved = order.auditTrail?.find(e => e.action === 'APPROVED_FOR_FULFILLMENT')
            const received = order.auditTrail?.find(e => e.action === 'RECEIVED_COMPLETE')
            if (approved && received) {
                const t1 = new Date(approved.timestamp).getTime()
                const t2 = new Date(received.timestamp).getTime()
                if (t2 > t1) {
                    totalTime += (t2 - t1)
                    count++
                }
            }
        })
        if (count === 0) return 'N/A'
        // Return average in hours
        const avgMs = totalTime / count
        const avgHours = avgMs / (1000 * 60 * 60)
        return avgHours.toFixed(2) + ' hrs'
    }, [allOrders])

    // Orders by Status for chart
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        allOrders.forEach(order => {
            counts[order.status] = (counts[order.status] || 0) + 1
        })
        return counts
    }, [allOrders])

    const chartData = {
        labels: Object.keys(statusCounts),
        datasets: [
            {
                label: 'Orders by Status',
                data: Object.values(statusCounts),
                backgroundColor: '#2563eb'
            }
        ]
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Variance Rate</CardTitle>
                        <CardDescription>Percentage of orders with reported variance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-blue-700">{varianceRate}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Anomaly Frequency</CardTitle>
                        <CardDescription>Usage spikes detected (placeholder)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-orange-600">{anomalyFrequency}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Receipt Timeliness</CardTitle>
                        <CardDescription>Avg. time from approval to receipt</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-green-700">{receiptTimeliness}</div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Orders by Status</CardTitle>
                    <CardDescription>Distribution of orders by current status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-96">
                        {/* Bar chart using Recharts */}
                        <ChartContainer config={{}} className="w-full h-full">
                            <RechartsPrimitive.BarChart width={600} height={350} data={Object.keys(statusCounts).map(status => ({ status, count: statusCounts[status] }))}>
                                <RechartsPrimitive.XAxis dataKey="status" stroke="#888" />
                                <RechartsPrimitive.YAxis stroke="#888" allowDecimals={false} />
                                <RechartsPrimitive.Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                <RechartsPrimitive.Tooltip />
                                <RechartsPrimitive.Legend />
                            </RechartsPrimitive.BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
