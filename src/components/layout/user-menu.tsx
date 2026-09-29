'use client'

import { useState, useRef, useEffect } from 'react'
import { logout } from '@/app/login/actions'
import Link from 'next/link'

export function UserMenu({ userProfile }: { userProfile?: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="clay-surface rounded-2xl p-2.5 flex items-center gap-3 mt-1 w-full hover:brightness-95 dark:hover:brightness-110 transition-all text-left"
      >
        <div className="relative w-9 h-9 rounded-xl bg-surface-container-high overflow-hidden shrink-0 ring-1 ring-white">
          <img 
            className="w-full h-full object-cover" 
            alt="User Avatar" 
            src={userProfile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuATlC_m8QGfbzpjKTkQaXbXMV9Ta8K-DIrKR5alAxd6xPvZ6k3mK3lCI9NZC6D8BSHkczxCtPyU_PkH1GBpC2JXdJH29CugGt6bnj0GvGIkCr0gFaghVKNZKo9LqS8b1EuqxJWpozFauP2imFjyl5HzFkCpKQByJyj-WmrZ7GWmgS8d0FCI_2x5u_V0PxE5nzaeJr6VRP44Cb-wEEw7Zct3mRUvsT6CqHqoPnVkRPkZFIM6UD6xDrv2"} 
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="flex flex-col overflow-hidden text-left">
          <span className="text-body-sm font-headline-sm font-bold text-on-surface truncate">{userProfile?.full_name || 'Administrator'}</span>
          <span className="text-[11px] font-body-sm text-on-surface-variant truncate">{userProfile?.role || 'Lead Growth Architect'}</span>
        </div>
        <span className="material-symbols-outlined text-outline ml-auto text-[18px]">unfold_more</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-surface-container-high rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden flex flex-col z-50">
          <Link 
            href="/dashboard/settings" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-body-sm font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            View Profile
          </Link>
          <div className="h-px bg-outline-variant/30"></div>
          <form action={logout}>
            <button 
              type="submit" 
              className="flex items-center gap-2 px-4 py-3 text-body-sm font-medium text-error hover:bg-error-container hover:text-on-error-container transition-colors w-full text-left"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
