"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Search, ImagePlus, FileText, ChevronDown, LayoutGrid, LayoutList } from "lucide-react"

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

type ViewMode = "grid" | "list"

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
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [searchQuery, setSearchQuery] = useState(search)
  const [selectedCat, setSelectedCat] = useState(selectedCategory)
  const [selectedTyp, setSelectedTyp] = useState(selectedType)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isSearching, setIsSearching] = useState(false)

  const templateTypes = [
    { value: "", label: "All Types" },
    { value: "flyer", label: "Flyer" },
    { value: "poster", label: "Poster" },
    { value: "banner", label: "Banner" },
    { value: "social_post", label: "Social Post" },
    { value: "social_story", label: "Social Story" },
    { value: "custom", label: "Custom" },
  ]

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (selectedCat) params.set("category", selectedCat)
    if (selectedTyp) params.set("type", selectedTyp)
    window.history.pushState({}, "", `/dashboard/templates?${params.toString()}`)
    
    try {
      const res = await fetch(`/api/templates?${params.toString()}`)
      if (res.ok) {
        const data = await res.json() as { data?: Template[] }
        setTemplates(data.data || [])
      }
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, selectedCat, selectedTyp])

  const getThumbnailUrl = (path: string | null | undefined) => {
    if (!path) return null
    return `/api/storage/assets/${path}`
  }

  const formatType = (type: string) => {
    const labels: Record<string, string> = {
      flyer: "Flyer",
      poster: "Poster",
      banner: "Banner",
      social_post: "Social Post",
      social_story: "Social Story",
      custom: "Custom",
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Templates</h1>
          <p className="text-on-surface-variant mt-1">
            {totalCount} templates &middot; Reusable designs for fast visual production.
          </p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="clay-button-primary px-4 py-2.5 rounded-xl text-white font-headline-sm text-body-md font-semibold flex items-center gap-2"
        >
          <ImagePlus size={18} />
          <span>New Template</span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline size-5" />
          <input
            type="search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-12 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:outline-none text-on-surface"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-4 py-3 pr-10 rounded-2xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:outline-none text-on-surface appearance-none min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-outline size-5 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={selectedTyp}
              onChange={(e) => setSelectedTyp(e.target.value)}
              className="px-4 py-3 pr-10 rounded-2xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:outline-none text-on-surface appearance-none min-w-[150px]"
            >
              {templateTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-outline size-5 pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-3 rounded-xl transition-colors ${viewMode === "grid" ? "bg-primary-container text-on-primary-container" : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant"}`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-3 rounded-xl transition-colors ${viewMode === "list" ? "bg-primary-container text-on-primary-container" : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant"}`}
            title="List View"
          >
            <LayoutList size={20} />
          </button>
        </div>
      </form>

      {templates.length === 0 ? (
        <div className="debossed-well rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-outline-variant/20 border-dashed">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <ImagePlus size={40} />
          </div>
          <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface mb-2">
            {searchQuery || selectedCat || selectedTyp ? "No templates found" : "No Templates Yet"}
          </h3>
          <p className="text-body-sm text-on-surface-variant max-w-sm mb-6">
            {searchQuery || selectedCat || selectedTyp 
              ? "Try adjusting your search or filter criteria."
              : "Create your first template to speed up design production."}
          </p>
          {!(searchQuery || selectedCat || selectedTyp) && (
            <Link
              href="/dashboard/templates/new"
              className="clay-button-primary px-5 py-2.5 rounded-xl text-white font-headline-sm text-body-md font-semibold flex items-center gap-2"
            >
              <ImagePlus size={18} />
              <span>Create Template</span>
            </Link>
          )}
        </div>
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} getThumbnailUrl={getThumbnailUrl} formatType={formatType} />
            ))}
          </div>
        ) : (
          <div className="clay-surface rounded-3xl overflow-hidden border border-outline-variant/20">
            <div className="p-4 border-b border-outline-variant/20 grid grid-cols-12 gap-4 text-sm font-medium text-on-surface-variant">
              <div className="col-span-5">Template</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-2">Actions</div>
            </div>
            <div className="divide-y divide-outline-variant/15">
              {templates.map((template) => (
                <TemplateRow key={template.id} template={template} getThumbnailUrl={getThumbnailUrl} formatType={formatType} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}

function TemplateCard({ template, getThumbnailUrl, formatType }: { 
  template: Template
  getThumbnailUrl: (path: string | null | undefined) => string | null
  formatType: (type: string) => string
}) {
  const thumbUrl = getThumbnailUrl(template.thumbnail?.storage_path)
  
  return (
    <Link href={`/dashboard/templates/${template.id}`} className="clay-surface rounded-3xl overflow-hidden border border-outline-variant/20 group flex flex-col">
      <div className="aspect-video relative bg-surface-container-low overflow-hidden">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl">crop_landscape</span>
          </div>
        )}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <span className="px-2 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-on-surface">
            {formatType(template.template_type)}
          </span>
          {template.category && (
            <span className="px-2 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-on-surface-variant">
              {template.category.name}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <h4 className="font-semibold text-on-surface truncate text-sm" title={template.name}>
          {template.name}
        </h4>
        {template.description && (
          <p className="text-xs text-on-surface-variant line-clamp-2">{template.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-outline mt-auto pt-2 border-t border-outline-variant/20">
          <span>{template.width}×{template.height}px</span>
          <span>{template.usage_count} uses</span>
        </div>
      </div>
    </Link>
  )
}

function TemplateRow({ template, getThumbnailUrl, formatType }: { 
  template: Template
  getThumbnailUrl: (path: string | null | undefined) => string | null
  formatType: (type: string) => string
}) {
  const thumbUrl = getThumbnailUrl(template.thumbnail?.storage_path)
  
  return (
    <Link href={`/dashboard/templates/${template.id}`} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-container-low/50 transition-colors">
      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <div className="w-16 h-10 rounded-xl bg-surface-container-low overflow-hidden shrink-0 relative">
          {thumbUrl ? (
            <img src={thumbUrl} alt={template.name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">crop_landscape</span>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-on-surface truncate text-sm">{template.name}</h4>
          {template.description && (
            <p className="text-xs text-on-surface-variant truncate">{template.description}</p>
          )}
        </div>
      </div>
      <div className="col-span-2 text-center text-sm text-on-surface-variant">
        {formatType(template.template_type)}
      </div>
      <div className="col-span-2 text-center text-sm text-on-surface-variant">
        {template.category?.name || "—"}
      </div>
      <div className="col-span-1 text-center text-sm text-outline font-mono">
        {template.width}×{template.height}
      </div>
      <div className="col-span-2 text-center">
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low text-primary font-headline-sm text-body-sm font-semibold group-hover:bg-primary/10 transition-colors">
          <FileText size={15} aria-hidden="true" />
          View Blueprint
        </span>
      </div>
    </Link>
  )
}