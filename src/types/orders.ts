// Shared order types and interfaces for the supply chain system

export type VarianceType = 'SHORT_SHIP' | 'DAMAGED' | 'WRONG_ITEM'

export interface Variance {
    type: VarianceType
    notes: string
    photoUrl?: string
    reportedAt: string
    reportedBy: string
}

export interface LineItem {
    lineItemId: string
    productId: string
    sku: string
    productName: string
    quantityOrdered: number
    quantityReceived?: number
    unitOfMeasure: string
    costPerUnit: number
    category: string
    variance?: Variance
}

export interface AuditEntry {
    timestamp: string
    actor: string
    action: string
    details?: string
    reasonCode?: string
}

export interface Order {
    orderId: string
    storeId: string
    storeName: string
    orderType: 'REPLENISHMENT' | 'AD_HOC'
    status: string
    lineItems?: LineItem[]
    lineItemCount: number
    totalCost?: number
    createdAt: string
    createdByUserId: string
    auditTrail?: AuditEntry[]
    justification?: string
    expectedDeliveryDate?: string
}

export type OrderStatus =
    | 'PENDING_DM_APPROVAL'
    | 'PENDING_FM_APPROVAL'
    | 'APPROVED_FOR_FULFILLMENT'
    | 'IN_TRANSIT'
    | 'PARTIALLY_RECEIVED'
    | 'RECEIVED_COMPLETE'
    | 'RECEIVED_VARIANCE'
    | 'CLOSED'
    | 'REJECTED'
    | 'CANCELLED'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    'PENDING_DM_APPROVAL': 'Pending DM Approval',
    'PENDING_FM_APPROVAL': 'Pending FM Approval',
    'APPROVED_FOR_FULFILLMENT': 'Approved for Fulfillment',
    'IN_TRANSIT': 'In Transit',
    'PARTIALLY_RECEIVED': 'Partially Received',
    'RECEIVED_COMPLETE': 'Received Complete',
    'RECEIVED_VARIANCE': 'Received with Variance',
    'CLOSED': 'Closed',
    'REJECTED': 'Rejected',
    'CANCELLED': 'Cancelled'
}