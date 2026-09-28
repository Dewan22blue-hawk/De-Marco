"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Search, UserCircle, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { logout } from "@/app/(main)/settings/actions"

export function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use effect to handle clicking outside of dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileOpen])

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-neutral-100/80 backdrop-blur-md sticky top-0 z-10 border-b border-neutral-200/50">
      <div className="flex items-center w-1/2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search campaigns, designs, leads..." 
            className="w-full h-10 pl-10 pr-4 rounded-full bg-neutral-100/50 text-sm border-none shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),_inset_-2px_-2px_5px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-neutral-700 placeholder:text-neutral-400"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-neutral-100 hidden"></span>
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isProfileOpen 
                ? 'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),_inset_-2px_-2px_5px_rgba(255,255,255,0.5)] bg-neutral-200 text-neutral-800'
                : 'shadow-[4px_4px_8px_rgba(0,0,0,0.05),_-4px_-4px_8px_rgba(255,255,255,0.8)] bg-neutral-100 text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <UserCircle size={24} />
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white shadow-lg border border-neutral-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-neutral-100 mb-2">
                <p className="text-sm font-semibold text-neutral-800">My Account</p>
                <p className="text-xs text-neutral-500 truncate">Manage your preferences</p>
              </div>
              
              <Link 
                href="/settings" 
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-blue-600 transition-colors"
              >
                <Settings size={16} className="mr-3" />
                Profile Settings
              </Link>
              
              <form action={logout}>
                <button 
                  type="submit" 
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={16} className="mr-3" />
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
