"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Search, LayoutGrid, List as ListIcon, Filter, Copy, Archive, Trash2, Plus, LayoutTemplate, MoreVertical, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { duplicateDesign, archiveDesign, deleteDesign } from "./actions"
import { createClient } from "@/lib/supabase/client"

export function DesignLibraryClient({ 
  initialDesigns, 
  totalCount,
  initialView = 'grid'
}: { 
  initialDesigns: any[]
  totalCount: number
  initialView?: 'grid' | 'list'
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [view, setView] = useState<'grid' | 'list'>(initialView)
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [isPending, startTransition] = useTransition()

  // Optimistic UI state for deletions/archives
  const [designs, setDesigns] = useState(initialDesigns)

  useEffect(() => {
    setDesigns(initialDesigns)
  }, [initialDesigns])

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      const currentQ = params.get("q") || ""
      
      if (search !== currentQ) {
        if (search) params.set("q", search)
        else params.delete("q")
        
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [search, pathname, router, searchParams])

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await duplicateDesign(id)
      } catch (err) {
        console.error(err)
      }
    })
  }

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setDesigns(prev => prev.filter(d => d.id !== id))
    try {
      await archiveDesign(id)
    } catch (err) {
      console.error(err)
      setDesigns(initialDesigns) // revert on error
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm("Are you sure you want to delete this design?")) return
    setDesigns(prev => prev.filter(d => d.id !== id))
    try {
      await deleteDesign(id)
    } catch (err) {
      console.error(err)
      setDesigns(initialDesigns) // revert on error
    }
  }

  const getPublicUrl = (asset: any) => {
    if (!asset) return null
    return supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path).data.publicUrl
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="clay-surface p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between border border-outline-variant/20">
        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designs..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
            />
          </div>
          
          <select 
            value={searchParams.get("status") || "all"} 
            onChange={(e) => setParam("status", e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 outline-none text-on-surface cursor-pointer focus:border-primary hidden sm:block"
          >
            <option value="all">All Status</option>
            <option value="draft">Drafts</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>

          <select 
            value={searchParams.get("type") || "all"} 
            onChange={(e) => setParam("type", e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 outline-none text-on-surface cursor-pointer focus:border-primary hidden lg:block"
          >
            <option value="all">All Types</option>
            <option value="flyer">Flyer</option>
            <option value="poster">Poster</option>
            <option value="social_post">Social Post</option>
            <option value="social_story">Story</option>
            <option value="banner">Banner</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center p-1 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <button 
              onClick={() => { setView('grid'); setParam('view', 'grid'); }}
              className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-primary dark:bg-black/30' : 'text-on-surface-variant hover:text-on-surface'}`}
              aria-label="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => { setView('list'); setParam('view', 'list'); }}
              className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow-sm text-primary dark:bg-black/30' : 'text-on-surface-variant hover:text-on-surface'}`}
              aria-label="List View"
            >
              <ListIcon size={18} />
            </button>
          </div>

          <Link href="/dashboard/designs/new" className="clay-button-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shrink-0">
            <Plus size={18} />
            <span className="hidden sm:inline">Create Design</span>
          </Link>
        </div>
      </div>

      {isPending && <div className="text-center text-sm text-on-surface-variant py-4 animate-pulse">Updating...</div>}

      {designs.length === 0 ? (
        <div className="clay-surface rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-outline-variant/20 h-[400px]">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <LayoutTemplate className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-headline-sm font-bold text-on-surface mb-2">No designs yet</h3>
          <p className="text-on-surface-variant text-body-md mb-8 max-w-md">
            You haven't created any designs yet. Start by selecting a template and customizing it for your brand.
          </p>
          <Link href="/dashboard/designs/new" className="clay-button-primary px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
            <Plus size={20} />
            Create Your First Design
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {designs.map((design) => (
              <motion.div 
                layout 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                key={design.id}
                className="clay-surface group rounded-3xl overflow-hidden border border-outline-variant/20 hover:border-primary/50 transition-all flex flex-col"
              >
                <Link href={`/dashboard/designs/${design.id}`} className="block relative aspect-square bg-surface-container-low overflow-hidden">
                  {design.preview_asset ? (
                    <img src={getPublicUrl(design.preview_asset)} alt={design.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                      <LayoutTemplate size={48} className="opacity-20 mb-2" />
                      <span className="text-xs font-semibold uppercase tracking-widest opacity-40">No Preview</span>
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white rounded-lg">
                      {design.design_type.replace('_', ' ')}
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md rounded-lg w-max ${
                      design.status === 'draft' ? 'bg-surface-variant/80 text-on-surface-variant' :
                      design.status === 'review' ? 'bg-amber-500/80 text-white' :
                      design.status === 'approved' ? 'bg-emerald-500/80 text-white' :
                      'bg-error/80 text-white'
                    }`}>
                      {design.status}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
                      <Eye size={16} /> View Details
                    </div>
                  </div>
                </Link>

                <div className="p-5 flex flex-col gap-1 relative bg-white dark:bg-transparent">
                  <h3 className="font-bold text-on-surface truncate pr-8" title={design.name}>{design.name}</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    {design.width}×{design.height} {design.unit} • {new Date(design.created_at).toLocaleDateString()}
                  </p>

                  <div className="absolute right-2 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleDuplicate(design.id, e)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Duplicate">
                      <Copy size={16} />
                    </button>
                    <button onClick={(e) => handleArchive(design.id, e)} className="p-1.5 text-on-surface-variant hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors" title="Archive">
                      <Archive size={16} />
                    </button>
                    <button onClick={(e) => handleDelete(design.id, e)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="clay-surface rounded-3xl overflow-hidden border border-outline-variant/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Design</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Size</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {designs.map(design => (
                  <motion.tr 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    key={design.id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center relative">
                           {design.preview_asset ? (
                             <img src={getPublicUrl(design.preview_asset)} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <LayoutTemplate size={20} className="text-on-surface-variant/50" />
                           )}
                           <Link href={`/dashboard/designs/${design.id}`} className="absolute inset-0 z-10" />
                        </div>
                        <div>
                          <Link href={`/dashboard/designs/${design.id}`} className="font-bold text-sm text-on-surface hover:text-primary transition-colors block">
                            {design.name}
                          </Link>
                          <p className="text-xs text-on-surface-variant mt-0.5 md:hidden">{design.design_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant hidden md:table-cell capitalize">
                      {design.design_type.replace('_', ' ')}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                        design.status === 'draft' ? 'bg-surface-variant text-on-surface-variant' :
                        design.status === 'review' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                        design.status === 'approved' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                        'bg-error/20 text-error'
                      }`}>
                        {design.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant hidden lg:table-cell">
                      {design.width}×{design.height} {design.unit}
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant hidden lg:table-cell">
                      {new Date(design.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/designs/${design.id}`} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" title="View Details">
                          <Eye size={18} />
                        </Link>
                        <button onClick={(e) => handleDuplicate(design.id, e)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-colors" title="Duplicate">
                          <Copy size={18} />
                        </button>
                        <button onClick={(e) => handleArchive(design.id, e)} className="p-2 text-on-surface-variant hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors" title="Archive">
                          <Archive size={18} />
                        </button>
                        <button onClick={(e) => handleDelete(design.id, e)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
