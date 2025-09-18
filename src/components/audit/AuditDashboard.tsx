import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order, AuditEntry } from '@/types/orders'; // Ensure this path is correct
import { format } from 'date-fns';

// A type that includes the orderId with the audit entry for context
type ExtendedAuditEntry = AuditEntry & {
  orderId: string;
};

interface AuditDashboardProps {
  orders: Order[]; // Accept orders as a prop
  onNavigateToOrder?: (orderId: string) => void;
}

export const AuditDashboard = ({ orders, onNavigateToOrder }: AuditDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const allAuditEntries = useMemo((): ExtendedAuditEntry[] => {
    return (
      orders
        .flatMap((order: Order) =>
          (order.auditTrail || []).map((entry) => ({
            ...entry,
            orderId: order.orderId,
          }))
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    ) as ExtendedAuditEntry[];
  }, [orders]);

  const filteredEntries = useMemo(() => {
    return allAuditEntries.filter((entry) => {
      const matchesRole = roleFilter === 'all' || entry.actor === roleFilter;
      const matchesAction = actionFilter === 'all' || entry.action === actionFilter;

      const matchesSearch =
        searchTerm === '' ||
        entry.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.actor && entry.actor.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesRole && matchesAction && matchesSearch;
    });
  }, [allAuditEntries, roleFilter, actionFilter, searchTerm]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(allAuditEntries.map((entry) => entry.actor).filter(Boolean));
    return ['all', ...Array.from(roles)] as string[];
  }, [allAuditEntries]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(allAuditEntries.map((entry) => entry.action));
    return ['all', ...Array.from(actions)];
  }, [allAuditEntries]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>System Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              placeholder="Filter by Order ID, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Reason Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry, index) => (
                  <TableRow key={`${entry.orderId}-${index}`}>
                    <TableCell>{format(new Date(entry.timestamp), 'PPpp')}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => onNavigateToOrder?.(entry.orderId)}
                      >
                        {entry.orderId}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.actor}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{entry.action}</Badge>
                    </TableCell>
                    <TableCell>{entry.reasonCode || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};