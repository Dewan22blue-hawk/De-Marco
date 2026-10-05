"use client"

import { useState, useCallback, useTransition, useEffect } from "react"
import { Search, PlusCircle, LayoutGrid, List, X, Check } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { CustomSelect } from "@/components/ui/custom-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel, AlertModalAction } from "@/components/ui/alert-modal"

// Temporary mock type based on supabase campaigns table
interface Campaign {
  id: string
  name: string
  description: string | null
  objective: string | null
  status: string
  code: string
  start_date: string | null
  end_date: string | null
  // We'll assume the query also pulls a count of associated contents for UI purposes
  contents?: { count: number }[] | { count: number } | null
}

export function CampaignLibraryClient({ 
  initialCampaigns,
  totalCount,
  search,
  selectedStatus,
  selectedSort,
  selectedView
}: { 
  initialCampaigns: Campaign[]
  totalCount: number
  search: string
  selectedStatus: string
  selectedSort: string
  selectedView: string
  limit: number
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCampaigns(initialCampaigns) }, [initialCampaigns])

  const [searchQuery, setSearchQuery] = useState(search)
  const [statusFilter, setStatusFilter] = useState(selectedStatus)
  const [sortBy, setSortBy] = useState(selectedSort)
  const [viewMode, setViewMode] = useState<"grid" | "list">(selectedView as "grid" | "list")

  const [isSearching, setIsSearching] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
        updateUrl({ q: searchQuery, status: statusFilter, sort: sortBy, view: viewMode })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, search, statusFilter, sortBy, viewMode, updateUrl])

  const handleFilterChange = (updates: Record<string, string | undefined>) => {
    const nextQ = updates.q !== undefined ? updates.q : searchQuery
    const nextStatus = updates.status !== undefined ? updates.status : statusFilter
    const nextSort = updates.sort !== undefined ? updates.sort : sortBy
    const nextView = updates.view !== undefined ? updates.view : viewMode
    
    if (updates.status !== undefined) setStatusFilter(nextStatus)
    if (updates.sort !== undefined) setSortBy(nextSort)
    if (updates.view !== undefined) setViewMode(nextView as "grid" | "list")
    if (updates.q !== undefined) setSearchQuery(nextQ)
    
    updateUrl({ q: nextQ, status: nextStatus, sort: nextSort, view: nextView })
  }

  // Handle pagination (Load More)
  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      // In a real app, this would call a server action `listCampaigns` with offset
      // For this refactor, we simulate it or leave a placeholder since `listCampaigns` isn't fully client-side exposed yet with pagination props
      console.log("Load more clicked. Needs server action binding.")
      setIsLoadingMore(false)
    } catch {
      setErrorMsg("Failed to load more campaigns")
      setIsLoadingMore(false)
    }
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
    if (selectedIds.size === campaigns.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(campaigns.map(c => c.id)))
  }

  const confirmDelete = async () => {
    if (!deletingId && !bulkAction) return
    try {
      if (bulkAction === "delete") {
        // Implement bulkDeleteCampaigns server action
        const ids = Array.from(selectedIds)
        console.log("Bulk delete", ids)
        setCampaigns(prev => prev.filter(c => !selectedIds.has(c.id)))
        setSelectedIds(new Set())
        setBulkAction(null)
      } else if (deletingId) {
        // Implement deleteCampaign server action
        console.log("Delete", deletingId)
        setCampaigns(prev => prev.filter(c => c.id !== deletingId))
        setDeletingId(null)
      }
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to delete campaign(s)")
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
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Campaigns</h1>
          <p className="text-on-surface-variant mt-1">
            {totalCount} campaigns &middot; Manage your marketing campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/campaigns/new" className="clay-button-primary px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            New Campaign
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
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search campaigns"
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
            <div className="w-40 z-20">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => handleFilterChange({ status: val })}
                placeholder="All Status"
                options={[
                  { value: "", label: "All Status" },
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" },
                  { value: "archived", label: "Archived" }
                ]}
              />
            </div>

            <div className="w-36 z-10">
              <CustomSelect
                value={sortBy}
                onChange={(val) => handleFilterChange({ sort: val })}
                placeholder="Sort by"
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "name-asc", label: "Name A-Z" },
                  { value: "name-desc", label: "Name Z-A" }
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
              {selectedIds.size === campaigns.length ? "Deselect all" : "Select all (page)"}
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
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-surface-container-low rounded-xl h-40 border border-outline-variant/10"></div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="debossed-well rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-outline-variant/20 border-dashed bg-surface-container-lowest">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <PlusCircle size={40} />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">
            {searchQuery || statusFilter ? "No campaigns found" : "No Campaigns Yet"}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first marketing campaign."}
          </p>
          {(searchQuery || statusFilter) ? (
            <Button onClick={() => handleFilterChange({ q: "", status: "" })} variant="default">Clear filters</Button>
          ) : (
            <Link href="/dashboard/campaigns/new" className="clay-button-primary px-6 py-2.5 rounded-lg font-medium text-white">
              Create Campaign
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {campaigns.map((campaign) => {
              const isSelected = selectedIds.has(campaign.id)
              
              if (viewMode === "list") {
                return (
                  <Link href={`/dashboard/campaigns/${campaign.id}`} key={campaign.id} className={`clay-surface rounded-xl p-4 flex items-center gap-4 group transition-colors border ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline/40'}`}>
                    <button 
                      onClick={(e) => toggleSelection(campaign.id, e)}
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant group-hover:border-primary'}`}
                      aria-label={isSelected ? "Deselect campaign" : "Select campaign"}
                    >
                      {isSelected && <Check size={14} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-on-surface truncate text-lg group-hover:text-primary transition-colors">
                          {campaign.name}
                        </h4>
                        <span className="text-xs font-medium px-2 py-1 bg-primary-container text-on-primary-container rounded-full">
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-on-surface-variant mt-1">
                        <span className="font-mono text-xs px-2 py-0.5 bg-surface-container rounded-md">{campaign.code}</span>
                        <span className="capitalize">{campaign.objective || "No objective"}</span>
                        {campaign.contents && (
                          <span className="text-xs border-l border-outline-variant/30 pl-3">
                            {Array.isArray(campaign.contents) ? campaign.contents.length : campaign.contents?.count || 0} contents
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              }

              // Grid View Card
              return (
                <div key={campaign.id} className={`clay-card rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden group transition-all duration-300 block border ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}>
                  <button 
                    onClick={(e) => toggleSelection(campaign.id, e)}
                    className={`absolute top-4 right-4 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white opacity-100' : 'bg-white/80 backdrop-blur-sm border-outline-variant/50 text-transparent opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                    aria-label={isSelected ? "Deselect campaign" : "Select campaign"}
                  >
                    <Check size={16} className={isSelected ? "block" : "hidden group-hover:block"} />
                  </button>

                  <Link href={`/dashboard/campaigns/${campaign.id}`} className="flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-start pr-8">
                      <h3 className="font-semibold text-lg text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{campaign.name}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-primary-container text-on-primary-container rounded-full">
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant line-clamp-2 flex-1">{campaign.description || "No description provided."}</p>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mt-auto pt-4 border-t border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-surface-container px-2 py-1 rounded-md">{campaign.code}</span>
                        <span className="capitalize truncate max-w-[100px]">{campaign.objective || "No objective"}</span>
                      </div>
                      {campaign.contents && (
                        <span className="bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant/30">
                          {Array.isArray(campaign.contents) ? campaign.contents.length : campaign.contents?.count || 0} contents
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
          {campaigns.length < totalCount && (
            <div className="flex justify-center mt-8 pb-8">
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoadingMore}
                variant="outline"
                isLoading={isLoadingMore}
              >
                {!isLoadingMore && `Load more (Showing ${campaigns.length} of ${totalCount})`}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <AlertModal open={deletingId !== null || bulkAction === "delete"} onOpenChange={(open) => {
        if (!open) {
          if (deletingId) setDeletingId(null)
          if (bulkAction === "delete") setBulkAction(null)
        }
      }}>
        <AlertModalContent>
          <AlertModalHeader>
            <AlertModalTitle>Delete Campaign{bulkAction === "delete" ? "s" : ""}</AlertModalTitle>
            <AlertModalDescription>
              Are you sure you want to delete {bulkAction === "delete" ? `${selectedIds.size} campaigns` : "this campaign"}?
              This action cannot be undone. Associated contents will not be deleted but will lose their association.
            </AlertModalDescription>
          </AlertModalHeader>
          <AlertModalFooter>
            <AlertModalCancel>Cancel</AlertModalCancel>
            <AlertModalAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertModalAction>
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>

    </div>
  )
}
