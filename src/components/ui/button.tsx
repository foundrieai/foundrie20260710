import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold uppercase tracking-[0.12em] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] text-[#12060a] shadow-[0_0_28px_rgba(255,48,0,0.28)] hover:opacity-95 hover:shadow-[0_0_44px_rgba(255,48,0,0.36)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white/15 bg-black/20 text-white hover:border-[#ff7a00]/60 hover:bg-white/5 hover:text-white hover:shadow-[0_0_28px_rgba(255,48,0,0.18)]",
        secondary:
          "border border-white/10 bg-white/5 text-white hover:bg-white/10",
        ghost: "text-white/72 hover:bg-white/5 hover:text-white",
        link: "text-[#ff7a00] underline-offset-4 hover:text-white hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function withActionArrow(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') {
    const trimmed = children.trimEnd()
    return trimmed.endsWith('>') ? children : `${trimmed} >`
  }

  if (Array.isArray(children)) {
    for (let index = children.length - 1; index >= 0; index -= 1) {
      if (typeof children[index] === 'string' && children[index].trim()) {
        const next = [...children]
        next[index] = withActionArrow(children[index])
        return next
      }
    }
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    const childContent = children.props.children
    if (typeof childContent === 'string' || Array.isArray(childContent)) {
      return React.cloneElement(children, {
        children: withActionArrow(childContent),
      })
    }
  }

  return children
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {size === 'icon' ? children : withActionArrow(children)}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
