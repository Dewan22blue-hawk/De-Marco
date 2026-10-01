"use client"

import { useState, useCallback, useTransition, useEffect, useRef } from "react"
import { Search, ImagePlus, MoreVertical, Edit2, Trash2, Download, ChevronDown, Tag, X, LayoutGrid, List, FileText, FileVideo, FileAudio, FileArchive, File as FileIcon, Check, Copy, CheckCircle2 } from "lucide-react"
import { AssetUploader } from "@/components/features/assets/AssetUploader"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { deleteAsset, renameAsset, updateAssetTags, listAssets, bulkDeleteAssets, bulkUpdateAssets } from "./actions"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel, AlertModalAction } from "@/components/ui/alert-modal"
import { CustomSelect } from "@/components/ui/custom-select"

interface Asset {
  id: string
  name: string
  mime_type: string
  file_size: number
  width: number | null
  height: number | null
  asset_type: string
  category: { name: string; slug: string } | null
  storage_path: string
  created_at: string
  tags: string[]
}

interface Category {
  id: string
  name: string
  slug: string
}

export function AssetLibraryClient({ 
  initialAssets, 
  totalCount,
  categories,
  search,
  selectedCategory,
  selectedType,
  selectedSort,
  selectedView,
  organizationId,
  limit
}: { 
  initialAssets: Asset[]
  totalCount: number
  categories: Category[]
  search: string
  selectedCategory: string
  selectedType: string
  selectedSort: string
  selectedView: string
  organizationId: string
  limit: number
}) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  useEffect(() => { setAssets(initialAssets) }, [initialAssets])
  
  const [searchQuery, setSearchQuery] = useState(search)
  const [selectedCat, setSelectedCat] = useState(selectedCategory)
  const [selectedAssetType, setSelectedAssetType] = useState(selectedType)
  const [sortBy, setSortBy] = useState(selectedSort)
  const [viewMode, setViewMode] = useState<"grid" | "list">(selectedView as "grid" | "list")
  
  const [isSearching, setIsSearching] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<"delete" | "move" | null>(null)
  const [bulkTargetCategory, setBulkTargetCategory] = useState<string>("")
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const updateUrl = useCallback((newParams: Record<string, string>) => {
    setIsSearching(true)
    const params = new URLSearchParams()
    if (newParams.q) params.set("q", newParams.q)
    if (newParams.category) params.set("category", newParams.category)
    if (newParams.type) params.set("type", newParams.type)
    if (newParams.sort) params.set("sort", newParams.sort)
    if (newParams.view) params.set("view", newParams.view)
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      setIsSearching(false)
      setPage(0)
    })
  }, [pathname, router])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search) {
        updateUrl({ q: searchQuery, category: selectedCat, type: selectedAssetType, sort: sortBy, view: viewMode })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, search, selectedCat, selectedAssetType, sortBy, viewMode, updateUrl])

  const handleFilterChange = (updates: any) => {
    const nextQ = updates.q !== undefined ? updates.q : searchQuery
    const nextCat = updates.category !== undefined ? updates.category : selectedCat
    const nextType = updates.type !== undefined ? updates.type : selectedAssetType
    const nextSort = updates.sort !== undefined ? updates.sort : sortBy
    const nextView = updates.view !== undefined ? updates.view : viewMode
    
    if (updates.category !== undefined) setSelectedCat(nextCat)
    if (updates.type !== undefined) setSelectedAssetType(nextType)
    if (updates.sort !== undefined) setSortBy(nextSort)
    if (updates.view !== undefined) setViewMode(nextView as "grid" | "list")
    if (updates.q !== undefined) setSearchQuery(nextQ)
    
    updateUrl({ q: nextQ, category: nextCat, type: nextType, sort: nextSort, view: nextView })
  }

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    const nextPage = page + 1
    try {
      const res = await listAssets({
        search: searchQuery,
        category_id: selectedCat || undefined,
        asset_type: selectedAssetType || undefined,
        sort_by: sortBy === "name-asc" ? "name" : sortBy.includes("size") ? "file_size" : "created_at",
        sort_dir: sortBy.includes("-asc") ? "asc" : "desc",
        limit,
        offset: nextPage * limit
      })
      if (res.data.length > 0) {
        setAssets(prev => [...prev, ...res.data])
        setPage(nextPage)
      }
    } catch (err: any) {
      setErrorMsg("Failed to load more assets")
    } finally {
      setIsLoadingMore(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    const id = deletingId
    try {
      await deleteAsset(id)
      setAssets(prev => prev.filter(a => a.id !== id))
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete asset")
    } finally {
      setDeletingId(null)
    }
  }

  const handleBulkAction = async () => {
    if (selectedIds.size === 0 || !bulkAction) return
    const ids = Array.from(selectedIds)
    try {
      if (bulkAction === "delete") {
        await bulkDeleteAssets(ids)
        setAssets(prev => prev.filter(a => !selectedIds.has(a.id)))
      } else if (bulkAction === "move" && bulkTargetCategory) {
        await bulkUpdateAssets(ids, { category_id: bulkTargetCategory })
        const targetCatObj = categories.find(c => c.id === bulkTargetCategory) || null
        setAssets(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, category: targetCatObj } : a))
      }
      setSelectedIds(new Set())
      setBulkAction(null)
    } catch (err: any) {
      setErrorMsg(err.message || "Bulk action failed")
    }
  }

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === assets.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(assets.map(a => a.id)))
  }

  const handleRename = async (assetId: string, newName: string) => {
    try {
      await renameAsset(assetId, newName)
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, name: newName } : a))
      if (previewAsset?.id === assetId) {
        setPreviewAsset(prev => prev ? { ...prev, name: newName } : null)
      }
    } catch (err) {
      console.error("Rename failed:", err)
    }
    setRenamingId(null)
  }

  const handleUpdateTags = async (assetId: string, tags: string[]) => {
    try {
      await updateAssetTags(assetId, tags)
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, tags } : a))
      if (previewAsset?.id === assetId) {
        setPreviewAsset(prev => prev ? { ...prev, tags } : null)
      }
    } catch (err) {
      console.error("Update tags failed:", err)
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

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Asset Library</h1>
          <p className="text-on-surface-variant mt-1">
            {totalCount} assets &middot; Manage and access all your marketing resources.
          </p>
        </div>
        <AssetUploader categories={categories} />
      </div>

      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline size-5" />
            <input
              type="search"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search assets"
              className="w-full px-12 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:outline-none text-on-surface"
            />
            {isSearching && <div className="absolute right-12 top-1/2 -translate-y-1/2 text-primary"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
            {searchQuery && !isSearching && (
              <button onClick={() => handleFilterChange({ q: "" })} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" aria-label="Clear search">
                <X size={18} />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="w-40 z-30">
              <CustomSelect
                value={selectedCat}
                onChange={(val) => handleFilterChange({ category: val })}
                placeholder="All Categories"
                options={[
                  { value: "", label: "All Categories" },
                  ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                ]}
              />
            </div>

            <div className="w-36 z-20">
              <CustomSelect
                value={selectedAssetType}
                onChange={(val) => handleFilterChange({ type: val })}
                placeholder="All Types"
                options={[
                  { value: "", label: "All Types" },
                  { value: "image", label: "Images" },
                  { value: "document", label: "Documents" },
                  { value: "video", label: "Video" },
                  { value: "audio", label: "Audio" },
                  { value: "archive", label: "Archive" },
                  { value: "other", label: "Other" }
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
                  { value: "size-desc", label: "Largest" },
                  { value: "size-asc", label: "Smallest" }
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

        {/* Filter Chips */}
        {(selectedCat || selectedAssetType) && (
          <div className="flex flex-wrap gap-2 items-center mt-1">
            <span className="text-xs text-outline font-medium mr-2">Active filters:</span>
            {selectedCat && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Category: {categories.find(c => c.id === selectedCat)?.name}
                <button onClick={() => handleFilterChange({ category: "" })} className="hover:bg-primary/20 rounded-full p-0.5" aria-label="Remove category filter"><X size={12} /></button>
              </span>
            )}
            {selectedAssetType && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Type: {selectedAssetType}
                <button onClick={() => handleFilterChange({ type: "" })} className="hover:bg-primary/20 rounded-full p-0.5" aria-label="Remove type filter"><X size={12} /></button>
              </span>
            )}
            <button onClick={() => handleFilterChange({ category: "", type: "" })} className="text-xs text-outline hover:text-on-surface underline ml-2">Clear all</button>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-40 bg-surface-container-high border border-outline-variant/30 shadow-lg rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-on-surface bg-primary/10 px-3 py-1 rounded-lg text-primary">{selectedIds.size} selected</span>
            <button onClick={toggleSelectAll} className="text-sm font-medium text-outline hover:text-on-surface">
              {selectedIds.size === assets.length ? "Deselect all" : "Select all (page)"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-48">
              <CustomSelect
                value={bulkTargetCategory}
                onChange={setBulkTargetCategory}
                placeholder="Move to category..."
                options={[
                  { value: "", label: "Move to category..." },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]}
              />
            </div>
            <button 
              onClick={() => { setBulkAction("move"); handleBulkAction() }}
              disabled={!bulkTargetCategory}
              className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/30 text-sm font-medium hover:bg-surface-container disabled:opacity-50 transition-colors"
            >
              Move
            </button>
            <button 
              onClick={() => setBulkAction("delete")}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="p-2 text-outline hover:text-on-surface ml-2" aria-label="Cancel bulk actions">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {isSearching ? (
        <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-3"}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse bg-surface-container-low rounded-3xl h-64 border border-outline-variant/10"></div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="debossed-well rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-outline-variant/20 border-dashed">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <ImagePlus size={40} />
          </div>
          <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface mb-2">
            {searchQuery || selectedCat || selectedAssetType ? "No assets found" : "No Assets Yet"}
          </h3>
          <p className="text-body-sm text-on-surface-variant max-w-sm mb-6">
            {searchQuery || selectedCat || selectedAssetType
              ? "Try adjusting your search or filter criteria."
              : "Upload your first asset to get started."}
          </p>
          {(searchQuery || selectedCat || selectedAssetType) ? (
            <button onClick={() => handleFilterChange({ q: "", category: "", type: "" })} className="clay-button-primary px-6 py-2.5 rounded-xl text-white font-medium">Clear filters</button>
          ) : (
            <AssetUploader categories={categories} />
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "flex flex-col gap-3"}>
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                viewMode={viewMode}
                isSelected={selectedIds.has(asset.id)}
                onToggleSelect={() => toggleSelection(asset.id)}
                onRename={handleRename}
                onDelete={(id) => setDeletingId(id)}
                renamingId={renamingId}
                setRenamingId={setRenamingId}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                deletingId={deletingId}
                onPreview={setPreviewAsset}
              />
            ))}
          </div>
          {assets.length < totalCount && (
            <div className="flex justify-center mt-8 pb-8">
              <button 
                onClick={handleLoadMore} 
                disabled={isLoadingMore}
                className="px-6 py-3 rounded-xl bg-surface-container-high border border-outline-variant/30 font-medium text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoadingMore ? <div className="w-4 h-4 border-2 border-on-surface border-t-transparent rounded-full animate-spin"></div> : null}
                {isLoadingMore ? "Loading..." : `Load more (Showing ${assets.length} of ${totalCount})`}
              </button>
            </div>
          )}
        </>
      )}

      {previewAsset && (
        <AssetDetailsModal 
          asset={previewAsset}
          assets={assets}
          onClose={() => setPreviewAsset(null)}
          onNavigate={(a) => setPreviewAsset(a)}
          onUpdateTags={handleUpdateTags}
          onRename={handleRename}
        />
      )}

      <AlertModal open={deletingId !== null || bulkAction === "delete"} onOpenChange={(open) => {
        if (!open) {
          if (deletingId) setDeletingId(null)
          if (bulkAction === "delete") setBulkAction(null)
        }
      }}>
        <AlertModalContent>
          <AlertModalHeader>
            <AlertModalTitle>Delete Asset{bulkAction === "delete" ? "s" : ""}</AlertModalTitle>
            <AlertModalDescription>
              Are you sure you want to delete {bulkAction === "delete" ? `${selectedIds.size} assets` : "this asset"}?
            </AlertModalDescription>
          </AlertModalHeader>
          <AlertModalFooter>
            <AlertModalCancel>Cancel</AlertModalCancel>
            <AlertModalAction className="bg-red-600 hover:bg-red-700" onClick={bulkAction === "delete" ? handleBulkAction : confirmDelete}>
              Delete
            </AlertModalAction>
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>
    </div>
  )
}

function getIconForType(mimeType: string, size = 48) {
  if (mimeType.startsWith("video/")) return <FileVideo size={size} className="text-outline" />
  if (mimeType.startsWith("audio/")) return <FileAudio size={size} className="text-outline" />
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return <FileText size={size} className="text-outline" />
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar")) return <FileArchive size={size} className="text-outline" />
  return <FileIcon size={size} className="text-outline" />
}

function AssetCard({ 
  asset,
  viewMode,
  isSelected,
  onToggleSelect,
  onRename, 
  onDelete,
  renamingId,
  setRenamingId,
  renameValue,
  setRenameValue,
  deletingId,
  onPreview
}: {
  asset: Asset
  viewMode: "grid" | "list"
  isSelected: boolean
  onToggleSelect: () => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  renamingId: string | null
  setRenamingId: (id: string | null) => void
  renameValue: string
  setRenameValue: (value: string) => void
  deletingId: string | null
  onPreview: (asset: Asset) => void
}) {
  const isImage = asset.mime_type.startsWith("image/")
  const isRenaming = renamingId === asset.id
  const isDeleting = deletingId === asset.id

  if (viewMode === "list") {
    return (
      <div className={`clay-surface rounded-2xl p-3 flex items-center gap-4 group transition-colors border ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline/40'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSelect}
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant group-hover:border-primary'}`}
            aria-label={isSelected ? "Deselect asset" : "Select asset"}
          >
            {isSelected && <Check size={14} />}
          </button>
          <div 
            className="w-12 h-12 rounded-xl bg-surface-container-low overflow-hidden cursor-pointer shrink-0 flex items-center justify-center relative"
            onClick={() => onPreview(asset)}
          >
            {isImage && asset.storage_path ? (
              <img src={`/api/storage/assets/${asset.storage_path}`} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
            ) : getIconForType(asset.mime_type, 24)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => onRename(asset.id, renameValue)}
              onKeyDown={(e) => e.key === "Enter" && onRename(asset.id, renameValue)}
              className="w-full px-2 py-1 rounded bg-surface-container-high border border-primary focus:outline-none text-sm"
              autoFocus
            />
          ) : (
            <h4 className="font-medium text-on-surface truncate text-sm hover:text-primary cursor-pointer" title={asset.name} onClick={() => onPreview(asset)}>
              {asset.name}
            </h4>
          )}
          <div className="flex items-center gap-3 text-xs text-outline mt-1">
            <span>{formatBytes(asset.file_size)}</span>
            {asset.category && <span className="bg-surface-container-high px-2 py-0.5 rounded-md">{asset.category.name}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button onClick={() => { setRenameValue(asset.name); setRenamingId(asset.id) }} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors" aria-label="Rename">
            <Edit2 size={18} />
          </button>
          <a href={`/api/storage/assets/${asset.storage_path}`} download={asset.name} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors" aria-label="Download">
            <Download size={18} />
          </a>
          <button onClick={() => onDelete(asset.id)} disabled={isDeleting} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-outline hover:text-red-600 transition-colors" aria-label="Delete">
            {isDeleting ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={18} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`clay-surface rounded-3xl overflow-hidden border group relative flex flex-col transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/20 hover:border-outline/40'}`}>
      <button 
        onClick={onToggleSelect}
        className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white opacity-100' : 'bg-white/80 backdrop-blur-sm border-outline-variant/50 text-transparent opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
        aria-label={isSelected ? "Deselect asset" : "Select asset"}
      >
        <Check size={16} className={isSelected ? "block" : "hidden group-hover:block"} />
      </button>

      <div 
        className="aspect-square relative bg-surface-container-low overflow-hidden cursor-pointer" 
        onClick={() => onPreview(asset)}
      >
        {isImage && asset.storage_path ? (
          <img
            src={`/api/storage/assets/${asset.storage_path}`}
            alt={asset.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
            {getIconForType(asset.mime_type)}
          </div>
        )}
        {asset.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-on-surface shadow-sm">
            {asset.category.name}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => onRename(asset.id, renameValue)}
            onKeyDown={(e) => e.key === "Enter" && onRename(asset.id, renameValue)}
            className="w-full px-2 py-1 rounded bg-surface-container-high border border-primary focus:outline-none text-sm"
            autoFocus
          />
        ) : (
          <h4 className="font-bold text-on-surface truncate text-sm cursor-pointer hover:text-primary" title={asset.name} onClick={() => onPreview(asset)}>
            {asset.name}
          </h4>
        )}
        <div className="flex items-center justify-between text-[11px] text-outline font-medium">
          <span>{formatBytes(asset.file_size)}</span>
          {asset.width && asset.height && (
            <span>{asset.width}×{asset.height}</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex gap-1">
            <button
              onClick={() => { setRenameValue(asset.name); setRenamingId(asset.id) }}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
              aria-label="Rename"
              title="Rename"
            >
              <Edit2 size={18} />
            </button>
            <a
              href={`/api/storage/assets/${asset.storage_path}`}
              download={asset.name}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
              aria-label="Download"
              title="Download"
            >
              <Download size={18} />
            </a>
          </div>
          <button
            onClick={() => onDelete(asset.id)}
            disabled={isDeleting}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-outline hover:text-red-600 transition-colors"
            aria-label="Delete"
            title="Delete"
          >
            {isDeleting ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssetDetailsModal({ 
  asset, 
  assets,
  onClose, 
  onNavigate,
  onUpdateTags,
  onRename
}: { 
  asset: Asset
  assets: Asset[]
  onClose: () => void
  onNavigate: (asset: Asset) => void
  onUpdateTags: (id: string, tags: string[]) => void
  onRename: (id: string, name: string) => void
}) {
  const [tagInput, setTagInput] = useState("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(asset.name)
  const [copied, setCopied] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const currentIndex = assets.findIndex(a => a.id === asset.id)
  
  useEffect(() => {
    setNameInput(asset.name)
  }, [asset])

  useEffect(() => {
    // Body scroll lock
    document.body.style.overflow = 'hidden'
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(assets[currentIndex - 1])
      }
      if (e.key === 'ArrowRight' && currentIndex < assets.length - 1) {
        onNavigate(assets[currentIndex + 1])
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    modalRef.current?.focus()
    
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, currentIndex, assets, onNavigate])

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!asset.tags?.includes(newTag)) {
        onUpdateTags(asset.id, [...(asset.tags || []), newTag])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(asset.id, (asset.tags || []).filter(t => t !== tagToRemove))
  }

  const saveName = () => {
    if (nameInput.trim() && nameInput !== asset.name) {
      onRename(asset.id, nameInput.trim())
    }
    setIsEditingName(false)
  }

  const copyUrl = () => {
    const url = `${window.location.origin}/api/storage/assets/${asset.storage_path}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-5xl max-h-[90vh] bg-surface rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 outline-none"
      >
        
        {/* Left Side: Preview */}
        <div className="flex-1 bg-surface-container-lowest relative flex items-center justify-center min-h-[300px] md:min-h-[500px] p-6 group">
          {currentIndex > 0 && (
            <button 
              onClick={() => onNavigate(assets[currentIndex - 1])}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous asset"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          
          {asset.mime_type.startsWith("image/") ? (
            <img 
              src={`/api/storage/assets/${asset.storage_path}`} 
              alt={asset.name} 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-lg"
            />
          ) : asset.mime_type === "application/pdf" ? (
            <object data={`/api/storage/assets/${asset.storage_path}`} type="application/pdf" className="w-full h-full rounded-xl">
              <div className="flex flex-col items-center text-outline h-full justify-center">
                <FileText size={80} />
                <span className="mt-4 font-medium">{asset.mime_type}</span>
              </div>
            </object>
          ) : (
            <div className="flex flex-col items-center text-outline">
              {getIconForType(asset.mime_type, 80)}
              <span className="mt-4 font-medium">{asset.mime_type}</span>
            </div>
          )}

          {currentIndex < assets.length - 1 && (
            <button 
              onClick={() => onNavigate(assets[currentIndex + 1])}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next asset"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
          
          <div className="absolute top-4 left-4 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full font-medium">
            {currentIndex + 1} of {assets.length}
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-[380px] bg-surface flex flex-col border-l border-outline-variant/20 max-h-[50vh] md:max-h-full overflow-y-auto">
          <div className="p-6 border-b border-outline-variant/20 flex items-start justify-between bg-surface sticky top-0 z-10">
            <div className="flex-1 pr-4">
              {isEditingName ? (
                <input 
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveName()
                    if (e.key === 'Escape') {
                      setNameInput(asset.name)
                      setIsEditingName(false)
                    }
                  }}
                  className="w-full text-headline-sm font-bold bg-surface-container px-2 py-1 rounded-lg border border-primary focus:outline-none"
                  autoFocus
                  aria-label="Asset name"
                />
              ) : (
                <h2 id="modal-title" className="text-headline-sm font-bold text-on-surface break-words cursor-pointer hover:text-primary transition-colors" onClick={() => setIsEditingName(true)} title="Click to rename">
                  {asset.name}
                </h2>
              )}
              <p className="text-body-sm text-on-surface-variant mt-1">
                Uploaded {new Date(asset.created_at).toLocaleDateString()}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface" aria-label="Close details">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8 flex-1">
            {/* Metadata Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="debossed-well p-3 rounded-xl">
                <span className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Type</span>
                <span className="text-body-sm font-medium break-words">{asset.mime_type.split('/')[1]?.toUpperCase() || 'Unknown'}</span>
              </div>
              <div className="debossed-well p-3 rounded-xl">
                <span className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Size</span>
                <span className="text-body-sm font-medium">{formatBytes(asset.file_size)}</span>
              </div>
              {asset.width && asset.height && (
                <div className="debossed-well p-3 rounded-xl col-span-2">
                  <span className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Dimensions</span>
                  <span className="text-body-sm font-medium">{asset.width} × {asset.height} px</span>
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div>
              <h3 className="text-body-md font-bold text-on-surface mb-3 flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                Tags
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {asset.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-body-sm font-medium">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5" aria-label={`Remove tag ${tag}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <input 
                type="text" 
                placeholder="Add a tag and press Enter..." 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:outline-none text-body-sm"
                aria-label="Add a tag"
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-3">
            <button 
              onClick={copyUrl}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium border border-outline-variant/50 hover:bg-surface-container-low transition-colors"
            >
              {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy URL"}
            </button>
            <a 
              href={`/api/storage/assets/${asset.storage_path}`} 
              download={asset.name}
              className="w-full clay-button-neural py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium shadow-sm hover:-translate-y-0.5 transition-transform"
            >
              <Download size={18} />
              Download Original File
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
