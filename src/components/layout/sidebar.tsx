import Link from "next/link"
import { UserMenu } from "@/components/layout/user-menu"
import { createClient } from "@/lib/supabase/server"

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 z-40 bg-surface-container-low shadow-xl dark:shadow-none flex flex-col justify-between p-4 border-r border-outline-variant/30">
      <div className="flex flex-col gap-6">
        {/* Brand & Workspace Header */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          </div>
          <div className="flex flex-col">
            <span className="text-headline-sm font-headline-sm font-bold text-on-surface tracking-tight">De-Marco Studio</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-label-code-sm font-label-code-sm text-on-surface-variant font-medium">Enterprise Tier</span>
            </div>
          </div>
        </div>

        {/* New Campaign CTA Button */}
        <Link href="/dashboard/campaigns/new" className="w-full clay-button-primary text-white font-headline-sm text-body-md font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span className="">New Campaign</span>
        </Link>

        {/* Main Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          {/* Active Link */}
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-body-md shadow-sm">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="">Overview</span>
          </Link>
          <Link href="/dashboard/campaigns" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-150 font-body-md text-body-md">
            <span className="material-symbols-outlined text-[20px]">campaign</span>
            <span className="">Campaigns</span>
            <span className="ml-auto bg-surface-container-high text-primary font-label-code-sm text-label-code-sm px-2 py-0.5 rounded-full font-semibold">14</span>
          </Link>
          <Link href="/dashboard/ai-studio" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-150 font-body-md text-body-md group">
            <span className="material-symbols-outlined text-[20px] text-secondary group-hover:scale-110 transition-transform">auto_awesome</span>
            <span className="">AI Studio</span>
            <span className="ml-auto bg-secondary-fixed text-on-secondary-fixed font-label-code-sm text-label-code-sm px-1.5 py-0.5 rounded-md font-bold">PRO</span>
          </Link>
          <Link href="/dashboard/audiences" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-150 font-body-md text-body-md">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <span className="">Audiences</span>
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-150 font-body-md text-body-md">
            <span className="material-symbols-outlined text-[20px]">insights</span>
            <span className="">Analytics</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-150 font-body-md text-body-md">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="">Settings</span>
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer Telemetry & Profile */}
      <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/30">
        <div className="flex flex-col gap-1">
          <Link href="/dashboard/live-pools" className="flex items-center justify-between px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-body-sm font-body-sm w-full">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">dataset</span>
              <span className="">Live Pools</span>
            </div>
            <span className="flex items-center gap-1 font-label-code-sm text-label-code-sm font-semibold text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
              4 Active
            </span>
          </Link>
          <Link href="/dashboard/docs" className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-body-sm font-body-sm w-full">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span className="">Documentation</span>
          </Link>
        </div>

        {/* User Card */}
        <UserMenu userProfile={profile} />
      </div>
    </aside>
  )
}
