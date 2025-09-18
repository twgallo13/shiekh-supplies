import { ComponentProps, ReactNode, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Spinner, Check, X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:bg-accent/95",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95",
        success: "bg-green-600 hover:bg-green-700 text-white",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6"
      },
      state: {
        default: "",
        loading: "opacity-80 cursor-not-allowed",
        success: "bg-green-600 hover:bg-green-700",
        error: "bg-red-600 hover:bg-red-700"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      state: "default"
    }
  }
)

interface EnhancedButtonProps extends ComponentProps<"button">, VariantProps<typeof enhancedButtonVariants> {
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

    const getDisplayText = () => {
      if (loading && loadingText) return loadingText
      if (success && successText) return successText
      if (error && errorText) return errorText
      return children
    }

    const getRightIcon = () => {
      if (loading) return <Spinner className="animate-spin" />
      if (success) return <Check />
      if (error) return <X />
      return rightIcon
    }

    const currentState = loading ? "loading" : success ? "success" : error ? "error" : state

    return (
      <button
        className={cn(enhancedButtonVariants({ variant, size, state: currentState, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {leftIcon}
        {getDisplayText()}
        {getRightIcon()}
      </button>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, enhancedButtonVariants, type EnhancedButtonProps }





















































































