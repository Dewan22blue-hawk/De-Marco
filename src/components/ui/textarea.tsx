import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border-none bg-neutral-100/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),_inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_6px_6px_10px_rgba(0,0,0,0.1),_inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
