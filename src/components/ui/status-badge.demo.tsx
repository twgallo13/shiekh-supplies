import { 
  StatusBadge, 
  PendingBadge, 
  ApprovedBadge, 
  RejectedBadge, 
  ShippedBadge, 
  DeliveredBadge, 
  ProcessingBadge, 
  WarningBadge 
} from './status-badge'
import { Star, Bell } from '@phosphor-icons/react'

/**
 * StatusBadge Component Demonstrations
 * 
 * This file showcases different states and variations of the StatusBadge component
 * used throughout the SupplySync ERP system for displaying status indicators.
 */

export function StatusBadgeDemo() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">StatusBadge Component States</h1>
      
      <div className="space-y-8">
        {/* Basic Status Types */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Status Types</h2>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="pending">Pending Approval</StatusBadge>
            <StatusBadge status="approved">Approved</StatusBadge>
            <StatusBadge status="rejected">Rejected</StatusBadge>
            <StatusBadge status="shipped">Shipped</StatusBadge>
            <StatusBadge status="delivered">Delivered</StatusBadge>
            <StatusBadge status="processing">Processing</StatusBadge>
            <StatusBadge status="warning">Warning</StatusBadge>
            <StatusBadge status="info">Info</StatusBadge>
            <StatusBadge status="default">Default</StatusBadge>
          </div>
        </div>

        {/* Size Variations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Size Variations</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm">Small:</span>
              <StatusBadge status="approved" size="sm">Approved</StatusBadge>
              <StatusBadge status="pending" size="sm">Pending</StatusBadge>
              <StatusBadge status="rejected" size="sm">Rejected</StatusBadge>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm">Medium:</span>
              <StatusBadge status="approved" size="md">Approved</StatusBadge>
              <StatusBadge status="pending" size="md">Pending</StatusBadge>
              <StatusBadge status="rejected" size="md">Rejected</StatusBadge>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm">Large:</span>
              <StatusBadge status="approved" size="lg">Approved</StatusBadge>
              <StatusBadge status="pending" size="lg">Pending</StatusBadge>
              <StatusBadge status="rejected" size="lg">Rejected</StatusBadge>
            </div>
          </div>
        </div>

        {/* With and Without Icons */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Icon Options</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm">With icons:</span>
              <StatusBadge status="approved" showIcon>Approved</StatusBadge>
              <StatusBadge status="pending" showIcon>Pending</StatusBadge>
              <StatusBadge status="rejected" showIcon>Rejected</StatusBadge>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm">Without icons:</span>
              <StatusBadge status="approved" showIcon={false}>Approved</StatusBadge>
              <StatusBadge status="pending" showIcon={false}>Pending</StatusBadge>
              <StatusBadge status="rejected" showIcon={false}>Rejected</StatusBadge>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-sm">Custom icons:</span>
              <StatusBadge status="approved" icon={<Star />}>Featured</StatusBadge>
              <StatusBadge status="warning" icon={<Bell />}>Alert</StatusBadge>
            </div>
          </div>
        </div>

        {/* Predefined Components */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Predefined Components</h2>
          <div className="flex flex-wrap gap-3">
            <PendingBadge />
            <ApprovedBadge />
            <RejectedBadge />
            <ShippedBadge />
            <DeliveredBadge />
            <ProcessingBadge />
            <WarningBadge />
          </div>
        </div>

        {/* Order Status Examples */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Order Status Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Order #12345</h3>
              <StatusBadge status="pending">Pending DM Approval</StatusBadge>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Order #12346</h3>
              <StatusBadge status="approved">Approved for Fulfillment</StatusBadge>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Order #12347</h3>
              <StatusBadge status="shipped">In Transit</StatusBadge>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Order #12348</h3>
              <StatusBadge status="delivered">Delivered</StatusBadge>
            </div>
          </div>
        </div>

        {/* System Status Examples */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">System Status Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Inventory Alert</h3>
              <StatusBadge status="warning">Low Stock</StatusBadge>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">System Status</h3>
              <StatusBadge status="processing">Syncing Data</StatusBadge>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">User Permission</h3>
              <StatusBadge status="info">Read Only Access</StatusBadge>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Vendor Status</h3>
              <StatusBadge status="rejected">SLA Breach</StatusBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}