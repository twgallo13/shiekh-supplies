import { OrderCard, type OrderSummary } from './order-card'

/**
 * OrderCard Component Demonstrations
 * 
 * This file showcases different states and variations of the OrderCard component
 * used throughout the SupplySync ERP system for displaying order summaries.
 */

const baseOrder: OrderSummary = {
  orderId: 'ord_3e0f0e1b-6f2f-4d4a-9d7a-1b2c3d4e5f60',
  orderType: 'AD_HOC',
  status: 'PENDING_DM_APPROVAL',
  storeId: 'store-001',
  storeName: 'Downtown LA Store',
  totalItems: 5,
  totalCost: 234.99,
  createdAt: '2024-01-15T10:30:00Z'
}

export function OrderCardDemo() {
  const handleAction = (action: string, orderId: string) => {
    console.log(`${action} order:`, orderId)
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">OrderCard Component States</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending DM Approval */}
        <div className="space-y-2">
          <h3 className="font-medium">Pending DM Approval</h3>
          <OrderCard
            order={baseOrder}
            showCost={false}
            onApprove={(id) => handleAction('approve', id)}
            onReject={(id) => handleAction('reject', id)}
            onViewDetails={(id) => handleAction('view-details', id)}
          />
        </div>

        {/* Pending FM Approval */}
        <div className="space-y-2">
          <h3 className="font-medium">Pending FM Approval</h3>
          <OrderCard
            order={{
              ...baseOrder,
              status: 'PENDING_FM_APPROVAL',
              approvedBy: 'Marcus Johnson (DM)'
            }}
            showCost={true}
            onApprove={(id) => handleAction('approve', id)}
            onReject={(id) => handleAction('reject', id)}
            onViewDetails={(id) => handleAction('view-details', id)}
          />
        </div>

        {/* Approved for Fulfillment */}
        <div className="space-y-2">
          <h3 className="font-medium">Approved for Fulfillment</h3>
          <OrderCard
            order={{
              ...baseOrder,
              status: 'APPROVED_FOR_FULFILLMENT',
              approvedBy: 'Elena Rodriguez (FM)'
            }}
            showCost={true}
            onViewDetails={(id) => handleAction('view-details', id)}
          />
        </div>

        {/* In Transit */}
        <div className="space-y-2">
          <h3 className="font-medium">In Transit</h3>
          <OrderCard
            order={{
              ...baseOrder,
              status: 'IN_TRANSIT',
              trackingNumbers: ['1Z999AA1234567890', '1Z999AA1234567891']
            }}
            showCost={true}
            onViewDetails={(id) => handleAction('view-details', id)}
          />
        </div>

        {/* Delivered */}
        <div className="space-y-2">
          <h3 className="font-medium">Delivered</h3>
          <OrderCard
            order={{
              ...baseOrder,
              status: 'DELIVERED',
              trackingNumbers: ['1Z999AA1234567890']
            }}
            showCost={true}
            onViewDetails={(id) => handleAction('view-details', id)}
          />
        </div>

        {/* Rejected */}
        <div className="space-y-2">
          <h3 className="font-medium">Rejected</h3>
          <OrderCard
            order={{
              ...baseOrder,
              status: 'REJECTED'
            }}
            showCost={false}
            onViewDetails={(id) => handleAction('view-details', id)}
          />
        </div>

        {/* Replenishment Order */}
        <div className="space-y-2">
          <h3 className="font-medium">Replenishment Order</h3>
          <OrderCard
            order={{
              ...baseOrder,
              orderType: 'REPLENISHMENT',
              status: 'APPROVED_FOR_FULFILLMENT',
              totalItems: 24,
              totalCost: 1299.99
            }}
            showCost={true}
            onViewDetails={(id) => handleAction('view-details', id)}
          />
        </div>

        {/* Large Order */}
        <div className="space-y-2">
          <h3 className="font-medium">Large Order</h3>
          <OrderCard
            order={{
              ...baseOrder,
              totalItems: 156,
              totalCost: 5234.67,
              trackingNumbers: ['1Z999AA1234567890', '1Z999AA1234567891', '1Z999AA1234567892']
            }}
            showCost={true}
            onViewDetails={(id) => handleAction('view-details', id)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Role-Based Views</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Manager View */}
          <div className="space-y-2">
            <h3 className="font-medium">Store Manager View (No Cost Info)</h3>
            <OrderCard
              order={baseOrder}
              showCost={false}
              onViewDetails={(id) => handleAction('view-details', id)}
            />
          </div>

          {/* Facility Manager View */} 
          <div className="space-y-2">
            <h3 className="font-medium">Facility Manager View (Full Access)</h3>
            <OrderCard
              order={{
                ...baseOrder,
                status: 'PENDING_FM_APPROVAL'
              }}
              showCost={true}
              onApprove={(id) => handleAction('approve', id)}
              onReject={(id) => handleAction('reject', id)}
              onViewDetails={(id) => handleAction('view-details', id)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}