import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MagnifyingGlass, Download, Eye, FunnelSimple } from '@phosphor-icons/react'

interface AuditEntry {
  auditId: string
  targetEntityId: string
  actorUserId: string
  actorRole: string
  actionType: string
  reasonCode?: string
  createdAt: string
  changeSet: Record<string, any>
}

const sampleAuditEntries: AuditEntry[] = [
  {
    auditId: 'audit-001',
    targetEntityId: 'order-001',
    actorUserId: 'demo-fm-1',
    actorRole: 'FM',
    actionType: 'OVERRIDE',
    reasonCode: 'STOCKOUT_RISK',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    changeSet: {
      originalVendorId: 'vendor-001',
      newVendorId: 'vendor-002',
      costDelta: -15.50
    }
  },
  {
    auditId: 'audit-002',
    targetEntityId: 'order-002',
    actorUserId: 'demo-dm-1',
    actorRole: 'DM',
    actionType: 'APPROVED',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    changeSet: {
      previousStatus: 'PENDING_DM_APPROVAL',
      newStatus: 'PENDING_FM_APPROVAL'
    }
  },
  {
    auditId: 'audit-003',
    targetEntityId: 'product-001',
    actorUserId: 'demo-admin-1',
    actorRole: 'ADMIN',
    actionType: 'PRODUCT_UPDATED',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    changeSet: {
      field: 'isRestricted',
      oldValue: false,
      newValue: true
    }
  },
  {
    auditId: 'audit-004',
    targetEntityId: 'order-003',
    actorUserId: 'demo-sm-1',
    actorRole: 'SM',
    actionType: 'VARIANCE_REPORTED',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    changeSet: {
      varianceType: 'SHORT_SHIP',
      expectedQuantity: 10,
      receivedQuantity: 8
    }
  }
]

export function AuditDashboard() {
  const [auditEntries] = useKV<AuditEntry[]>('audit_entries', sampleAuditEntries)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)

  const roles = ['all', ...new Set(auditEntries?.map(entry => entry.actorRole) || [])]
  const actions = ['all', ...new Set(auditEntries?.map(entry => entry.actionType) || [])]

  const filteredEntries = (auditEntries || []).filter(entry => {
    const matchesSearch = 
      entry.targetEntityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.actorUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.reasonCode && entry.reasonCode.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = selectedRole === 'all' || entry.actorRole === selectedRole
    const matchesAction = selectedAction === 'all' || entry.actionType === selectedAction

    return matchesSearch && matchesRole && matchesAction
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'OVERRIDE':
        return 'destructive'
      case 'APPROVED':
        return 'default'
      case 'REJECTED':
        return 'secondary'
      case 'CREATED':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const exportAuditLog = () => {
    const csvContent = [
      ['Audit ID', 'Target Entity', 'Actor', 'Role', 'Action', 'Reason Code', 'Date', 'Change Set'].join(','),
      ...filteredEntries.map(entry => [
        entry.auditId,
        entry.targetEntityId,
        entry.actorUserId,
        entry.actorRole,
        entry.actionType,
        entry.reasonCode || '',
        entry.createdAt,
        JSON.stringify(entry.changeSet).replace(/,/g, ';')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Complete audit trail of all system activities
          </p>
        </div>
        
        <Button onClick={exportAuditLog} className="flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelSimple size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Entries</CardTitle>
          <CardDescription>
            Showing {filteredEntries.length} of {auditEntries?.length || 0} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit entries found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.auditId}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.actorUserId}</div>
                          <Badge variant="outline" className="text-xs">
                            {entry.actorRole}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(entry.actionType)}>
                          {entry.actionType.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.targetEntityId}
                      </TableCell>
                      <TableCell>
                        {entry.reasonCode ? (
                          <Badge variant="secondary">{entry.reasonCode}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Entry Details</CardTitle>
            <CardDescription>
              Complete change details for {selectedEntry.auditId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Audit ID:</strong> {selectedEntry.auditId}</div>
                    <div><strong>Target Entity:</strong> {selectedEntry.targetEntityId}</div>
                    <div><strong>Actor:</strong> {selectedEntry.actorUserId}</div>
                    <div><strong>Role:</strong> {selectedEntry.actorRole}</div>
                    <div><strong>Action:</strong> {selectedEntry.actionType}</div>
                    <div><strong>Date:</strong> {formatDate(selectedEntry.createdAt)}</div>
                    {selectedEntry.reasonCode && (
                      <div><strong>Reason:</strong> {selectedEntry.reasonCode}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Change Set</h4>
                  <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(selectedEntry.changeSet, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}