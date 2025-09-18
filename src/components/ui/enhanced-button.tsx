import { ComponentProps, ReactNode, forwardRef } from "react"
import { cva, type VariantProps } from "cla
import { Spinner, Check, X } from "@phosphor-icons/react"
const enhancedButtonVariants = c
import { Spinner, Check, X } from "@phosphor-icons/react"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] relative overflow-hidden",
   
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:bg-accent/95",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95",
        lg: "h-10 rounded-md px-6",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline"
      },
        succe
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
      size: "default",
      },
  }
        default: "",
interface EnhancedButtonProps 
        success: "bg-green-600 hover:bg-green-600 text-white",
  asChild?: boolean
      }
  erro
    defaultVariants: {
  errorText?: string
      size: "default",
      state: "default"
    }
  (
)

interface EnhancedButtonProps 
    loading = false,
         VariantProps<typeof enhancedButtonVariants> {
    loadingText,
  loading?: boolean
    leftIcon,
  error?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
    
    className,
    
    size,
    state,
    asChild = false,
    loading = false,
    success = false,
    const getRight
    loadingText,
      ref={ref} 
    >
    </Enhance
)

  ({ children
      succes
      ref={ref
    >
    
)

  ({
      error 
      ref={ref} 
    >
    </EnhancedButton>
)

  Enh
  Su
  enhancedButtonVarian
}





















































































