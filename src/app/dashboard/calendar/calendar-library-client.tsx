"use client"

import { useState, useCallback, useTransition, useEffect } from "react"
import { Search, PlusCircle, LayoutGrid, List, X, Check, Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { retryCalendarEvent, retryAllFailedCalendarEvents } from "./actions"
import { CustomSelect } from "@/components/ui/custom-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel, AlertModalAction } from "@/components/ui/alert-modal"

interface CalendarEvent {
  id: string
  content_id: string
  scheduled_at: string
  status: string
  platform: string | null
  is_auto_post?: boolean
  claimed_at?: string | null
  content: { title: string; metadata?: any } | null
  campaign: { name: string } | null
}

export function CalendarLibraryClient({ 
  initialEvents,
  totalCount,
  search,
  selectedStatus,
  selectedPlatform,
  selectedSort,
  selectedView
}: { 
  initialEvents: CalendarEvent[]
  totalCount: number
  search: string
  selectedStatus: string
  selectedPlatform: string
  selectedSort: string
  selectedView: string
  limit: number
}) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setEvents(initialEvents) }, [initialEvents])

  const [searchQuery, setSearchQuery] = useState(search)
  const [statusFilter, setStatusFilter] = useState(selectedStatus)
  const [platformFilter, setPlatformFilter] = useState(selectedPlatform)
  const [sortBy, setSortBy] = useState(selectedSort)
  const [viewMode, setViewMode] = useState<"grid" | "list">(selectedView as "grid" | "list")

  const [isSearching, setIsSearching] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<"delete" | null>(null)
  
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [now, setNow] = useState<number | null>(null)
  const [isRetryingAll, setIsRetryingAll] = useState(false)

  const failedEventsCount = events.filter(e => e.status === 'failed').length;

  useEffect(() => {
    setNow(Date.now())
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Calendar specific state
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const [, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const updateUrl = useCallback((newParams: Record<string, string>) => {
    setIsSearching(true)
    const params = new URLSearchParams()
    if (newParams.q) params.set("q", newParams.q)
    if (newParams.status) params.set("status", newParams.status)
    if (newParams.platform) params.set("platform", newParams.platform)
    if (newParams.sort) params.set("sort", newParams.sort)
    if (newParams.view) params.set("view", newParams.view)
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      setIsSearching(false)
    })
  }, [pathname, router])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search) {
        updateUrl({ q: searchQuery, status: statusFilter, platform: platformFilter, sort: sortBy, view: viewMode })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, search, statusFilter, platformFilter, sortBy, viewMode, updateUrl])

  const handleFilterChange = (updates: Record<string, string | undefined>) => {
    const nextQ = updates.q !== undefined ? updates.q : searchQuery
    const nextStatus = updates.status !== undefined ? updates.status : statusFilter
    const nextPlatform = updates.platform !== undefined ? updates.platform : platformFilter
    const nextSort = updates.sort !== undefined ? updates.sort : sortBy
    const nextView = updates.view !== undefined ? updates.view : viewMode
    
    if (updates.status !== undefined) setStatusFilter(nextStatus)
    if (updates.platform !== undefined) setPlatformFilter(nextPlatform)
    if (updates.sort !== undefined) setSortBy(nextSort)
    if (updates.view !== undefined) setViewMode(nextView as "grid" | "list")
    if (updates.q !== undefined) setSearchQuery(nextQ)
    
    updateUrl({ q: nextQ, status: nextStatus, platform: nextPlatform, sort: nextSort, view: nextView })
  }

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    // Placeholder
    setIsLoadingMore(false)
  }

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(events.map(c => c.id)))
  }

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return
    try {
      // Implement bulk delete calendar events action
      setEvents(prev => prev.filter(c => !selectedIds.has(c.id)))
      setSelectedIds(new Set())
      setBulkAction(null)
    } catch {
      setErrorMsg("Failed to delete events")
    }
  }

  const handleRetry = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await retryCalendarEvent(id)
      setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'scheduled' } : ev))
    } catch (err: any) {
      setErrorMsg("Failed to retry: " + err.message)
    }
  }

  const handleRetryAllFailed = async () => {
    setIsRetryingAll(true)
    setErrorMsg(null)
    try {
      await retryAllFailedCalendarEvents()
      setEvents(prev => prev.map(ev => ev.status === 'failed' ? { ...ev, status: 'scheduled' } : ev))
    } catch (err: any) {
      setErrorMsg("Failed to retry all: " + err.message)
    } finally {
      setIsRetryingAll(false)
    }
  }

  // Generate calendar days for Grid View
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const days: (Date | null)[] = Array.from({ length: firstDayOfMonth }, () => null)
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentYear, currentMonth, i))
  }
  const today = new Date()
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() && 
    date.getMonth() === today.getMonth() && 
    date.getFullYear() === today.getFullYear()

  return (
    <div className="space-y-6 relative">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center justify-between border border-red-200">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded-lg"><X size={16} /></button>
        </div>
      )}

      {failedEventsCount > 0 && (
        <div className="bg-red-50 text-red-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between border border-red-200 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{failedEventsCount} publishing failed. View details below.</span>
          </div>
          <Button 
            onClick={handleRetryAllFailed} 
            disabled={isRetryingAll}
            isLoading={isRetryingAll}
            variant="outline"
            size="sm"
            className="text-red-700 hover:text-red-800 border-red-300 hover:bg-red-100 bg-white whitespace-nowrap"
          >
            {!isRetryingAll && "Retry All Failed"}
          </Button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Content Calendar</h1>
          <p className="text-on-surface-variant mt-1">
            {totalCount} scheduled events &middot; Manage and track your marketing content schedule.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/calendar/new" className="clay-button-primary px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Schedule Content
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline size-5" />
            <Input
              type="search"
              placeholder="Search schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search schedule"
              className="w-full pl-12 pr-12"
            />
            {isSearching && <div className="absolute right-12 top-1/2 -translate-y-1/2 text-primary"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
            {searchQuery && !isSearching && (
              <button onClick={() => handleFilterChange({ q: "" })} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" aria-label="Clear search">
                <X size={18} />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="w-36 z-30">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => handleFilterChange({ status: val })}
                placeholder="All Status"
                options={[
                  { value: "", label: "All Status" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "queued", label: "Queued" },
                  { value: "published", label: "Published" },
                  { value: "failed", label: "Failed" }
                ]}
              />
            </div>

            <div className="w-36 z-20">
              <CustomSelect
                value={platformFilter}
                onChange={(val) => handleFilterChange({ platform: val })}
                placeholder="All Platforms"
                options={[
                  { value: "", label: "All Platforms" },
                  { value: "instagram", label: "Instagram" },
                  { value: "facebook", label: "Facebook" },
                  { value: "linkedin", label: "LinkedIn" },
                  { value: "whatsapp", label: "WhatsApp" },
                  { value: "website", label: "Website / Blog" },
                  { value: "other", label: "Other" }
                ]}
              />
            </div>

            <div className="w-32 z-10">
              <CustomSelect
                value={sortBy}
                onChange={(val) => handleFilterChange({ sort: val })}
                placeholder="Sort by"
                options={[
                  { value: "newest", label: "Date (Newest)" },
                  { value: "oldest", label: "Date (Oldest)" }
                ]}
              />
            </div>

            <div className="flex bg-surface-container-low rounded-2xl p-1 border border-outline-variant/30 shrink-0">
              <button onClick={() => handleFilterChange({ view: "grid" })} className={`p-2 rounded-xl transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-outline hover:text-on-surface"}`} aria-label="Grid view">
                <LayoutGrid size={20} />
              </button>
              <button onClick={() => handleFilterChange({ view: "list" })} className={`p-2 rounded-xl transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-outline hover:text-on-surface"}`} aria-label="List view">
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (Only in List View for simplicity, though could apply to grid) */}
      {selectedIds.size > 0 && viewMode === "list" && (
        <div className="sticky top-4 z-40 bg-surface-container-high border border-outline-variant/30 shadow-lg rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-on-surface bg-primary/10 px-3 py-1 rounded-lg text-primary">{selectedIds.size} selected</span>
            <button onClick={toggleSelectAll} className="text-sm font-medium text-outline hover:text-on-surface">
              {selectedIds.size === events.length ? "Deselect all" : "Select all (page)"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setBulkAction("delete")}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
            >
              Delete
            </Button>
            <button onClick={() => setSelectedIds(new Set())} className="p-2 text-outline hover:text-on-surface ml-2" aria-label="Cancel bulk actions">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {isSearching ? (
        <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-7 gap-4"}>
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="animate-pulse bg-surface-container-low rounded-xl h-24 border border-outline-variant/10"></div>
          ))}
        </div>
      ) : events.length === 0 && !isSearching && viewMode === "list" ? (
        <div className="debossed-well rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-outline-variant/20 border-dashed bg-surface-container-lowest">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <CalendarIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">
            {searchQuery || statusFilter || platformFilter ? "No scheduled events found" : "No Scheduled Content"}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6">
            {searchQuery || statusFilter || platformFilter
              ? "Try adjusting your search or filter criteria."
              : "Start scheduling your contents and designs to view them here."}
          </p>
          {(searchQuery || statusFilter || platformFilter) ? (
            <Button onClick={() => handleFilterChange({ q: "", status: "", platform: "" })} variant="default">Clear filters</Button>
          ) : (
            <Link href="/dashboard/calendar/new" className="clay-button-primary px-6 py-2.5 rounded-lg font-medium text-white">
              Schedule Now
            </Link>
          )}
        </div>
      ) : viewMode === "list" ? (
        <>
          <div className="flex flex-col gap-4">
            {events.map((event) => {
              const isSelected = selectedIds.has(event.id)
              
              return (
                <Link href={`/dashboard/contents/${event.content_id}`} key={event.id} className={`clay-surface rounded-xl p-4 flex items-center gap-4 group transition-colors border ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline/40'}`}>
                  <button 
                    onClick={(e) => toggleSelection(event.id, e)}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant group-hover:border-primary'}`}
                  >
                    {isSelected && <Check size={14} />}
                  </button>
                  
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-surface-container text-on-surface flex flex-col items-center justify-center shrink-0 shadow-sm border border-outline-variant/20">
                        <span className="text-[10px] font-bold uppercase text-outline">{new Date(event.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-lg font-black leading-none">{new Date(event.scheduled_at).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface truncate text-lg group-hover:text-primary transition-colors">
                          {event.content?.title || "Untitled Content"}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-1">
                          <span className="capitalize">{event.platform || 'Unspecified'}</span>
                          {event.campaign && (
                            <>
                              <span>•</span>
                              <span>{event.campaign.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      {event.is_auto_post && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">Auto Post</span>
                      )}
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                        event.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                        event.status === 'queued' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-surface-container text-on-surface-variant border-outline-variant/30'
                      }`}>
                        {event.status}
                        {event.status === 'queued' && event.claimed_at && now && (
                          <span className="ml-1 text-[10px] opacity-80">
                            ({Math.round((now - new Date(event.claimed_at).getTime()) / 60000)}m ago)
                          </span>
                        )}
                      </span>
                      {event.status === 'published' && event.content?.metadata?.is_mock && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                          MOCK
                        </span>
                      )}
                      {(event.status === 'failed' || event.status === 'queued') && (
                        <Button variant="outline" size="sm" onClick={(e) => handleRetry(event.id, e)}>
                          {event.status === 'queued' ? 'Reclaim' : 'Retry'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          {events.length < totalCount && (
            <div className="flex justify-center mt-8 pb-8">
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoadingMore}
                variant="outline"
                isLoading={isLoadingMore}
              >
                {!isLoadingMore && `Load more (Showing ${events.length} of ${totalCount})`}
              </Button>
            </div>
          )}
        </>
      ) : (
        /* GRID VIEW */
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-sm text-on-surface-variant py-2">
                {day}
              </div>
            ))}
            
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="min-h-[120px] rounded-xl bg-surface-container-lowest/50 border border-transparent" />
              
              // Find events for this day
              const dayEvents = events.filter(e => {
                const eventDate = new Date(e.scheduled_at)
                return eventDate.getDate() === date.getDate() &&
                       eventDate.getMonth() === date.getMonth() &&
                       eventDate.getFullYear() === date.getFullYear()
              })

              return (
                <div key={i} className={`min-h-[120px] p-2 rounded-xl border transition-all ${
                  isToday(date) 
                    ? 'border-primary/50 bg-primary/5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_2px_8px_rgba(var(--color-primary-rgb),0.1)]' 
                    : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                      isToday(date) ? 'bg-primary text-on-primary' : 'text-on-surface'
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    {dayEvents.map(event => (
                      <Link 
                        href={`/dashboard/contents/${event.content_id}`} 
                        key={event.id}
                        className="flex flex-col gap-1 p-2 rounded-lg bg-surface text-xs border border-outline-variant/30 hover:border-primary/50 hover:shadow-sm transition-all group"
                      >
                        <div className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                          {event.content?.title || 'Untitled'}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-on-surface-variant font-medium capitalize flex items-center gap-1 truncate">
                            <FileText className="w-3 h-3 shrink-0" />
                            {event.platform || 'General'}
                            {event.is_auto_post && <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">Auto</span>}
                          </span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            event.status === 'published' ? 'bg-emerald-500' :
                            event.status === 'failed' ? 'bg-red-500' :
                            event.status === 'queued' ? 'bg-amber-500' : 'bg-primary'
                          }`} title={event.status} />
                        </div>
                        {event.status === 'published' && event.content?.metadata?.is_mock && (
                          <div className="mt-1">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-200">
                              MOCK
                            </span>
                          </div>
                        )}
                        {event.status === 'queued' && event.claimed_at && now && (
                          <div className="text-[9px] text-amber-700/80 leading-none mb-1">
                            Claimed {Math.round((now - new Date(event.claimed_at).getTime()) / 60000)}m ago
                          </div>
                        )}
                        {(event.status === 'failed' || event.status === 'queued') && (
                          <div className="mt-1">
                            <button 
                              onClick={(e) => handleRetry(event.id, e)} 
                              className={`text-[10px] px-2 py-0.5 rounded w-full font-medium transition-colors ${
                                event.status === 'failed' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {event.status === 'queued' ? 'Reclaim' : 'Retry'}
                            </button>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AlertModal open={bulkAction === "delete"} onOpenChange={(open) => {
        if (!open && bulkAction === "delete") setBulkAction(null)
      }}>
        <AlertModalContent>
          <AlertModalHeader>
            <AlertModalTitle>Delete Events</AlertModalTitle>
            <AlertModalDescription>
              Are you sure you want to delete {selectedIds.size} scheduled events? This action cannot be undone.
            </AlertModalDescription>
          </AlertModalHeader>
          <AlertModalFooter>
            <AlertModalCancel>Cancel</AlertModalCancel>
            <AlertModalAction className="bg-red-600 hover:bg-red-700" onClick={confirmBulkDelete}>
              Delete
            </AlertModalAction>
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>
    </div>
  )
}
