import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-brand-panel text-gray-100 hover:bg-gray-700": variant === "default",
          "border-transparent bg-gray-800 text-gray-100 hover:bg-gray-700": variant === "secondary",
          "border-transparent bg-brand-red text-white hover:bg-brand-red/80": variant === "destructive",
          "text-gray-100": variant === "outline",
          "border-transparent bg-brand-green text-white hover:bg-brand-green/80": variant === "success",
          "border-transparent bg-brand-orange text-white hover:bg-brand-orange/80": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
