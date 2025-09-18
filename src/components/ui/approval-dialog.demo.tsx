import { useState } from 'react'
import { 
  ApprovalDialog, 
  ApproveDialog, 
  RejectDialog, 
  OverrideDialog 
} from './approval-dialog'
import { Button } from './button'
import { Badge } from './badge'
import { toast } from 'sonner'

/**
 * ApprovalDialog Component Demonstrations
 * 
 * This file showcases different variations of the ApprovalDialog component
 * used throughout the SupplySync ERP system for handling approval confirmations.
 */

export function ApprovalDialogDemo() {
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const simulateAction = async (action: string, orderId?: string) => {
    const key = `${action}-${orderId || 'default'}`
    setLoading(prev => ({ ...prev, [key]: true }))
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(prev => ({ ...prev, [key]: false }))
    
    toast.success(`${action} completed successfully`, {
      description: orderId ? `Order ${orderId} has been ${action.toLowerCase()}d.` : undefined
    })
  }

  const sampleOrder = {
    orderId: 'ORD-12345',
    orderType: 'AD_HOC',
    totalItems: 5,
    totalCost: 234.99,
    storeName: 'Downtown LA Store',
    requestedBy: 'Sarah Chen (SM)'
  }

  const sampleProduct = {
    productName: 'POS Terminal - Model X1',
    sku: 'POS-TERM-001',
    category: 'Equipment',
    isRestricted: true,
    costPerUnit: 899.99
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">ApprovalDialog Component Variations</h1>
      
      {/* Basic Approval Types */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Approval Types</h2>
        <div className="flex flex-wrap gap-3">
          <ApproveDialog
            trigger={<Button>Simple Approve</Button>}
            title="Approve Action"
            description="Are you sure you want to approve this action?"
            onConfirm={() => simulateAction('approve')}
            loading={loading['approve-default']}
          />

          <RejectDialog
            trigger={<Button variant="destructive">Simple Reject</Button>}
            title="Reject Action"
            description="Please provide a reason for rejecting this action."
            onConfirm={(reason) => {
              console.log('Rejection reason:', reason)
              return simulateAction('reject')
            }}
            loading={loading['reject-default']}
          />

          <OverrideDialog
            trigger={<Button variant="secondary">Simple Override</Button>}
            title="Override Decision"
            description="Please provide a reason for this override action."
            onConfirm={(reason) => {
              console.log('Override reason:', reason)
              return simulateAction('override')
            }}
            loading={loading['override-default']}
          />
        </div>
      </div>

      {/* Order Management Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Order Management Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* DM Order Approval */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">DM Order Approval</h3>
            <p className="text-sm text-muted-foreground">Approve an ad-hoc order from a store manager</p>
            <ApproveDialog
              trigger={<Button className="w-full">Approve Order</Button>}
              title="Approve Order Request"
              description="Review the order details and approve for fulfillment."
              itemName={`Order ${sampleOrder.orderId}`}
              itemDetails={{
                orderType: sampleOrder.orderType,
                totalItems: sampleOrder.totalItems,
                storeName: sampleOrder.storeName,
                requestedBy: sampleOrder.requestedBy
              }}
              onConfirm={() => simulateAction('approve', sampleOrder.orderId)}
              loading={loading[`approve-${sampleOrder.orderId}`]}
            />
          </div>

          {/* DM Order Rejection */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">DM Order Rejection</h3>
            <p className="text-sm text-muted-foreground">Reject an order with mandatory reason</p>
            <RejectDialog
              trigger={<Button variant="destructive" className="w-full">Reject Order</Button>}
              title="Reject Order Request"
              description="This action will reject the order and notify the store manager."
              itemName={`Order ${sampleOrder.orderId}`}
              itemDetails={{
                orderType: sampleOrder.orderType,
                totalItems: sampleOrder.totalItems,
                storeName: sampleOrder.storeName,
                requestedBy: sampleOrder.requestedBy
              }}
              reasonLabel="Rejection Reason"
              reasonPlaceholder="Please explain why this order is being rejected..."
              onConfirm={(reason) => {
                console.log('Order rejection reason:', reason)
                return simulateAction('reject', sampleOrder.orderId)
              }}
              loading={loading[`reject-${sampleOrder.orderId}`]}
            />
          </div>

          {/* FM Vendor Override */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">FM Vendor Override</h3>
            <p className="text-sm text-muted-foreground">Override vendor selection with reason</p>
            <OverrideDialog
              trigger={<Button variant="secondary" className="w-full">Override Vendor</Button>}
              title="Override Vendor Selection"
              description="Change the automatically selected vendor for this order."
              itemName="Vendor Selection Change"
              itemDetails={{
                currentVendor: 'Acme Supplies Inc.',
                suggestedVendor: 'ProSupply Corp.',
                costDifference: '+$23.45',
                leadTimeDifference: '-1 day'
              }}
              reasonLabel="Override Reason"
              reasonPlaceholder="Explain why you're overriding the vendor selection (e.g., stockout risk, quality concerns)..."
              onConfirm={(reason) => {
                console.log('Vendor override reason:', reason)
                return simulateAction('override', 'vendor')
              }}
              loading={loading['override-vendor']}
            />
          </div>
        </div>
      </div>

      {/* Product Management Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Product Management Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Restricted Product Approval */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">Restricted Product Request</h3>
            <ApproveDialog
              trigger={<Button className="w-full">Approve Restricted Item</Button>}
              title="Approve Restricted Product"
              description="This product requires special approval due to its restricted status."
              itemName={sampleProduct.productName}
              itemDetails={{
                sku: sampleProduct.sku,
                category: sampleProduct.category,
                isRestricted: sampleProduct.isRestricted,
                costPerUnit: `$${sampleProduct.costPerUnit}`
              }}
              onConfirm={() => simulateAction('approve', 'restricted-product')}
              loading={loading['approve-restricted-product']}
            >
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Restricted Item</Badge>
                </div>
                <p className="text-sm text-amber-800 mt-1">
                  This product requires manager approval due to cost and security restrictions.
                </p>
              </div>
            </ApproveDialog>
          </div>

          {/* Product Discontinuation */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">Product Discontinuation</h3>
            <ApprovalDialog
              trigger={<Button variant="destructive" className="w-full">Discontinue Product</Button>}
              title="Discontinue Product"
              description="This will mark the product as discontinued and remove it from active catalogs."
              approvalType="reject"
              itemName={sampleProduct.productName}
              itemDetails={{
                sku: sampleProduct.sku,
                category: sampleProduct.category,
                currentStock: '156 units',
                lastOrdered: '2024-01-10'
              }}
              requiresReason
              reasonLabel="Discontinuation Reason"
              reasonPlaceholder="Explain why this product is being discontinued..."
              onConfirm={(reason) => {
                console.log('Discontinuation reason:', reason)
                return simulateAction('discontinue', 'product')
              }}
              loading={loading['discontinue-product']}
            />
          </div>
        </div>
      </div>

      {/* System Administration Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">System Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">User Role Change</h3>
            <OverrideDialog
              trigger={<Button variant="secondary" className="w-full" size="sm">Change Role</Button>}
              title="Change User Role"
              description="Modify user permissions and access levels."
              itemName="Sarah Chen"
              itemDetails={{
                currentRole: 'Store Manager',
                newRole: 'District Manager',
                storeAssignment: 'All stores in West District',
                effectiveDate: 'Immediately'
              }}
              reasonLabel="Authorization Reason"
              reasonPlaceholder="Explain the reason for this role change..."
              onConfirm={(reason) => {
                console.log('Role change reason:', reason)
                return simulateAction('role-change')
              }}
              loading={loading['role-change']}
            />
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">System Maintenance</h3>
            <ApprovalDialog
              trigger={<Button variant="secondary" className="w-full" size="sm">Schedule Maintenance</Button>}
              title="Schedule System Maintenance"
              description="This will temporarily disable system access during the maintenance window."
              approvalType="approve"
              itemDetails={{
                maintenanceWindow: '2024-01-20 02:00 - 04:00 UTC',
                affectedServices: 'Order Processing, Inventory Sync',
                estimatedDowntime: '2 hours',
                notificationsSent: 'All users will be notified'
              }}
              requiresReason
              reasonLabel="Maintenance Justification"
              reasonPlaceholder="Describe what maintenance will be performed..."
              onConfirm={(reason) => {
                console.log('Maintenance reason:', reason)
                return simulateAction('maintenance')
              }}
              loading={loading['maintenance']}
            />
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">Data Export</h3>
            <ApproveDialog
              trigger={<Button className="w-full" size="sm">Approve Export</Button>}
              title="Approve Data Export"
              description="Export sensitive audit data for compliance review."
              itemDetails={{
                dataType: 'Audit Logs',
                dateRange: 'Q4 2023',
                requestedBy: 'Compliance Officer',
                exportFormat: 'CSV + PDF Report'
              }}
              onConfirm={() => simulateAction('export-approve')}
              loading={loading['export-approve']}
            />
          </div>
        </div>
      </div>
    </div>
  )
}