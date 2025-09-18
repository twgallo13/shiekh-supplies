import { useState } from 'react'
import { OrderCardDemo } from './order-card.demo'
import { StatusBadgeDemo } from './status-badge.demo'
import { EnhancedButtonDemo } from './enhanced-button.demo'
import { ApprovalDialogDemo } from './approval-dialog.demo'
import { Button } from './button'
import { Badge } from './badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

/**
 * Comprehensive Component Demo
 * 
 * This page showcases all the reusable UI components created for the SupplySync ERP system.
 * Each component includes multiple states, variations, and real-world usage examples.
 * 
 * Components included:
 * - OrderCard: For displaying order summaries with different states
 * - StatusBadge: For status indicators with icons and colors
 * - EnhancedButton: For interactive buttons with loading/success/error states
 * - ApprovalDialog: For handling approval confirmations with reasons
 */

export function ComponentsDemo() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">SupplySync ERP UI Components</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive collection of reusable UI components designed for the SupplySync ERP system.
              Each component supports multiple states, role-based access, and follows the PRD specifications.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge>React + TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="outline">Radix UI</Badge>
              <Badge variant="secondary">Phosphor Icons</Badge>
            </div>
          </div>

          {/* Component Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cards">OrderCard</TabsTrigger>
              <TabsTrigger value="badges">StatusBadge</TabsTrigger>
              <TabsTrigger value="buttons">EnhancedButton</TabsTrigger>
              <TabsTrigger value="dialogs">ApprovalDialog</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* OrderCard Preview */}
                <div className="p-6 border rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">OrderCard</h3>
                  <p className="text-sm text-muted-foreground">
                    Displays order summaries with status-based styling, role-aware cost visibility, 
                    and contextual actions.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">Order Management</Badge>
                    <Badge variant="secondary" className="text-xs">Role-Based Access</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setActiveTab('cards')}
                    className="w-full"
                  >
                    View Examples
                  </Button>
                </div>

                {/* StatusBadge Preview */}
                <div className="p-6 border rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">StatusBadge</h3>
                  <p className="text-sm text-muted-foreground">
                    Status indicators with customizable colors, icons, and sizes for 
                    consistent visual communication.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">Status Display</Badge>
                    <Badge variant="secondary" className="text-xs">Icon Support</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setActiveTab('badges')}
                    className="w-full"
                  >
                    View Examples
                  </Button>
                </div>

                {/* EnhancedButton Preview */}
                <div className="p-6 border rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">EnhancedButton</h3>
                  <p className="text-sm text-muted-foreground">
                    Interactive buttons with loading, success, and error states, 
                    plus support for icons and custom text.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">State Management</Badge>
                    <Badge variant="secondary" className="text-xs">Async Actions</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setActiveTab('buttons')}
                    className="w-full"
                  >
                    View Examples
                  </Button>
                </div>

                {/* ApprovalDialog Preview */}
                <div className="p-6 border rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">ApprovalDialog</h3>
                  <p className="text-sm text-muted-foreground">
                    Modal dialogs for approval workflows with mandatory reason codes 
                    and audit trail support.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">Workflow Management</Badge>
                    <Badge variant="secondary" className="text-xs">Audit Compliance</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setActiveTab('dialogs')}
                    className="w-full"
                  >
                    View Examples
                  </Button>
                </div>
              </div>

              {/* Component Features */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Role-Based Access Control</h3>
                    <p className="text-sm text-muted-foreground">
                      Components respect user roles (SM, DM, FM, Admin, Cost Analyst) and 
                      show/hide information accordingly.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Async State Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Built-in handling for loading, success, and error states with 
                      customizable messaging and visual feedback.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Audit Trail Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Components support mandatory reason codes and audit logging 
                      for compliance and governance requirements.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Accessibility Compliant</h3>
                    <p className="text-sm text-muted-foreground">
                      WCAG 2.1 AA compliant with keyboard navigation, screen reader 
                      support, and proper semantic markup.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Theme Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Consistent with the design system using CSS custom properties 
                      and Tailwind utility classes.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">TypeScript Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Full TypeScript support with comprehensive type definitions 
                      and IntelliSense integration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Guidelines */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Usage Guidelines</h2>
                <div className="prose prose-sm max-w-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Best Practices</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Use OrderCard for any order summary display</li>
                        <li>• StatusBadge for all status indicators across the system</li>
                        <li>• EnhancedButton for async actions (approve, submit, save)</li>
                        <li>• ApprovalDialog for any action requiring confirmation</li>
                        <li>• Always provide loading states for async operations</li>
                        <li>• Include reason codes for rejection/override actions</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Import Examples</h3>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`import { OrderCard } from '@/components/ui/order-card'
import { StatusBadge } from '@/components/ui/status-badge'  
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { ApprovalDialog } from '@/components/ui/approval-dialog'`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Individual Component Tabs */}
            <TabsContent value="cards">
              <OrderCardDemo />
            </TabsContent>

            <TabsContent value="badges">
              <StatusBadgeDemo />
            </TabsContent>

            <TabsContent value="buttons">
              <EnhancedButtonDemo />
            </TabsContent>

            <TabsContent value="dialogs">
              <ApprovalDialogDemo />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ComponentsDemo