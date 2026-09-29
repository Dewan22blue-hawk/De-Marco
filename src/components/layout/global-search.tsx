'use client'

import { useEffect, useRef, useState } from 'react'

export function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Listen for Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex items-center gap-3 w-96">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-[18px] text-outline">search</span>
        </div>
        <input 
          ref={inputRef}
          className="debossed-well w-full pl-10 pr-14 py-2 rounded-xl text-body-md font-body-md text-on-surface placeholder:text-outline border border-outline-variant/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
          placeholder="Search campaigns, models, creative assets..." 
          type="text" 
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="px-1.5 py-0.5 text-label-code-sm font-label-code-sm bg-surface-container-high rounded text-on-surface-variant border border-outline-variant/40">⌘K</kbd>
        </div>
      </div>
    </div>
  )
}
