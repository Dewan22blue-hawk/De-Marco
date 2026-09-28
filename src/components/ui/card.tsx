import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border-none bg-neutral-100 text-neutral-900 shadow-clay p-6 dark:bg-neutral-900 dark:text-neutral-50 dark:shadow-clay-dark transition-all duration-300",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
