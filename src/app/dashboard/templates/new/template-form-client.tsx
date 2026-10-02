/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import Link from "next/link"
import { CustomSelect } from "@/components/ui/custom-select"
import { Input } from "@/components/ui/input"
import { createTemplateFromForm, updateTemplateFromForm } from "../actions"
import { AssetPickerModal, type Asset } from "@/components/dashboard/assets/asset-picker-modal"
import { createClient } from "@/lib/supabase/client"
import { ImagePlus, X } from "lucide-react"

export function TemplateFormClient({ 
  categories, 
  initialData 
}: { 
  categories: { id: string; name: string }[]
  initialData?: any 
}) {
  const [templateType, setTemplateType] = useState(initialData?.template_type || "social_post")
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "")
  const [formatCode, setFormatCode] = useState(initialData?.format_code || "instagram_post")
  const [unit, setUnit] = useState(initialData?.unit || "px")

  // Asset states
  const [thumbnailAsset, setThumbnailAsset] = useState<Asset | null>(
    initialData?.thumbnail ? {
      id: initialData.thumbnail_asset_id,
      name: "Thumbnail",
      storage_path: initialData.thumbnail.storage_path,
      storage_bucket: initialData.thumbnail.storage_bucket,
    } as Asset : null
  )
  const [backgroundAsset, setBackgroundAsset] = useState<Asset | null>(
    initialData?.background ? {
      id: initialData.background_asset_id,
      name: "Background",
      storage_path: initialData.background.storage_path,
      storage_bucket: initialData.background.storage_bucket,
    } as Asset : null
  )
  
  // Modal states
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false)
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)

  const supabase = createClient()

  const getPublicUrl = (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }))
  const typeOptions = [
    { value: "flyer", label: "Flyer" },
    { value: "poster", label: "Poster" },
    { value: "banner", label: "Banner" },
    { value: "social_post", label: "Social Post" },
    { value: "social_story", label: "Social Story" },
    { value: "custom", label: "Custom" },
  ]
  const formatOptions = [
    { value: "instagram_post", label: "Instagram Post" },
    { value: "instagram_story", label: "Instagram Story" },
    { value: "facebook", label: "Facebook" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "a4", label: "A4" },
    { value: "custom", label: "Custom" },
  ]
  const unitOptions = [
    { value: "px", label: "px" },
    { value: "cm", label: "cm" },
    { value: "in", label: "in" },
  ]

  const renderAssetPreview = (asset: Asset | null, label: string, onClick: () => void, onRemove: () => void) => {
    return (
      <div className="space-y-3">
        <label className="text-sm font-semibold text-on-surface">{label}</label>
        {asset ? (
          <div className="relative group overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest aspect-video">
            <img 
              src={getPublicUrl(asset.storage_bucket, asset.storage_path)} 
              alt={asset.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                type="button" 
                onClick={onClick}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white text-sm font-medium transition-colors"
              >
                Change
              </button>
              <button 
                type="button" 
                onClick={onRemove}
                className="p-2 bg-error/80 hover:bg-error backdrop-blur-md rounded-xl text-white transition-colors"
                title="Remove"
              >
                <X size={20} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs text-white truncate font-medium">{asset.name}</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="w-full flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low hover:border-primary/50 transition-colors aspect-video text-on-surface-variant"
          >
            <div className="p-4 rounded-full bg-surface-container shadow-sm">
              <ImagePlus size={24} className="opacity-70" />
            </div>
            <span className="text-sm font-medium">Choose {label}</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <form action={initialData ? updateTemplateFromForm.bind(null, initialData.id) : createTemplateFromForm} className="clay-surface rounded-3xl border border-outline-variant/20 p-6 sm:p-8 space-y-6">
        <input type="hidden" name="thumbnail_asset_id" value={thumbnailAsset?.id || ""} />
        <input type="hidden" name="background_asset_id" value={backgroundAsset?.id || ""} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-2 md:col-span-2">
          <label htmlFor="name" className="text-sm font-semibold text-on-surface">Template Name</label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={initialData?.name}
            placeholder="e.g. Ramadan Promo Banner"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="text-sm font-semibold text-on-surface">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="flex w-full rounded-2xl border-none bg-neutral-100/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),_inset_-4px_-4px_8px_rgba(255,255,255,0.05)] focus:shadow-[inset_6px_6px_10px_rgba(0,0,0,0.1),_inset_-6px_-6px_10px_rgba(255,255,255,0.9)] transition-all resize-y min-h-[100px]"
            defaultValue={initialData?.description || ""}
            placeholder="Template untuk promo Ramadan untuk social media"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-semibold text-on-surface">Code (Unique)</label>
          <Input
            id="code"
            name="code"
            required
            defaultValue={initialData?.code}
            placeholder="e.g. ramadan-promo"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="template_type" className="text-sm font-semibold text-on-surface">Template Type</label>
          <CustomSelect
            name="template_type"
            value={templateType}
            onChange={setTemplateType}
            options={typeOptions}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category_id" className="text-sm font-semibold text-on-surface">Category</label>
          <CustomSelect
            name="category_id"
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
            placeholder="Select a category"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="format_code" className="text-sm font-semibold text-on-surface">Format</label>
          <CustomSelect
            name="format_code"
            value={formatCode}
            onChange={setFormatCode}
            options={formatOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-2">
          <div className="space-y-2">
            <label htmlFor="width" className="text-sm font-semibold text-on-surface">Width</label>
            <Input
              id="width"
              name="width"
              type="number"
              min={1}
              defaultValue={initialData?.width || 1080}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="height" className="text-sm font-semibold text-on-surface">Height</label>
            <Input
              id="height"
              name="height"
              type="number"
              min={1}
              defaultValue={initialData?.height || 1080}
            />
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label htmlFor="unit" className="text-sm font-semibold text-on-surface">Unit</label>
            <CustomSelect
              name="unit"
              value={unit}
              onChange={setUnit}
              options={unitOptions}
            />
          </div>
        </div>
      </div>

      <hr className="border-outline-variant/20 my-6" />

      {/* Visual Assets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderAssetPreview(
          thumbnailAsset, 
          "Thumbnail Asset", 
          () => setIsThumbnailModalOpen(true), 
          () => setThumbnailAsset(null)
        )}
        {renderAssetPreview(
          backgroundAsset, 
          "Background Asset", 
          () => setIsBackgroundModalOpen(true), 
          () => setBackgroundAsset(null)
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/20 mt-8">
        <Link href="/dashboard/templates" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">
          Cancel
        </Link>
        <button type="submit" className="clay-button-primary rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 shadow-lg">
          {initialData ? "Save Changes" : "Create Template"}
        </button>
      </div>
    </form>

    <AssetPickerModal
      isOpen={isThumbnailModalOpen}
      onClose={() => setIsThumbnailModalOpen(false)}
      onSelectAsset={setThumbnailAsset}
      title="Choose Thumbnail"
      assetTypeFilter="image"
    />
    
    <AssetPickerModal
      isOpen={isBackgroundModalOpen}
      onClose={() => setIsBackgroundModalOpen(false)}
      onSelectAsset={setBackgroundAsset}
      title="Choose Background"
      assetTypeFilter="image"
    />
    </>
  )
}
