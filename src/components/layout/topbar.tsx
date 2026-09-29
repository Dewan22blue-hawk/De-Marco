import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch } from "@/components/layout/global-search"
export function Topbar() {
  return (
    <header className="sticky top-0 right-0 z-30 h-16 w-full bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md shadow-sm dark:shadow-none flex items-center justify-between px-8 border-b border-outline-variant/30">
      {/* Global Search Well with Cmd+K */}
      <GlobalSearch />

      {/* Action Cluster */}
      <div className="flex items-center gap-4">
        {/* Supabase Edge Pulse Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 debossed-well rounded-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Supabase Edge Active</span>
          <span className="text-label-code-sm font-label-code-sm text-outline">42ms</span>
        </div>

        {/* Trailing Icon Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative" title="Sensors Telemetry">
            <span className="material-symbols-outlined text-[20px]">sensors</span>
          </button>
          <button className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative" title="Notifications">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
          </button>
          
          {/* Our integrated Theme Toggle */}
          <div className="px-1 flex items-center">
             <ThemeToggle />
          </div>
        </div>

        <div className="h-6 w-px bg-outline-variant/40 mx-1"></div>

        {/* Secondary & Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 rounded-xl text-on-surface font-headline-sm text-body-md font-semibold hover:bg-surface-container border border-outline-variant/40 transition-colors shadow-sm">
            Save Draft
          </button>
          <button className="clay-button-primary px-4 py-2 rounded-xl text-white font-headline-sm text-body-md font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span className="">Deploy Campaign</span>
          </button>
        </div>
      </div>
    </header>
  )
}
