'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { UserMenu } from "@/components/layout/user-menu"
import { useSidebar } from "./sidebar-provider"
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Palette,
  Users,
  Settings,
  PlusCircle,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Bot,
  Activity,
  Calendar,
  Images,
  LayoutTemplate,
  Crown
} from "lucide-react"
import { cn } from "@/lib/utils"

import { type UserContext } from "@/lib/auth/authorization"

type SidebarClientProps = {
  organizationName?: string;
  userProfile?: Pick<UserContext["profile"], "full_name" | "avatar_asset_id">;
}

export function SidebarClient({ organizationName, userProfile }: SidebarClientProps) {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  // Navigation Sections & Items
  const navSections = [
    {
      title: "Marketing",
      items: [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/dashboard/campaigns', label: 'Campaigns', icon: FolderKanban },
        { href: '/dashboard/contents', label: 'Content Library', icon: Sparkles },
        { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
      ]
    },
    {
      title: "Creative Studio",
      items: [
        { href: '/dashboard/assets', label: 'Asset Library', icon: Images },
        { href: '/dashboard/templates', label: 'AI Templates', icon: LayoutTemplate },
        { href: '/dashboard/designs', label: 'My Designs', icon: Palette },
        { href: '/dashboard/brand', label: 'Brand Kit', icon: Crown },
      ]
    },
    {
      title: "Management",
      items: [
        { href: '/dashboard/settings/members', label: 'Team Access', icon: Users },
        { href: '/dashboard/settings/ai', label: 'AI Settings', icon: Bot },
        { href: '/dashboard/ai/usage', label: 'AI Usage', icon: Activity },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: true },
      ]
    }
  ];

  const renderContent = (isMobile: boolean = false) => {
    // On mobile, we never collapse the drawer content
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <aside className={cn(
        "h-full z-40 bg-surface-container-low shadow-xl dark:shadow-none flex flex-col p-3 md:p-4 border-r border-outline-variant/30 dark:bg-slate-950 dark:border-slate-800 transition-all duration-300 clay-surface select-none",
        collapsed ? "w-20 items-center px-2" : "w-64"
      )}>
        {/* Brand & Workspace Header (Sticky/Pinned Top) */}
        <div className={cn("shrink-0 flex flex-col items-center justify-center gap-2 pt-1 pb-3 w-full", collapsed && "px-1")}>
          <div className="relative group cursor-pointer flex justify-center">
            {/* Subtle premium glow effect on hover */}
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/logo-deraly.png"
              alt="De-Marco Logo"
              width={160}
              height={50}
              className={cn(
                "relative z-10 shrink-0 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-[1.03]",
                collapsed ? "w-10 h-10" : "w-36 h-auto max-h-12 object-center"
              )}
              priority
            />
          </div>
          
          {!collapsed && (
            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-surface-container-high/40 dark:bg-slate-900/40 rounded-full border border-outline-variant/50 backdrop-blur-sm shadow-sm transition-all hover:border-primary/40 hover:bg-surface-container-high/60 cursor-default">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-on-surface font-bold truncate">
                {organizationName || "Enterprise"}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className={cn(
          "flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden flex flex-col gap-3 py-1",
          collapsed ? "px-1 items-center" : "pr-1",
          "[scrollbar-width:thin] [scrollbar-color:rgba(156,163,175,0.25)_transparent]",
          "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-outline-variant/30 hover:[&::-webkit-scrollbar-thumb]:bg-outline-variant/60 [&::-webkit-scrollbar-thumb]:rounded-full"
        )}>
          {/* New Campaign / Template CTA Button */}
          <div className="w-full relative group shrink-0">
            <Link
              href="/dashboard/templates/new"
              onClick={() => isMobile && setIsMobileOpen(false)}
              title={collapsed ? "New Template" : undefined}
              className={cn(
                "clay-button-primary text-white font-semibold rounded-xl flex items-center justify-center transition-all",
                collapsed ? "w-10 h-10 p-0 mx-auto" : "w-full py-2 px-3.5 gap-2 text-sm shadow-sm hover:shadow"
              )}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              {!collapsed && <span>New Template</span>}
            </Link>
            {collapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                New Template
              </div>
            )}
          </div>

          {/* Main Navigation Menu */}
          <nav className="flex flex-col gap-1 w-full">
            {navSections.map((section, sIdx) => (
              <div key={section.title} className="w-full">
                {/* Section Header or Divider */}
                {sIdx > 0 && (
                  collapsed ? (
                    <div className="w-6 h-px bg-outline-variant/30 dark:bg-slate-800 my-2 mx-auto" />
                  ) : (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 dark:text-slate-400 px-3 pt-3 pb-1 select-none">
                      {section.title}
                    </div>
                  )
                )}
                {!collapsed && sIdx === 0 && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 dark:text-slate-400 px-3 pt-1 pb-1 select-none">
                    {section.title}
                  </div>
                )}

                <div className="flex flex-col gap-1 w-full">
                  {section.items.map((item) => {
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                      <div key={item.href} className="relative group w-full flex justify-center">
                        <Link
                          href={item.href}
                          onClick={() => isMobile && setIsMobileOpen(false)}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "flex items-center rounded-xl transition-all duration-150 w-full",
                            collapsed ? "justify-center p-2.5 w-10 h-10" : "px-3 py-2 gap-3 text-sm",
                            isActive
                              ? "bg-primary-container text-on-primary-container font-semibold shadow-sm dark:bg-sky-950/60 dark:text-sky-300"
                              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium hover:translate-x-0.5"
                          )}
                        >
                          <item.icon className={cn("w-4.5 h-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105", isActive && "scale-105 fill-current/20")} />
                          {!collapsed && <span className="whitespace-nowrap truncate">{item.label}</span>}
                        </Link>
                        {collapsed && (
                          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                            {item.label}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer (Pinned Bottom) */}
        <div className={cn(
          "shrink-0 flex flex-col gap-2 pt-2.5 mt-auto border-t border-outline-variant/30 dark:border-slate-800 w-full",
          collapsed && "items-center"
        )}>
          {/* RLS Shield Status */}
          <div className="flex flex-col gap-1 w-full relative group">
            <div className={cn(
              "flex items-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-medium w-full",
              collapsed ? "justify-center p-2" : "justify-between px-3 py-1.5"
            )}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {!collapsed && <span>RLS Shield</span>}
              </div>
              {!collapsed && (
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Active
                </span>
              )}
            </div>
            {collapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 flex items-center gap-2 shadow-md">
                <span>RLS Shield</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Active
                </span>
              </div>
            )}
          </div>

          {/* Toggle Collapse Button (Desktop Only) */}
          {!isMobile && (
            <div className="hidden md:flex w-full relative group">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "flex items-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors w-full",
                  collapsed ? "justify-center p-2" : "justify-between px-3 py-1.5"
                )}
              >
                {!collapsed && <span className="text-xs font-medium">Collapse</span>}
                {collapsed ? <ChevronRight className="w-4.5 h-4.5 shrink-0" /> : <ChevronLeft className="w-4.5 h-4.5 shrink-0" />}
              </button>
              {collapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                  Expand
                </div>
              )}
            </div>
          )}

          {/* User Profile */}
          <div className={cn("w-full", collapsed ? "flex justify-center" : "")}>
            <UserMenu userProfile={userProfile} collapsed={collapsed} />
          </div>
        </div>
      </aside>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen fixed top-0 left-0 z-40">
        {renderContent(false)}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-[60] flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="relative z-[70] h-full"
            >
              <div className="absolute top-4 -right-12">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-full bg-surface text-on-surface shadow-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {renderContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
