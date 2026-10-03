"use client"

import React, { useState } from "react"
import { Settings2, Type, Square, Move, Maximize, Palette, Trash2, Image as ImageIcon } from "lucide-react"
import { AssetPickerModal } from "@/components/dashboard/assets/asset-picker-modal"

export function PropertiesPanel({ 
  element, 
  onUpdate, 
  onDelete,
  brandKit,
  assetMap,
  setAssetMap
}: { 
  element: any, 
  onUpdate: (updates: any) => void,
  onDelete: () => void,
  brandKit?: any,
  assetMap?: Record<string, { url: string; name?: string }>,
  setAssetMap?: React.Dispatch<React.SetStateAction<Record<string, { url: string; name?: string }>>>
}) {
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false)

  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-on-surface-variant">
        <Settings2 size={48} className="opacity-10 mb-4" />
        <p className="text-sm font-medium">Select an element to edit properties</p>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'number' ? parseFloat(value) : value
    
    if (name === 'text') {
      onUpdate({ content: { ...element.content, text: val } })
    } else if (name.startsWith('style.')) {
      const styleKey = name.split('.')[1]
      onUpdate({ style: { ...element.style, [styleKey]: val } })
    } else {
      onUpdate({ [name]: val })
    }
  }

  const handleAssetSelect = (asset: any) => {
    const { createClient } = require('@/lib/supabase/client')
    const supabase = createClient()
    const { data } = supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path)
    
    if (setAssetMap) {
      setAssetMap(prev => ({
        ...prev,
        [asset.id]: { url: data.publicUrl, name: asset.name }
      }))
    }
    onUpdate({ asset_id: asset.id })
    setIsAssetPickerOpen(false)
  }

  const handleBrandColorSelect = (colorHex: string) => {
    if (element.element_type === 'shape') {
      onUpdate({ style: { ...element.style, backgroundColor: colorHex } })
    } else if (element.element_type === 'text') {
      onUpdate({ style: { ...element.style, color: colorHex } })
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center gap-2 p-4 border-b border-outline-variant/20">
        <Settings2 className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-on-surface text-sm">Properties</h3>
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
          {element.element_type}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Image Group (if image) */}
        {element.element_type === 'image' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-wider">
              <ImageIcon size={12} /> Image Asset
            </div>
            {element.asset_id && assetMap && assetMap[element.asset_id] ? (
              <div className="space-y-2">
                <div className="w-full aspect-video bg-neutral-100 rounded-xl border border-outline-variant/30 overflow-hidden relative">
                  <img src={assetMap[element.asset_id].url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsAssetPickerOpen(true)} className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
                    Replace
                  </button>
                  <button onClick={() => onUpdate({ asset_id: null })} className="flex-1 py-2 rounded-xl bg-error/10 text-error text-xs font-bold hover:bg-error/20 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsAssetPickerOpen(true)} className="w-full py-8 rounded-xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors flex flex-col items-center justify-center gap-2">
                <ImageIcon size={24} className="opacity-50" />
                <span className="text-xs font-bold">Select Image</span>
              </button>
            )}
          </div>
        )}

        {/* Transform Group */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-wider">
            <Move size={12} /> Transform
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">X Position</label>
              <input type="number" name="x" value={element.x} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Y Position</label>
              <input type="number" name="y" value={element.y} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Width</label>
              <input type="number" name="width" value={element.width} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Height</label>
              <input type="number" name="height" value={element.height} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Rotation (°)</label>
              <input type="number" name="rotation" value={element.rotation} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>
        </div>

        {/* Content Group (if text) */}
        {element.element_type === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-wider">
              <Type size={12} /> Content
            </div>
            <div className="space-y-1">
              <textarea 
                name="text" 
                value={element.content?.text || ''} 
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* Style Group */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-wider">
            <Palette size={12} /> Styling
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Opacity ({(element.opacity * 100).toFixed(0)}%)</label>
              <input type="range" name="opacity" min="0" max="1" step="0.01" value={element.opacity} onChange={handleChange} className="w-full accent-primary" />
            </div>

            {brandKit?.brand_colors && brandKit.brand_colors.length > 0 && (element.element_type === 'shape' || element.element_type === 'text') && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-1">Brand Colors</label>
                <div className="flex flex-wrap gap-2">
                  {brandKit.brand_colors.map((c: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleBrandColorSelect(c.color_hex)}
                      className="w-6 h-6 rounded-full border border-outline-variant/20 hover:scale-110 transition-transform shadow-sm"
                      style={{ backgroundColor: c.color_hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {element.element_type === 'text' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Font Family</label>
                  <select 
                    name="style.fontFamily" 
                    value={element.style?.fontFamily || 'Inter'} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="serif">Serif</option>
                    {brandKit?.brand_fonts?.map((f: any, i: number) => (
                      <option key={`bf-${i}`} value={f.font_family}>{f.font_family} (Brand {f.font_role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Font Size</label>
                  <input type="text" name="style.fontSize" value={element.style?.fontSize || '16px'} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. 16px, 2rem" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Font Weight</label>
                  <select 
                    name="style.fontWeight" 
                    value={element.style?.fontWeight || 'normal'} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="500">Medium</option>
                    <option value="bold">Bold</option>
                    <option value="900">Black</option>
                  </select>
                </div>
              </>
            )}

            {element.element_type === 'shape' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Border Radius</label>
                  <input type="text" name="style.borderRadius" value={element.style?.borderRadius || '0px'} onChange={handleChange} className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. 8px, 50%" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Fill Color</label>
                  <div className="flex gap-2">
                    <input type="color" name="style.backgroundColor" value={element.style?.backgroundColor || '#cccccc'} onChange={handleChange} className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
                    <input type="text" name="style.backgroundColor" value={element.style?.backgroundColor || '#cccccc'} onChange={handleChange} className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs uppercase" />
                  </div>
                </div>
              </>
            )}
            {element.element_type === 'text' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-1">Text Color</label>
                <div className="flex gap-2">
                  <input type="color" name="style.color" value={element.style?.color || '#000000'} onChange={handleChange} className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
                  <input type="text" name="style.color" value={element.style?.color || '#000000'} onChange={handleChange} className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs uppercase" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-outline-variant/20">
          <button 
            onClick={onDelete}
            className="w-full py-2.5 rounded-xl border border-error/30 text-error hover:bg-error/10 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> Delete Element
          </button>
        </div>
      </div>

      <AssetPickerModal 
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        onSelectAsset={handleAssetSelect}
      />
    </div>
  )
}
