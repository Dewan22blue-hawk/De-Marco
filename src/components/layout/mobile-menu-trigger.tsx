'use client'

import { Menu } from "lucide-react"
import { useSidebar } from "./sidebar-provider"

export function MobileMenuTrigger() {
  const { setIsMobileOpen } = useSidebar();
  
  return (
    <button 
      onClick={() => setIsMobileOpen(true)}
      className="md:hidden p-2 -ml-2 mr-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}
