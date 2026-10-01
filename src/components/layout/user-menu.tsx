'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogOut, UserRound, ChevronsUpDown } from 'lucide-react'
import { logout } from '@/app/login/actions'
import type { UserContext } from '@/lib/auth/authorization'
import { cn } from '@/lib/utils'

type UserProfile = Pick<UserContext["profile"], "full_name" | "avatar_asset_id">

export function UserMenu({ userProfile, collapsed = false }: { userProfile?: UserProfile, collapsed?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = userProfile?.full_name || 'Account'
  const initials = displayName.slice(0, 1).toUpperCase()

  return (
    <div className="relative w-full group" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={cn(
          "flex items-center rounded-2xl border border-slate-200 bg-slate-50 text-left transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 w-full",
          collapsed ? "justify-center p-1 border-none bg-transparent hover:bg-surface-container" : "gap-3 p-2.5"
        )}
      >
        <div className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl bg-sky-100 font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300",
          collapsed ? "h-10 w-10" : "h-9 w-9"
        )}>
          {initials}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
        </div>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{displayName}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          </>
        )}
      </button>

      {collapsed && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
          {displayName}
        </div>
      )}

      {isOpen && (
        <div className={cn(
          "absolute z-50 mb-2 flex w-56 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950",
          collapsed ? "bottom-0 left-full ml-2" : "bottom-full left-0"
        )}>
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 md:hidden">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{displayName}</p>
          </div>
          <Link href="/dashboard/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Profile
          </Link>
          <div className="h-px bg-slate-200 dark:bg-slate-800" />
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}