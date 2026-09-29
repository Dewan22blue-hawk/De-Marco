import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  text?: string
}

export function Loading({ size = 24, text, className, ...props }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)} {...props}>
      <Loader2 size={size} className="animate-spin text-blue-500" />
      {text && <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{text}</p>}
    </div>
  )
}
