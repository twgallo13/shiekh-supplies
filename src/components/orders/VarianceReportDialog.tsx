import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VarianceType, LineItem } from '@/types/orders'
import { Camera, Upload, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface VarianceReportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lineItem: LineItem
    onSubmitVariance: (lineItemId: string, varianceType: VarianceType, notes: string, photoUrl?: string) => void
}

const VARIANCE_TYPE_LABELS: Record<VarianceType, string> = {
    'SHORT_SHIP': 'Short Ship',
    'DAMAGED': 'Damaged',
    'WRONG_ITEM': 'Wrong Item'
}

const VARIANCE_TYPE_DESCRIPTIONS: Record<VarianceType, string> = {
    'SHORT_SHIP': 'Received fewer items than ordered',
    'DAMAGED': 'Items received are damaged or defective',
    'WRONG_ITEM': 'Incorrect product received'
}

export function VarianceReportDialog({
    open,
    onOpenChange,
    lineItem,
    onSubmitVariance
}: VarianceReportDialogProps) {
    const [varianceType, setVarianceType] = useState<VarianceType | ''>('')
    const [notes, setNotes] = useState('')
    const [photoAttached, setPhotoAttached] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!varianceType) {
            toast.error('Please select a variance type')
            return
        }

        if (!notes.trim()) {
            toast.error('Please provide notes describing the variance')
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate photo upload URL if photo was "attached"
            const photoUrl = photoAttached ? `https://storage.example.com/variance-photos/${Date.now()}.jpg` : undefined

            await onSubmitVariance(lineItem.lineItemId, varianceType as VarianceType, notes.trim(), photoUrl)

            // Reset form
            setVarianceType('')
            setNotes('')
            setPhotoAttached(false)
            onOpenChange(false)

            toast.success(`Variance reported for ${lineItem.productName}`)
        } catch (error) {
            toast.error('Failed to submit variance report')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePhotoUpload = () => {
        // Simulate photo upload process
        toast.success('Photo attached successfully')
        setPhotoAttached(true)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Report Variance</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Product Information */}
                    <Card>
                        <CardContent className="pt-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-sm">{lineItem.productName}</p>
                                        <p className="text-sm text-muted-foreground">SKU: {lineItem.sku}</p>
                                    </div>
                                    <Badge variant="outline">{lineItem.category}</Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Ordered: {lineItem.quantityOrdered}</span>
                                    <span>Received: {lineItem.quantityReceived || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Variance Type Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="variance-type">Variance Type</Label>
                        <Select value={varianceType} onValueChange={(value) => setVarianceType(value as VarianceType | '')}>
                            <SelectTrigger id="variance-type">
                                <SelectValue placeholder="Select variance type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(VARIANCE_TYPE_LABELS).map(([type, label]) => (
                                    <SelectItem key={type} value={type}>
                                        <div>
                                            <div className="font-medium">{label}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {VARIANCE_TYPE_DESCRIPTIONS[type as VarianceType]}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="variance-notes">Notes *</Label>
                        <Textarea
                            id="variance-notes"
                            placeholder="Describe the variance in detail..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                        <Label>Photo Evidence</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePhotoUpload}
                                disabled={photoAttached}
                                className="flex-1"
                            >
                                {photoAttached ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                        Photo Attached
                                    </>
                                ) : (
                                    <>
                                        <Camera className="h-4 w-4 mr-2" />
                                        Take Photo
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePhotoUpload}
                                disabled={photoAttached}
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>
                        {photoAttached && (
                            <p className="text-xs text-muted-foreground">
                                Photo evidence has been attached to this variance report.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !varianceType || !notes.trim()}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Variance'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}