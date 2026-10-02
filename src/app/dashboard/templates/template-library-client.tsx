/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useCallback, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { 
  Search, ImagePlus, FileText, ChevronDown, LayoutGrid, LayoutList, 
  Copy, Archive, Trash2, Layout, CheckSquare, Square, X, Loader2, Pencil
} from "lucide-react"
import { archiveTemplate, cloneTemplate, deleteTemplate } from "./actions"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  name: string
  code: string
  description: string | null
  template_type: string
  format_code: string
  width: number
  height: number
  thumbnail: { storage_path: string; storage_bucket: string } | null
  category: { name: string; slug: string } | null
  created_at: string
  usage_count: number
}

interface Category {
  id: string
  name: string
  slug: string
  template_type: string | null
}

export function TemplateLibraryClient({ 
  initialTemplates, 
  totalCount,
  categories,
  search,
  selectedCategory,
  selectedType,
}: { 
  initialTemplates: Template[]
  totalCount: number
  categories: Category[]
  search: string
  selectedCategory: string
  selectedType: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [searchQuery, setSearchQuery] = useState(search)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const viewMode = searchParams.get("view") || "grid"

  // Sync templates when initialTemplates changes (server revalidation)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemplates(initialTemplates)
  }, [initialTemplates])

  const updateUrl = useCallback((newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, value)
      else params.delete(key)
    })
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, pathname, router])

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search) {
        updateUrl({ q: searchQuery })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, search, updateUrl])

  const handleClone = async (template: Template) => {
    const tempId = 'temp-' + crypto.randomUUID()
    const cloned: Template = { ...template, id: tempId, name: `${template.name} - Copy`, created_at: new Date().toISOString(), usage_count: 0 }
    setTemplates(prev => [cloned, ...prev])
    try {
      await cloneTemplate(template.id)
    } catch {
      setTemplates(prev => prev.filter(t => t.id !== tempId))
    }
  }

  const handleArchive = async (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    setSelectedIds(prev => { const n = new Set(prev); n.delete(templateId); return n; })
    try {
      await archiveTemplate(templateId)
    } catch {
      // Could implement toast here, state reverts on next revalidation
    }
  }

  const handleDelete = async (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    setSelectedIds(prev => { const n = new Set(prev); n.delete(templateId); return n; })
    try {
      await deleteTemplate(templateId)
    } catch {
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === templates.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(templates.map(t => t.id)))
  }

  const handleBulkArchive = async () => {
    const ids = Array.from(selectedIds)
    setTemplates(prev => prev.filter(t => !ids.includes(t.id)))
    setSelectedIds(new Set())
    await Promise.all(ids.map(id => archiveTemplate(id)))
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    setTemplates(prev => prev.filter(t => !ids.includes(t.id)))
    setSelectedIds(new Set())
    await Promise.all(ids.map(id => deleteTemplate(id)))
  }

  const getThumbnailUrl = (path: string | null | undefined) => {
    if (!path) return null
    return `/api/storage/assets/${path}`
  }

  const formatType = (type: string) => {
    const labels: Record<string, string> = {
      flyer: "Flyer", poster: "Poster", banner: "Banner",
      social_post: "Social Post", social_story: "Social Story", custom: "Custom"
    }
    return labels[type] || type
  }

  const templateTypes = [
    { value: "", label: "All Types" },
    { value: "flyer", label: "Flyer" },
    { value: "poster", label: "Poster" },
    { value: "banner", label: "Banner" },
    { value: "social_post", label: "Social Post" },
    { value: "social_story", label: "Social Story" },
    { value: "custom", label: "Custom" },
  ]

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Templates</h1>
          <p className="text-on-surface-variant mt-1 text-body-md">
            {totalCount} templates · Reusable blueprints for fast production.
          </p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="clay-button-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 shrink-0 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <ImagePlus size={18} />
          <span>New Template</span>
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <button 
          onClick={() => updateUrl({ category: '' })} 
          className={cn("px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors", !selectedCategory ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface hover:bg-surface-container')}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => updateUrl({ category: cat.id })}
            className={cn("px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors", selectedCategory === cat.id ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low text-on-surface hover:bg-surface-container')}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline size-5" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-on-surface text-sm transition-all shadow-sm"
            aria-label="Search templates"
          />
          {isPending && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary size-4 animate-spin" />}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedType}
              onChange={(e) => updateUrl({ type: e.target.value })}
              className="w-full sm:w-auto pl-4 pr-10 py-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-on-surface appearance-none text-sm font-medium transition-all shadow-sm cursor-pointer"
              aria-label="Filter by Type"
            >
              {templateTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-outline size-4 pointer-events-none" />
          </div>

          <div className="flex bg-surface-container-lowest rounded-2xl p-1 shrink-0 border border-outline-variant/30 shadow-sm">
            <button
              onClick={() => updateUrl({ view: "grid" })}
              className={cn("p-1.5 rounded-xl transition-colors", viewMode === "grid" ? "bg-primary/10 shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface")}
              aria-label="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => updateUrl({ view: "list" })}
              className={cn("p-1.5 rounded-xl transition-colors", viewMode === "list" ? "bg-primary/10 shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface")}
              aria-label="List View"
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="clay-surface rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-outline-variant/20 border-dashed animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
            <ImagePlus size={36} />
          </div>
          <h3 className="text-headline-sm font-bold text-on-surface mb-2">
            {searchQuery || selectedCategory || selectedType ? "No templates found" : "No Templates Yet"}
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-sm mb-6">
            {searchQuery || selectedCategory || selectedType 
              ? "Try adjusting your search or filter criteria."
              : "Create your first template to speed up design production."}
          </p>
          {!(searchQuery || selectedCategory || selectedType) && (
            <Link href="/dashboard/templates/new" className="clay-button-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2">
              <ImagePlus size={18} />
              <span>Create Template</span>
            </Link>
          )}
        </div>
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {templates.map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                getThumbnailUrl={getThumbnailUrl} 
                formatType={formatType}
                isSelected={selectedIds.has(template.id)}
                onToggleSelect={() => toggleSelect(template.id)}
                onClone={() => handleClone(template)}
                onArchive={() => handleArchive(template.id)}
                onDelete={() => handleDelete(template.id)}
              />
            ))}
          </div>
        ) : (
          <div className="clay-surface rounded-3xl overflow-hidden border border-outline-variant/20 shadow-sm">
            <div className="p-4 border-b border-outline-variant/20 grid grid-cols-12 gap-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider items-center">
              <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                <button onClick={toggleSelectAll} className="p-1 -ml-1 text-outline hover:text-primary transition-colors" aria-label="Select All">
                   {selectedIds.size === templates.length && templates.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
                <span>Template</span>
              </div>
              <div className="hidden sm:block sm:col-span-2 text-center">Type</div>
              <div className="hidden md:block md:col-span-2 text-center">Category</div>
              <div className="hidden lg:block lg:col-span-1 text-center">Size</div>
              <div className="col-span-6 sm:col-span-3 md:col-span-2 lg:col-span-2 text-right sm:text-center">Actions</div>
            </div>
            <div className="divide-y divide-outline-variant/15">
              {templates.map((template) => (
                <TemplateRow 
                  key={template.id} 
                  template={template} 
                  getThumbnailUrl={getThumbnailUrl} 
                  formatType={formatType}
                  isSelected={selectedIds.has(template.id)}
                  onToggleSelect={() => toggleSelect(template.id)}
                  onClone={() => handleClone(template)}
                  onArchive={() => handleArchive(template.id)}
                  onDelete={() => handleDelete(template.id)}
                />
              ))}
            </div>
          </div>
        )
      )}

      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 md:gap-5 bg-surface text-on-surface px-6 py-3.5 rounded-2xl shadow-xl border border-outline-variant/30 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <span className="text-sm font-bold whitespace-nowrap">{selectedIds.size} selected</span>
          <div className="w-px h-6 bg-outline-variant/50"></div>
          <button onClick={handleBulkArchive} className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors" aria-label="Archive Selected">
            <Archive className="w-4 h-4" /> <span className="hidden sm:inline">Archive</span>
          </button>
          <button onClick={handleBulkDelete} className="flex items-center gap-2 text-sm font-semibold text-error hover:text-error/80 transition-colors" aria-label="Delete Selected">
            <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
          </button>
          <div className="w-px h-6 bg-outline-variant/50"></div>
          <button onClick={() => setSelectedIds(new Set())} className="p-1.5 -mr-2 hover:bg-surface-container rounded-lg transition-colors text-outline" aria-label="Clear Selection">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ 
  template, getThumbnailUrl, formatType, isSelected, onToggleSelect, onClone, onArchive 
}: { 
  template: Template
  getThumbnailUrl: (path: string | null | undefined) => string | null
  formatType: (type: string) => string
  isSelected: boolean
  onToggleSelect: () => void
  onClone: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const thumbUrl = getThumbnailUrl(template.thumbnail?.storage_path)
  
  return (
    <div className={cn(
      "clay-surface rounded-3xl overflow-hidden border transition-all duration-200 group flex flex-col relative", 
      isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-outline-variant/20 hover:border-outline-variant/50 hover:shadow-lg"
    )}>
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect(); }}
        className={cn(
          "absolute top-3 left-3 z-10 p-1.5 rounded-lg backdrop-blur-md transition-all", 
          isSelected ? "bg-primary text-white opacity-100 shadow-md" : "bg-black/20 text-white/90 opacity-0 group-hover:opacity-100 hover:bg-black/40"
        )}
        aria-label={isSelected ? "Deselect template" : "Select template"}
      >
        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
      </button>

      <Link href={`/dashboard/templates/${template.id}`} className="aspect-video relative bg-surface-container-low overflow-hidden block">
        {thumbUrl && (
          <img
            src={thumbUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                 e.currentTarget.nextElementSibling.classList.remove('hidden');
              }
            }}
          />
        )}
        <div className={cn("absolute inset-0 w-full h-full flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-low", thumbUrl ? "hidden" : "flex")}>
          <Layout className="w-10 h-10 opacity-30" />
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full bg-surface/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-on-surface shadow-sm border border-outline-variant/10">
            {formatType(template.template_type)}
          </span>
        </div>
      </Link>
      
      <div className="p-4 space-y-3 flex-1 flex flex-col relative bg-surface">
        <div>
          <Link href={`/dashboard/templates/${template.id}`} className="hover:text-primary transition-colors focus:outline-none focus:underline block">
            <h4 className="font-bold text-on-surface truncate text-base" title={template.name}>
              {template.name}
            </h4>
          </Link>
          {template.description && (
            <p className="text-sm text-on-surface-variant line-clamp-2 mt-1 leading-snug">{template.description}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs font-semibold text-outline mt-auto pt-3 border-t border-outline-variant/20">
          <span className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded-md"><Layout className="w-3.5 h-3.5" /> {template.width}×{template.height}px</span>
          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {template.usage_count} uses</span>
        </div>

        <div className="absolute top-2 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
           <Link href={`/dashboard/templates/${template.id}/edit`} className="p-2 bg-surface text-on-surface shadow-md border border-outline-variant/20 rounded-xl hover:bg-primary hover:text-white transition-colors" aria-label="Edit Template" title="Edit">
             <Pencil className="w-4 h-4" />
           </Link>
           <button onClick={(e) => { e.preventDefault(); onClone(); }} className="p-2 bg-surface text-on-surface shadow-md border border-outline-variant/20 rounded-xl hover:bg-primary hover:text-white transition-colors" aria-label="Clone Template" title="Clone">
             <Copy className="w-4 h-4" />
           </button>
           <button onClick={(e) => { e.preventDefault(); onDelete(); }} className="p-2 bg-surface text-error shadow-md border border-outline-variant/20 rounded-xl hover:bg-error hover:text-white transition-colors" aria-label="Delete Template" title="Delete">
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  )
}

