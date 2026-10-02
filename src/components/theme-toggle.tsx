"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center p-1 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 w-[106px] h-[38px] opacity-50">
        <span className="sr-only">Loading theme toggle...</span>
      </div>
    )
  }

  return (
    <div className="relative flex items-center p-1 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 backdrop-blur-md">
      {/* Animated pill background */}
      <div 
        className="absolute left-1 top-1 bottom-1 w-8 bg-white dark:bg-neutral-800 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-neutral-200/60 dark:border-neutral-700/60 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: `translateX(${theme === 'light' ? '0px' : theme === 'dark' ? '32px' : '64px'})`
        }}
      />
      
      <button
        onClick={() => setTheme('light')}
        className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-xl transition-colors duration-300 ${theme === 'light' ? 'text-amber-500 drop-shadow-sm' : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'}`}
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-xl transition-colors duration-300 ${theme === 'dark' ? 'text-indigo-400 drop-shadow-sm' : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'}`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-xl transition-colors duration-300 ${theme === 'system' ? 'text-neutral-700 dark:text-neutral-200 drop-shadow-sm' : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'}`}
        aria-label="System mode"
        title="System mode"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}
