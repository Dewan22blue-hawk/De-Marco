import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch } from "@/components/layout/global-search"
import { MobileMenuTrigger } from "@/components/layout/mobile-menu-trigger"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export async function Topbar() {
  return (
    <header className="sticky top-0 right-0 z-30 h-16 w-full bg-surface/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm dark:shadow-none flex items-center justify-between px-4 md:px-8 border-b border-outline-variant/30 dark:border-slate-800 gap-4">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        <MobileMenuTrigger />
        <Breadcrumb />
      </div>

      {/* Action Cluster */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden lg:block">
          <GlobalSearch />
        </div>
        {/* Supabase Edge Pulse Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 debossed-well rounded-xl dark:bg-slate-900/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-on-surface uppercase tracking-tight">Supabase Edge</span>
          <span className="text-[11px] text-outline font-medium">38ms</span>
        </div>

        {/* Trailing Icon Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative" title="Tenant Shield">
            <span className="material-symbols-outlined text-[20px]">shield</span>
          </button>
          <button className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative" title="Notifications">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-white dark:ring-slate-950"></span>
          </button>

          {/* Integrated Theme Toggle */}
          <div className="px-1 flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
