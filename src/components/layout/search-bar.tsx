"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect, useTransition } from "react"

export function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get("query") || "")

  // Debounce the search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (query) {
          params.set("query", query)
        } else {
          params.delete("query")
        }
        // reset page when searching
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query, router, pathname, searchParams])

  return (
    <div className="relative flex-1 max-w-md w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
      <input 
        type="text" 
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-10 py-2 bg-surface rounded-lg border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
