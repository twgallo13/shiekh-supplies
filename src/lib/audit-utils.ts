import type { Order, AuditEntry } from '@/types/orders'

// Extended audit entry that includes order reference
export interface CentralizedAuditEntry extends AuditEntry {
    orderId: string
    orderType: 'AD_HOC' | 'REPLENISHMENT'
    storeName: string
    storeId: string
}

/**
 * Collects audit trail entries from all order sources and combines them
 * into a single chronologically sorted list
 */
export function collectAllAuditEntries(
    orders: Order[] = [],
    goodsReceiptOrders: Order[] = [],
    varianceResolutionOrders: Order[] = [],
    replenishmentOrders: Order[] = []
): CentralizedAuditEntry[] {
    const allEntries: CentralizedAuditEntry[] = []

    // Helper function to process orders from any source
    const processOrders = (orderList: Order[]) => {
        orderList.forEach(order => {
            if (order.auditTrail && order.auditTrail.length > 0) {
                order.auditTrail.forEach(auditEntry => {
                    allEntries.push({
                        ...auditEntry,
                        orderId: order.orderId,
                        orderType: order.orderType,
                        storeName: order.storeName,
                        storeId: order.storeId
                    })
                })
            }
        })
    }

    // Process all order sources
    processOrders(orders)
    processOrders(goodsReceiptOrders)
    processOrders(varianceResolutionOrders)
    processOrders(replenishmentOrders)

    // Sort by timestamp (most recent first)
    return allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * Filter audit entries by various criteria
 */
export function filterAuditEntries(
    entries: CentralizedAuditEntry[],
    filters: {
        dateFrom?: Date
        dateTo?: Date
        actorRole?: string
        actionType?: string
        orderId?: string
        storeId?: string
    }
): CentralizedAuditEntry[] {
    return entries.filter(entry => {
        // Date range filter
        if (filters.dateFrom || filters.dateTo) {
            const entryDate = new Date(entry.timestamp)
            if (filters.dateFrom && entryDate < filters.dateFrom) return false
            if (filters.dateTo && entryDate > filters.dateTo) return false
        }

        // Actor role filter
        if (filters.actorRole && filters.actorRole !== 'all' && entry.actor !== filters.actorRole) {
            return false
        }

        // Action type filter
        if (filters.actionType && filters.actionType !== 'all' && entry.action !== filters.actionType) {
            return false
        }

        // Order ID filter
        if (filters.orderId && !entry.orderId.toLowerCase().includes(filters.orderId.toLowerCase())) {
            return false
        }

        // Store ID filter
        if (filters.storeId && filters.storeId !== 'all' && entry.storeId !== filters.storeId) {
            return false
        }

        return true
    })
}

/**
 * Get unique values for filter dropdowns
 */
export function getAuditFilterOptions(entries: CentralizedAuditEntry[]) {
    const actors = [...new Set(entries.map(e => e.actor))].sort()
    const actions = [...new Set(entries.map(e => e.action))].sort()
    const stores = [...new Set(entries.map(e => e.storeName))].sort()

    return {
        actors,
        actions,
        stores
    }
}

/**
 * Export audit entries to CSV format
 */
export function exportAuditEntriesToCSV(entries: CentralizedAuditEntry[], filename?: string): void {
    const headers = [
        'Timestamp',
        'Order ID',
        'Store Name',
        'Order Type',
        'Actor Role',
        'Action Type',
        'Details',
        'Reason Code'
    ]

    const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
            entry.timestamp,
            entry.orderId,
            entry.storeName,
            entry.orderType,
            entry.actor,
            entry.action,
            `"${entry.details || ''}"`, // Wrap details in quotes for CSV safety
            entry.reasonCode || ''
        ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename || `audit-log-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}