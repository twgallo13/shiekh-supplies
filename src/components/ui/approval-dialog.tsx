import { ReactNode, useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "./dialog"
import { EnhancedButton } from "./enhanced-button"
import { Button } from "./button"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { Badge } from "./badge"
import { CheckCircle, XCircle, Warning } from "@phosphor-icons/react"

interface ApprovalDialogProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  itemName?: string
  itemDetails?: Record<string, any>
  approvalType: 'approve' | 'reject' | 'override'
  requiresReason?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
  onConfirm: (reason?: string) => Promise<void> | void
  onCancel?: () => void
  loading?: boolean
  children?: ReactNode
}

function ApprovalDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  itemName,
  itemDetails,
  approvalType,
  requiresReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Please provide a reason for this action...",
  onConfirm,
  onCancel,
  loading = false,
  children
}: ApprovalDialogProps) {
  const [reason, setReason] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const controlled = open !== undefined
  const dialogOpen = controlled ? open : isOpen
  const setDialogOpen = controlled ? (onOpenChange || (() => {})) : setIsOpen

  const getIcon = () => {
    switch (approvalType) {
      case 'approve':
        return <CheckCircle size={24} className="text-green-600" />
      case 'reject':
        return <XCircle size={24} className="text-red-600" />
      case 'override':
        return <Warning size={24} className="text-amber-600" />
      default:
        return null
    }
  }

  const getActionColor = () => {
    switch (approvalType) {
      case 'approve':
        return 'primary'
      case 'reject':
        return 'destructive'
      case 'override':
        return 'secondary'
      default:
        return 'primary'
    }
  }

  const getActionText = () => {
    switch (approvalType) {
      case 'approve':
        return 'Approve'
      case 'reject':
        return 'Reject'
      case 'override':
        return 'Override'
      default:
        return 'Confirm'
    }
  }

  const handleConfirm = async () => {
    if (requiresReason && !reason.trim()) {
      return // Don't proceed without reason when required
    }
    
    try {
      await onConfirm(reason.trim() || undefined)
      setReason('')
      setDialogOpen(false)
    } catch (error) {
      // Error handling should be done by parent component
      console.error('Approval action failed:', error)
    }
  }

  const handleCancel = () => {
    setReason('')
    setDialogOpen(false)
    onCancel?.()
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Item details */}
          {itemName && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">{itemName}</h4>
              {itemDetails && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(itemDetails).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <div className="font-medium">
                        {typeof value === 'boolean' ? (
                          <Badge variant={value ? 'default' : 'secondary'}>
                            {value ? 'Yes' : 'No'}
                          </Badge>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom content */}
          {children}

          {/* Reason input */}
          {requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                {reasonLabel} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px]"
                required
              />
              {requiresReason && !reason.trim() && (
                <p className="text-xs text-muted-foreground">
                  A reason is required for this action.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <EnhancedButton
            variant={getActionColor() as any}
            onClick={handleConfirm}
            loading={loading}
            disabled={requiresReason && !reason.trim()}
          >
            {getActionText()}
          </EnhancedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Convenience components for specific approval types
function ApproveDialog(props: Omit<ApprovalDialogProps, 'approvalType'>) {
  return <ApprovalDialog {...props} approvalType="approve" />
}

function RejectDialog(props: Omit<ApprovalDialogProps, 'approvalType'>) {
  return <ApprovalDialog {...props} approvalType="reject" requiresReason />
}

function OverrideDialog(props: Omit<ApprovalDialogProps, 'approvalType'>) {
  return <ApprovalDialog {...props} approvalType="override" requiresReason />
}

export { ApprovalDialog, ApproveDialog, RejectDialog, OverrideDialog, type ApprovalDialogProps }