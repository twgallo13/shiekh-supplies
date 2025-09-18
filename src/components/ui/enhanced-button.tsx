import { ComponentProps, ReactNode, forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Spinner, Check, X } from "@phosphor-icons/react"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:bg-accent/95",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95",
        outline: "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9"
      },
      state: {
        default: "",
        loading: "cursor-wait",
        success: "bg-green-600 hover:bg-green-600 text-white",
        error: "bg-red-600 hover:bg-red-600 text-white"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      state: "default"
    }
  }
)

interface EnhancedButtonProps 
  extends ComponentProps<"button">, 
         VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  success?: boolean
  error?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    className,
    variant,
    size,
    state,
    asChild = false,
    loading = false,
    success = false,
    error = false,
    loadingText,
    successText,
    errorText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Determine current state
    const currentState = loading ? "loading" : success ? "success" : error ? "error" : state || "default"
    
    // Determine text content
    const getContent = () => {
      if (loading && loadingText) return loadingText
      if (success && successText) return successText  
      if (error && errorText) return errorText
      return children
    }
    
    // Determine icons
    const getLeftIcon = () => {
      if (loading) return <Spinner className="animate-spin" />
      if (success) return <Check />
      if (error) return <X />
      return leftIcon
    }
    
    const getRightIcon = () => {
      if (loading || success || error) return null
      return rightIcon
    }

    return (
      <Comp
        className={cn(
          enhancedButtonVariants({ 
            variant: currentState === "success" || currentState === "error" ? "primary" : variant, 
            size, 
            state: currentState 
          }), 
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {getLeftIcon()}
        {getContent()}
        {getRightIcon()}
      </Comp>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

// Convenience components for specific use cases
const LoadingButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'loading'>>(
  ({ children, loadingText = "Loading...", ...props }, ref) => (
    <EnhancedButton 
      loading 
      loadingText={loadingText} 
      ref={ref} 
      {...props}
    >
      {children}
    </EnhancedButton>
  )
)
LoadingButton.displayName = "LoadingButton"

const SuccessButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'success'>>(
  ({ children, successText = "Success!", ...props }, ref) => (
    <EnhancedButton 
      success 
      successText={successText} 
      ref={ref} 
      {...props}
    >
      {children}
    </EnhancedButton>
  )
)
SuccessButton.displayName = "SuccessButton"

const ErrorButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'error'>>(
  ({ children, errorText = "Error", ...props }, ref) => (
    <EnhancedButton 
      error 
      errorText={errorText} 
      ref={ref} 
      {...props}
    >
      {children}
    </EnhancedButton>
  )
)
ErrorButton.displayName = "ErrorButton"

export { 
  EnhancedButton, 
  LoadingButton, 
  SuccessButton, 
  ErrorButton, 
  enhancedButtonVariants,
  type EnhancedButtonProps 
}