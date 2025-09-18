import { ComponentProps, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { Button } from "./button"

const orderCardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-4 rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md",
  {
    variants: {
      status: {
        pending: "border-amber-200 bg-amber-50/20",
        approved: "border-green-200 bg-green-50/20", 
        rejected: "border-red-200 bg-red-50/20",
        shipped: "border-blue-200 bg-blue-50/20",
        delivered: "border-emerald-200 bg-emerald-50/20",
        default: ""
      }
    },
    defaultVariants: {
      status: "default"
    }
  }
)

interface OrderSummary {
  orderId: string
  orderType: 'REPLENISHMENT' | 'AD_HOC' | 'FM_INITIATED'
  status: 'PENDING_DM_APPROVAL' | 'PENDING_FM_APPROVAL' | 'APPROVED_FOR_FULFILLMENT' | 'IN_TRANSIT' | 'DELIVERED' | 'REJECTED'
  storeId: string
  storeName: string
  totalItems: number
  totalCost?: number
  createdAt: string
  approvedBy?: string
  trackingNumbers?: string[]
}

interface OrderCardProps extends ComponentProps<"div">, VariantProps<typeof orderCardVariants> {
  order: OrderSummary
  showCost?: boolean
  onApprove?: (orderId: string) => void
  onReject?: (orderId: string) => void
  onViewDetails?: (orderId: string) => void
  actions?: ReactNode
}

function OrderCard({ 
  className, 
  status, 
  order, 
  showCost = false,
  onApprove,
  onReject, 
  onViewDetails,
  actions,
  ...props 
}: OrderCardProps) {
  const getStatusVariant = (orderStatus: string) => {
    switch (orderStatus) {
      case 'PENDING_DM_APPROVAL':
      case 'PENDING_FM_APPROVAL':
        return 'pending'
      case 'APPROVED_FOR_FULFILLMENT':
        return 'approved'
      case 'IN_TRANSIT':
        return 'shipped'
      case 'DELIVERED':
        return 'delivered'
      case 'REJECTED':
        return 'rejected'
      default:
        return 'default'
    }
  }

  const getStatusDisplay = (orderStatus: string) => {
    switch (orderStatus) {
      case 'PENDING_DM_APPROVAL':
        return 'Pending DM Approval'
      case 'PENDING_FM_APPROVAL':
        return 'Pending FM Approval'
      case 'APPROVED_FOR_FULFILLMENT':
        return 'Approved for Fulfillment'
      case 'IN_TRANSIT':
        return 'In Transit'
      case 'DELIVERED':
        return 'Delivered'
      case 'REJECTED':
        return 'Rejected'
      default:
        return orderStatus
    }
  }

  const statusVariant = getStatusVariant(order.status)

  return (
    <div
      className={cn(orderCardVariants({ status: statusVariant }), className)}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">Order #{order.orderId.slice(-8)}</h3>
          <p className="text-sm text-muted-foreground">{order.storeName}</p>
        </div>
        <Badge 
          variant={statusVariant === 'rejected' ? 'destructive' : statusVariant === 'approved' || statusVariant === 'delivered' ? 'default' : 'secondary'}
        >
          {getStatusDisplay(order.status)}
        </Badge>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Type:</span>
          <p className="font-medium">{order.orderType.replace('_', ' ')}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Items:</span>
          <p className="font-medium">{order.totalItems}</p>
        </div>
        {showCost && order.totalCost && (
          <div>
            <span className="text-muted-foreground">Total Cost:</span>
            <p className="font-medium">${order.totalCost.toFixed(2)}</p>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Created:</span>
          <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Tracking Numbers */}
      {order.trackingNumbers && order.trackingNumbers.length > 0 && (
        <div>
          <span className="text-sm text-muted-foreground">Tracking:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {order.trackingNumbers.map((tracking, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tracking}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {(onApprove || onReject || onViewDetails || actions) && (
        <div className="flex gap-2 pt-2 border-t">
          {actions || (
            <>
              {onViewDetails && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails(order.orderId)}
                >
                  View Details
                </Button>
              )}
              {onApprove && (order.status.includes('PENDING')) && (
                <Button 
                  size="sm"
                  onClick={() => onApprove(order.orderId)}
                >
                  Approve
                </Button>
              )}
              {onReject && (order.status.includes('PENDING')) && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onReject(order.orderId)}
                >
                  Reject
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export { OrderCard, type OrderSummary, type OrderCardProps }