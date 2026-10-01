'use client'

import React from "react"
import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"

export function MainContentWrapper({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className={cn(
      "transition-all duration-300 w-full min-w-0",
      isCollapsed ? "md:ml-20" : "md:ml-64",
      className
    )}>
      {children}
    </div>
  )
}
