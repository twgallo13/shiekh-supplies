import { OrderCard, type OrderSummary } from './order-card'

// Mock action function for demonstration
const action = (name: string) => () => console.log(`Action: ${name}`)

/**
 * OrderCard Component Stories
 * 
 * This file demonstrates different states and variations of the OrderCard component
 * used throughout the SupplySync ERP system for displaying order summaries.
 * 
 * The OrderCard supports:
 * - Different order statuses with appropriate styling
 * - Role-based cost visibility 
 * - Contextual actions (approve, reject, view details)
 * - Tracking number display
 * - Custom action slots
 */

const baseOrder: OrderSummary = {
  orderId: 'ord_3e0f0e1b-6f2f-4d4a-9d7a-1b2c3d4e5f60',
  orderType: 'AD_HOC',
  status: 'PENDING_DM_APPROVAL',
  storeId: 'store-001',
  storeName: 'Downtown LA Store',
  totalItems: 5,
  totalCost: 234.99,
  createdAt: '2024-01-15T10:30:00Z',
  approvedBy: undefined,
  trackingNumbers: []
}

// Example usage scenarios for the OrderCard component

export const exampleOrders = {
  pendingDMApproval: {
    order: baseOrder,
    showCost: false,
    onApprove: action('approve'),
    onReject: action('reject'),
    onViewDetails: action('view-details')
  },
  
  pendingFMApproval: {
    order: {
      ...baseOrder,
      status: 'PENDING_FM_APPROVAL' as const,
      approvedBy: 'Marcus Johnson (DM)'
    },
    showCost: true,
    onApprove: action('approve'),
    onReject: action('reject'),
    onViewDetails: action('view-details')
  },
  
  approvedForFulfillment: {
    order: {
      ...baseOrder,
      status: 'APPROVED_FOR_FULFILLMENT' as const,
      approvedBy: 'Elena Rodriguez (FM)'
    },
    showCost: true,
    onViewDetails: action('view-details')
  },
  
  inTransit: {
    order: {
      ...baseOrder,
      status: 'IN_TRANSIT' as const,
      trackingNumbers: ['1Z999AA1234567890', '1Z999AA1234567891']
    },
    showCost: true,
    onViewDetails: action('view-details')
  }
}