"use client"

import { useState, useCallback, useTransition, useEffect } from "react"
import { Search, PlusCircle, LayoutGrid, List, X, Check, FileText, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { CustomSelect } from "@/components/ui/custom-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ContentActions } from "./content-actions"
import { AutoGenerateForm } from "./auto-generate-form"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel, AlertModalAction } from "@/components/ui/alert-modal"

interface Content {
  id: string
  title: string
  body: string | null
  status: string
  platform: string | null
  content_type: string
  created_at: string
  metadata?: any
  content_calendar?: { id: string; scheduled_at: string; status: string }[]
}

export function ContentLibraryClient({ 
  initialContents,
  totalCount,
  search,
  selectedStatus,
  selectedPlatform,
  selectedSort,
  selectedView,
  campaigns = [],
  canLinkCampaigns = false
}: { 
  initialContents: Content[]
  totalCount: number
  search: string
  selectedStatus: string
  selectedPlatform: string
  selectedSort: string
  selectedView: string
  limit: number
  campaigns?: { id: string; name: string }[]
  canLinkCampaigns?: boolean
}) {
  const [contents, setContents] = useState<Content[]>(initialContents)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setContents(initialContents) }, [initialContents])

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
    // Placeholder for actual pagination logic calling listContents action with offset
    console.log("Load more clicked")
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
    if (selectedIds.size === contents.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(contents.map(c => c.id)))
  }

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return
    try {
      // Implement bulkDeleteContents action
      console.log("Bulk delete contents", Array.from(selectedIds))
      setContents(prev => prev.filter(c => !selectedIds.has(c.id)))
      setSelectedIds(new Set())
      setBulkAction(null)
    } catch {
      setErrorMsg("Failed to delete contents")
    }
  }

  return (
    <div className="space-y-6 relative">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center justify-between border border-red-200">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded-lg"><X size={16} /></button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Content Library</h1>
          <p className="text-on-surface-variant mt-1">
            {totalCount} contents &middot; Manage your marketing copies, posts, and articles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/contents/new" className="clay-button-primary px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            New Content
          </Link>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-bold text-on-surface text-lg">AI Content Generator</h2>
        </div>
        <p className="text-on-surface-variant text-sm">
          Stuck on ideas? Let our AI draft your next post, story, or article in seconds.
        </p>
        <AutoGenerateForm campaigns={campaigns} canLinkCampaigns={canLinkCampaigns} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline size-5" />
            <Input
              type="search"
              placeholder="Search contents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search contents"
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
                  { value: "draft", label: "Draft" },
                  { value: "review", label: "In Review" },
                  { value: "approved", label: "Approved" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "published", label: "Published" }
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
                  { value: "newest", label: "Newest" },
                  { value: "title-asc", label: "Title A-Z" },
                  { value: "title-desc", label: "Title Z-A" }
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

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-40 bg-surface-container-high border border-outline-variant/30 shadow-lg rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-on-surface bg-primary/10 px-3 py-1 rounded-lg text-primary">{selectedIds.size} selected</span>
            <button onClick={toggleSelectAll} className="text-sm font-medium text-outline hover:text-on-surface">
              {selectedIds.size === contents.length ? "Deselect all" : "Select all (page)"}
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
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse bg-surface-container-low rounded-xl h-48 border border-outline-variant/10"></div>
          ))}
        </div>
      ) : contents.length === 0 ? (
        <div className="debossed-well rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-outline-variant/20 border-dashed bg-surface-container-lowest">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">
            {searchQuery || statusFilter || platformFilter ? "No contents found" : "No Contents Yet"}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6">
            {searchQuery || statusFilter || platformFilter
              ? "Try adjusting your search or filter criteria."
              : "Generate new content using AI or create one manually to build your library."}
          </p>
          {(searchQuery || statusFilter || platformFilter) ? (
            <Button onClick={() => handleFilterChange({ q: "", status: "", platform: "" })} variant="default">Clear filters</Button>
          ) : (
            <Link href="/dashboard/contents/new" className="clay-button-primary px-6 py-2.5 rounded-lg font-medium text-white">
              Create Content
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
            {contents.map((content) => {
              const isSelected = selectedIds.has(content.id)
              
              if (viewMode === "list") {
                return (
                  <Link href={`/dashboard/contents/${content.id}`} key={content.id} className={`clay-surface rounded-xl p-4 flex items-center gap-4 group transition-colors border ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline/40'}`}>
                    <button 
                      onClick={(e) => toggleSelection(content.id, e)}
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant group-hover:border-primary'}`}
                    >
                      {isSelected && <Check size={14} />}
                    </button>
                    
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-on-surface truncate text-lg group-hover:text-primary transition-colors">
                            {content.title}
                          </h4>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            content.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                            content.status === 'failed' ? 'bg-red-100 text-red-800' :
                            content.status === 'review' ? 'bg-amber-100 text-amber-800' :
                            'bg-secondary-container text-on-secondary-container'
                          }`}>
                            {content.status}
                          </span>
                          {content.status === 'published' && content.metadata?.is_mock === true && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-label-code-sm">MOCK</span>
                          )}
                          {content.content_calendar && content.content_calendar.length > 0 && content.content_calendar[0].status === 'scheduled' && (
                            <span className="flex items-center justify-center text-indigo-600 bg-indigo-50 w-6 h-6 rounded-full" title={`Scheduled for ${new Date(content.content_calendar[0].scheduled_at).toLocaleString()}`}>
                              <span className="material-symbols-outlined text-[14px]">calendar_clock</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant mt-1">
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{content.content_type}</span>
                          <span className="capitalize border-l border-outline-variant/30 pl-3">{content.platform || "No platform"}</span>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center gap-2">
                        <ContentActions contentId={content.id} status={content.status || "draft"} defaultPlatform={content.platform || "instagram"} />
                      </div>
                    </div>
                  </Link>
                )
              }

              // Grid View Card
              return (
                <div key={content.id} className={`clay-card rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden group transition-all duration-300 block border ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}>
                  <button 
                    onClick={(e) => toggleSelection(content.id, e)}
                    className={`absolute top-4 right-4 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white opacity-100' : 'bg-white/80 backdrop-blur-sm border-outline-variant/50 text-transparent opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                  >
                    <Check size={16} className={isSelected ? "block" : "hidden group-hover:block"} />
                  </button>

                  <Link href={`/dashboard/contents/${content.id}`} className="flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-start pr-8">
                      <h3 className="font-semibold text-lg text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{content.title}</h3>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          content.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                          content.status === 'failed' ? 'bg-red-100 text-red-800' :
                          content.status === 'review' ? 'bg-amber-100 text-amber-800' :
                          'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {content.status}
                        </span>
                        {content.status === 'published' && content.metadata?.is_mock === true && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-label-code-sm mt-0.5">MOCK</span>
                        )}
                        {content.content_calendar && content.content_calendar.length > 0 && content.content_calendar[0].status === 'scheduled' && (
                          <span className="flex items-center justify-center text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5" title={`Scheduled for ${new Date(content.content_calendar[0].scheduled_at).toLocaleString()}`}>
                            <span className="material-symbols-outlined text-[12px] mr-1">calendar_clock</span>
                            <span className="text-[10px] font-semibold">Sch</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-3 flex-1 bg-surface-container-lowest p-3 rounded-lg font-mono">
                      {content.body || "No content body."}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mt-auto pt-4 border-t border-outline-variant/20">
                    <div className="flex items-center gap-2 max-w-[50%] truncate">
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="capitalize truncate">{content.content_type} • {content.platform || "Generic"}</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                      <ContentActions contentId={content.id} status={content.status || "draft"} defaultPlatform={content.platform || "instagram"} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {contents.length < totalCount && (
            <div className="flex justify-center mt-8 pb-8">
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoadingMore}
                variant="outline"
                isLoading={isLoadingMore}
              >
                {!isLoadingMore && `Load more (Showing ${contents.length} of ${totalCount})`}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <AlertModal open={bulkAction === "delete"} onOpenChange={(open) => {
        if (!open) {
          if (bulkAction === "delete") setBulkAction(null)
        }
      }}>
        <AlertModalContent>
          <AlertModalHeader>
            <AlertModalTitle>Delete Contents</AlertModalTitle>
            <AlertModalDescription>
              Are you sure you want to delete {selectedIds.size} contents? This action cannot be undone.
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
