import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-500 text-white shadow-[4px_4px_8px_rgba(59,130,246,0.5),_-4px_-4px_8px_rgba(255,255,255,0.9),_inset_2px_2px_4px_rgba(255,255,255,0.4)] hover:shadow-[2px_2px_4px_rgba(59,130,246,0.5),_-2px_-2px_4px_rgba(255,255,255,0.9),_inset_2px_2px_4px_rgba(255,255,255,0.4)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]": variant === "default",
            "bg-neutral-100 text-neutral-900 shadow-clay hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)]": variant === "outline",
            "hover:bg-neutral-200/50 hover:text-neutral-900": variant === "ghost",
            "h-12 px-6 py-2": size === "default",
            "h-10 rounded-xl px-4": size === "sm",
            "h-14 rounded-3xl px-8": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
