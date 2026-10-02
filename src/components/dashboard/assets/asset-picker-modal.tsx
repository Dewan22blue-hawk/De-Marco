/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Search, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { listAssets } from '@/app/dashboard/assets/actions'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

export interface Asset {
  id: string
  name: string
  storage_bucket: string
  storage_path: string
  asset_type: string
  mime_type: string
  file_size: number
}

interface AssetPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAsset: (asset: Asset) => void
  assetTypeFilter?: string
  title?: string
}

export function AssetPickerModal({
  isOpen,
  onClose,
  onSelectAsset,
  assetTypeFilter = 'image',
  title = 'Pilih Asset'
}: AssetPickerModalProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const supabase = createClient()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await listAssets({
        search: debouncedSearch,
        asset_type: assetTypeFilter,
        limit: 50
      })
      setAssets(data as Asset[])
    } catch (error) {
      console.error("Failed to fetch assets", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, assetTypeFilter])

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchAssets()
    }
  }, [isOpen, fetchAssets])

  const getPublicUrl = (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="clay-surface flex w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-outline-variant/30 shadow-2xl bg-surface h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-4">
            <h2 className="text-title-lg font-bold text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-outline-variant/20">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input
                type="text"
                placeholder="Cari asset berdasarkan nama atau tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border-none bg-surface-container-low py-3 pl-11 pr-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] transition-all"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : assets.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-on-surface-variant">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p className="text-body-lg font-medium">Tidak ada asset ditemukan</p>
                <p className="text-body-sm opacity-70">Coba kata kunci lain atau upload asset baru di Library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      onSelectAsset(asset)
                      onClose()
                    }}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low transition-all hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-left"
                  >
                    <img
                      src={getPublicUrl(asset.storage_bucket, asset.storage_path)}
                      alt={asset.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 w-full p-3 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="truncate text-xs font-medium text-white">{asset.name}</p>
                      <p className="text-[10px] text-white/80">
                        {(asset.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
