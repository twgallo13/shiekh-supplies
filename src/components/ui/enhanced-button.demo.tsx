import { useState } from 'react'
import {
  EnhancedButton
} from './enhanced-button'
import { Plus, ArrowRight, Download, Trash } from '@phosphor-icons/react'

/**
 * EnhancedButton Component Demonstrations
 * 
 * This file showcases different states and variations of the EnhancedButton component
 * used throughout the SupplySync ERP system for interactive actions.
 */

export function EnhancedButtonDemo() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [successStates, setSuccessStates] = useState<Record<string, boolean>>({})
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({})

  const simulateAction = async (key: string, shouldFail = false) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }))

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    setLoadingStates(prev => ({ ...prev, [key]: false }))

    if (shouldFail) {
      setErrorStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setErrorStates(prev => ({ ...prev, [key]: false }))
      }, 3000)
    } else {
      setSuccessStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setSuccessStates(prev => ({ ...prev, [key]: false }))
      }, 3000)
    }
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">EnhancedButton Component States</h1>

      {/* Basic Variants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button Variants</h2>
        <div className="flex flex-wrap gap-3">
          <EnhancedButton variant="primary">Primary</EnhancedButton>
          <EnhancedButton variant="secondary">Secondary</EnhancedButton>
          <EnhancedButton variant="destructive">Destructive</EnhancedButton>
          <EnhancedButton variant="secondary">Secondary</EnhancedButton>
          <EnhancedButton variant="ghost">Ghost</EnhancedButton>
          <EnhancedButton variant="link">Link</EnhancedButton>
        </div>
      </div>

      {/* Size Variations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Size Variations</h2>
        <div className="flex items-center gap-3">
          <EnhancedButton size="sm">Small</EnhancedButton>
          <EnhancedButton size="default">Default</EnhancedButton>
          <EnhancedButton size="lg">Large</EnhancedButton>
          <EnhancedButton size="sm"><Plus /></EnhancedButton>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">With Icons</h2>
        <div className="flex flex-wrap gap-3">
          <EnhancedButton leftIcon={<Plus />}>Add Item</EnhancedButton>
          <EnhancedButton rightIcon={<ArrowRight />}>Continue</EnhancedButton>
          <EnhancedButton leftIcon={<Download />} variant="secondary">Export</EnhancedButton>
          <EnhancedButton leftIcon={<Trash />} variant="destructive">Delete</EnhancedButton>
        </div>
      </div>

      {/* Interactive State Management */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive State Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Approval Button */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Order Approval</h3>
            <EnhancedButton
              loading={loadingStates.approval}
              success={successStates.approval}
              error={errorStates.approval}
              loadingText="Approving..."
              successText="Approved!"
              errorText="Failed"
              onClick={() => simulateAction('approval')}
              className="w-full"
            >
              Approve Order
            </EnhancedButton>
          </div>

          {/* Submit Button */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Form Submission</h3>
            <EnhancedButton
              loading={loadingStates.submit}
              success={successStates.submit}
              error={errorStates.submit}
              loadingText="Submitting..."
              successText="Submitted!"
              errorText="Error"
              onClick={() => simulateAction('submit')}
              className="w-full"
            >
              Submit Form
            </EnhancedButton>
          </div>

          {/* Save Button */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Save Changes</h3>
            <EnhancedButton
              variant="secondary"
              loading={loadingStates.save}
              success={successStates.save}
              error={errorStates.save}
              loadingText="Saving..."
              successText="Saved!"
              errorText="Save Failed"
              onClick={() => simulateAction('save')}
              className="w-full"
            >
              Save Changes
            </EnhancedButton>
          </div>

          {/* Delete Button (Fails) */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Delete Action (Fails)</h3>
            <EnhancedButton
              variant="destructive"
              loading={loadingStates.delete}
              success={successStates.delete}
              error={errorStates.delete}
              loadingText="Deleting..."
              successText="Deleted!"
              errorText="Delete Failed"
              onClick={() => simulateAction('delete', true)}
              className="w-full"
            >
              Delete Item
            </EnhancedButton>
          </div>
        </div>
      </div>

      {/* Predefined Components */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Predefined State Components</h2>
        <div className="flex flex-wrap gap-3">
          <EnhancedButton loading>Loading Button</EnhancedButton>
          <EnhancedButton success>Success Button</EnhancedButton>
          <EnhancedButton error>Error Button</EnhancedButton>
        </div>
      </div>

      {/* Real-world Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Real-world Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Actions */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">Order Management Actions</h3>
            <div className="flex gap-2">
              <EnhancedButton
                size="sm"
                loading={loadingStates.orderApprove}
                success={successStates.orderApprove}
                onClick={() => simulateAction('orderApprove')}
              >
                Approve
              </EnhancedButton>
              <EnhancedButton
                size="sm"
                variant="destructive"
                loading={loadingStates.orderReject}
                error={errorStates.orderReject}
                onClick={() => simulateAction('orderReject', true)}
              >
                Reject
              </EnhancedButton>
              <EnhancedButton
                size="sm"
                variant="secondary"
                leftIcon={<ArrowRight />}
              >
                View Details
              </EnhancedButton>
            </div>
          </div>

          {/* Inventory Actions */}
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium">Inventory Management</h3>
            <div className="flex gap-2">
              <EnhancedButton
                size="sm"
                leftIcon={<Plus />}
                loading={loadingStates.addStock}
                success={successStates.addStock}
                onClick={() => simulateAction('addStock')}
              >
                Add Stock
              </EnhancedButton>
              <EnhancedButton
                size="sm"
                variant="secondary"
                leftIcon={<Download />}
                loading={loadingStates.export}
                success={successStates.export}
                onClick={() => simulateAction('export')}
              >
                Export
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Disabled States */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Disabled States</h2>
        <div className="flex flex-wrap gap-3">
          <EnhancedButton disabled>Disabled Primary</EnhancedButton>
          <EnhancedButton variant="secondary" disabled>Disabled Secondary</EnhancedButton>
          <EnhancedButton variant="secondary" disabled>Disabled Secondary</EnhancedButton>
          <EnhancedButton variant="destructive" disabled>Disabled Destructive</EnhancedButton>
        </div>
      </div>
    </div>
  )
}