function TemplateRow({ 
  template, getThumbnailUrl, formatType, isSelected, onToggleSelect, onClone, onArchive, onDelete 
}: { 
  template: Template
  getThumbnailUrl: (path: string | null | undefined) => string | null
  formatType: (type: string) => string
  isSelected: boolean
  onToggleSelect: () => void
  onClone: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const thumbUrl = getThumbnailUrl(template.thumbnail?.storage_path)
  
  return (
    <div className={cn("p-4 grid grid-cols-12 gap-4 items-center transition-colors group", isSelected ? "bg-primary/5" : "hover:bg-surface-container-low/50")}>
      <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
        <button 
          type="button"
          onClick={onToggleSelect}
          className={cn("p-1 -ml-1 transition-colors shrink-0", isSelected ? "text-primary" : "text-outline hover:text-primary")}
          aria-label={isSelected ? "Deselect template" : "Select template"}
        >
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>
        <Link href={`/dashboard/templates/${template.id}`} className="w-14 h-10 rounded-lg bg-surface-container-low overflow-hidden shrink-0 relative block shadow-sm border border-outline-variant/20">
          {thumbUrl && (
            <img src={thumbUrl} alt={template.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.classList.remove('hidden'); }} />
          )}
          <div className={cn("absolute inset-0 w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-container-low", thumbUrl ? "hidden" : "flex")}>
            <Layout className="w-5 h-5 opacity-40" />
          </div>
        </Link>
        <Link href={`/dashboard/templates/${template.id}`} className="min-w-0 flex-1 hover:underline focus:outline-none">
          <h4 className="font-semibold text-on-surface truncate text-sm">{template.name}</h4>
          {template.description && (
            <p className="text-xs text-on-surface-variant truncate">{template.description}</p>
          )}
        </Link>
      </div>
      <div className="hidden sm:block sm:col-span-2 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
        {formatType(template.template_type)}
      </div>
      <div className="hidden md:block md:col-span-2 text-center text-sm font-medium text-on-surface-variant">
        {template.category?.name || "—"}
      </div>
      <div className="hidden lg:block lg:col-span-1 text-center text-xs font-semibold text-outline bg-surface-container-lowest px-2 py-1 rounded-md mx-auto">
        {template.width}×{template.height}
      </div>
      <div className="col-span-6 sm:col-span-3 md:col-span-2 lg:col-span-2 flex items-center justify-end sm:justify-center gap-2">
         <Link href={`/dashboard/templates/${template.id}/edit`} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" aria-label="Edit" title="Edit">
           <Pencil className="w-4 h-4" />
         </Link>
         <button onClick={onClone} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" aria-label="Clone" title="Clone">
           <Copy className="w-4 h-4" />
         </button>
         <button onClick={onDelete} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors" aria-label="Delete" title="Delete">
           <Trash2 className="w-4 h-4" />
         </button>
      </div>
    </div>
  )
}