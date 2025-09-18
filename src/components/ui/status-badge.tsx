import { ComponentProps, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  Warning,
  Eye,
  FileText,
  Gear
} from "@phosphor-icons/react"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        pending: "bg-amber-100 text-amber-800 border-amber-200",
        approved: "bg-green-100 text-green-800 border-green-200",
        rejected: "bg-red-100 text-red-800 border-red-200", 
        shipped: "bg-blue-100 text-blue-800 border-blue-200",
        delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
        processing: "bg-purple-100 text-purple-800 border-purple-200",
        warning: "bg-orange-100 text-orange-800 border-orange-200",
        info: "bg-cyan-100 text-cyan-800 border-cyan-200",
        default: "bg-gray-100 text-gray-800 border-gray-200"
      },
      size: {
        sm: "px-2 py-0.5 text-xs gap-1",
        md: "px-2.5 py-1 text-xs gap-1.5", 
        lg: "px-3 py-1.5 text-sm gap-2"
      }
    },
    defaultVariants: {
      status: "default",
      size: "md"
    }
  }
)

interface StatusBadgeProps extends ComponentProps<"span">, VariantProps<typeof statusBadgeVariants> {
  icon?: ReactNode
  showIcon?: boolean
  children?: ReactNode
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  shipped: Truck,
  delivered: Package,
  processing: Gear,
  warning: Warning,
  info: Eye,
  default: FileText
}

function StatusBadge({ 
  className, 
  status = "default", 
  size = "md",
  icon,
  showIcon = true,
  children = "Status",
  ...props 
}: StatusBadgeProps) {
  const IconComponent = icon || (showIcon && status ? statusIcons[status] : null)
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14

  return (
    <span
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {IconComponent && (
        typeof IconComponent === 'function' ? (
          <IconComponent size={iconSize} weight="fill" />
        ) : (
          IconComponent
        )
      )}
      {children}
    </span>
  )
}

// Predefined status badge components for common use cases
function PendingBadge({ children, ...props }: Omit<StatusBadgeProps, 'status'> & { children?: ReactNode }) {
  return (
    <StatusBadge status="pending" {...props}>
      {children || "Pending Approval"}
    </StatusBadge>
  )
}

function ApprovedBadge({ children, ...props }: Omit<StatusBadgeProps, 'status'> & { children?: ReactNode }) {
  return (
    <StatusBadge status="approved" {...props}>
      {children || "Approved"}
    </StatusBadge>
  )
}

function RejectedBadge({ children, ...props }: Omit<StatusBadgeProps, 'status'> & { children?: ReactNode }) {
  return (
    <StatusBadge status="rejected" {...props}>
      {children || "Rejected"}
    </StatusBadge>
  )
}

function ShippedBadge({ children, ...props }: Omit<StatusBadgeProps, 'status'> & { children?: ReactNode }) {
  return (
    <StatusBadge status="shipped" {...props}>
      {children || "Shipped"}
    </StatusBadge>
  )
}

function DeliveredBadge({ children, ...props }: Omit<StatusBadgeProps, 'status'> & { children?: ReactNode }) {
  return (
    <StatusBadge status="delivered" {...props}>
      {children || "Delivered"}
    </StatusBadge>
  )
}

function ProcessingBadge({ children, ...props }: Omit<StatusBadgeProps, 'status'> & { children?: ReactNode }) {
  return (
    <StatusBadge status="processing" {...props}>
      {children || "Processing"}
    </StatusBadge>
  )
}

function WarningBadge({ children, ...props }: Omit<StatusBadgeProps, 'status'> & { children?: ReactNode }) {
  return (
    <StatusBadge status="warning" {...props}>
      {children || "Warning"}
    </StatusBadge>
  )
}

export { 
  StatusBadge, 
  PendingBadge,
  ApprovedBadge, 
  RejectedBadge,
  ShippedBadge,
  DeliveredBadge,
  ProcessingBadge,
  WarningBadge,
  statusBadgeVariants,
  type StatusBadgeProps 
}