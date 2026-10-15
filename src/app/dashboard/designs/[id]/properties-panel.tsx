"use client"

import React, { useState } from "react"
import {
  Settings2,
  Type,
  Move,
  Palette,
  Trash2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
} from "lucide-react"
import { AssetPickerModal } from "@/components/dashboard/assets/asset-picker-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CustomSelect } from "@/components/ui/custom-select"
import { FontPicker } from "@/components/ui/font-picker"
import { createClient } from "@/lib/supabase/client"

const BASE_FONT_OPTIONS = ["Inter", "Roboto", "Outfit", "serif"]

const FONT_WEIGHT_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "bold", label: "Bold" },
  { value: "900", label: "Black" },
]

const HORIZONTAL_ALIGNMENTS = [
  { value: "left", Icon: AlignLeft, label: "Align left", justify: "flex-start" },
  { value: "center", Icon: AlignCenter, label: "Align center", justify: "center" },
  { value: "right", Icon: AlignRight, label: "Align right", justify: "flex-end" },
  { value: "justify", Icon: AlignJustify, label: "Justify", justify: "flex-start" },
] as const

const VERTICAL_ALIGNMENTS = [
  { value: "flex-start", Icon: AlignStartHorizontal, label: "Align top" },
  { value: "center", Icon: AlignCenterHorizontal, label: "Align middle" },
  { value: "flex-end", Icon: AlignEndHorizontal, label: "Align bottom" },
] as const

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const applyStyle = (updates: Record<string, unknown>) => {
    onUpdate({ style: { ...element.style, ...updates } })
  }

  const fontOptions = Array.from(
    new Set([
      ...BASE_FONT_OPTIONS,
      ...((brandKit?.brand_fonts ?? [])
        .map((f: any) => f.font_family)
        .filter(Boolean) as string[]),
    ])
  )

  const handleAssetSelect = (asset: any) => {
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
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsAssetPickerOpen(true)}>
                    Replace
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-error hover:bg-error/10 hover:text-error"
                    onClick={() => onUpdate({ asset_id: null })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setIsAssetPickerOpen(true)}
                className="w-full h-auto py-6 flex-col gap-2 border-2 border-dashed border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                <ImageIcon size={24} className="opacity-50" />
                <span className="text-xs font-bold">Select Image</span>
              </Button>
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
              <Input type="number" name="x" value={element.x} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Y Position</label>
              <Input type="number" name="y" value={element.y} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Width</label>
              <Input type="number" name="width" value={element.width} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Height</label>
              <Input type="number" name="height" value={element.height} onChange={handleChange} />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Rotation (°)</label>
              <Input type="number" name="rotation" value={element.rotation} onChange={handleChange} />
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
              <Textarea
                name="text"
                value={element.content?.text || ''}
                onChange={handleChange}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        {/* Alignment Group (if text) */}
        {element.element_type === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-wider">
              <AlignCenter size={12} /> Alignment
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Horizontal</label>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low border border-outline-variant/30">
                {HORIZONTAL_ALIGNMENTS.map(({ value, Icon, label, justify }) => {
                  const active = (element.style?.textAlign || 'left') === value
                  return (
                    <Button
                      key={value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-pressed={active}
                      title={label}
                      aria-label={label}
                      onClick={() => applyStyle({ textAlign: value, justifyContent: justify })}
                      className={`flex-1 h-8 rounded-lg px-0 ${active ? 'bg-primary text-white shadow-sm hover:bg-primary hover:text-white' : 'text-on-surface-variant'}`}
                    >
                      <Icon size={14} />
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant ml-1">Vertical</label>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low border border-outline-variant/30">
                {VERTICAL_ALIGNMENTS.map(({ value, Icon, label }) => {
                  const active = (element.style?.alignItems || 'flex-start') === value
                  return (
                    <Button
                      key={value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-pressed={active}
                      title={label}
                      aria-label={label}
                      onClick={() => applyStyle({ alignItems: value })}
                      className={`flex-1 h-8 rounded-lg px-0 ${active ? 'bg-primary text-white shadow-sm hover:bg-primary hover:text-white' : 'text-on-surface-variant'}`}
                    >
                      <Icon size={14} />
                    </Button>
                  )
                })}
              </div>
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
                      type="button"
                      onClick={() => handleBrandColorSelect(c.color_hex)}
                      className="w-6 h-6 rounded-full border border-outline-variant/20 hover:scale-110 transition-transform shadow-sm"
                      style={{ backgroundColor: c.color_hex }}
                      title={c.name}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {element.element_type === 'text' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Font Family</label>
                  <FontPicker
                    value={element.style?.fontFamily || 'Inter'}
                    onChange={(val) => applyStyle({ fontFamily: val })}
                    options={fontOptions}
                    placeholder="Inter"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Font Size</label>
                  <Input
                    type="text"
                    name="style.fontSize"
                    value={element.style?.fontSize || '16px'}
                    onChange={handleChange}
                    placeholder="e.g. 16px, 2rem"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Font Weight</label>
                  <CustomSelect
                    name="style.fontWeight"
                    value={element.style?.fontWeight || 'normal'}
                    onChange={(val) => applyStyle({ fontWeight: val })}
                    options={FONT_WEIGHT_OPTIONS}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant ml-1">Line Height</label>
                    <Input
                      type="text"
                      name="style.lineHeight"
                      value={element.style?.lineHeight || ''}
                      onChange={handleChange}
                      placeholder="1.4"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant ml-1">Letter Spacing</label>
                    <Input
                      type="text"
                      name="style.letterSpacing"
                      value={element.style?.letterSpacing || ''}
                      onChange={handleChange}
                      placeholder="0px"
                    />
                  </div>
                </div>
              </>
            )}

            {element.element_type === 'shape' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Border Radius</label>
                  <Input
                    type="text"
                    name="style.borderRadius"
                    value={element.style?.borderRadius || '0px'}
                    onChange={handleChange}
                    placeholder="e.g. 8px, 50%"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant ml-1">Fill Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="style.backgroundColor"
                      value={element.style?.backgroundColor || '#cccccc'}
                      onChange={handleChange}
                      className="h-12 w-12 shrink-0 rounded-xl border border-outline-variant/30 overflow-hidden cursor-pointer bg-transparent"
                      aria-label="Fill color"
                    />
                    <Input
                      type="text"
                      name="style.backgroundColor"
                      value={element.style?.backgroundColor || '#cccccc'}
                      onChange={handleChange}
                      className="flex-1 uppercase"
                    />
                  </div>
                </div>
              </>
            )}
            {element.element_type === 'text' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-1">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="style.color"
                    value={element.style?.color || '#000000'}
                    onChange={handleChange}
                    className="h-12 w-12 shrink-0 rounded-xl border border-outline-variant/30 overflow-hidden cursor-pointer bg-transparent"
                    aria-label="Text color"
                  />
                  <Input
                    type="text"
                    name="style.color"
                    value={element.style?.color || '#000000'}
                    onChange={handleChange}
                    className="flex-1 uppercase"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-outline-variant/20">
          <Button
            variant="ghost"
            onClick={onDelete}
            className="w-full text-error hover:bg-error/10 hover:text-error font-bold"
          >
            <Trash2 size={14} className="mr-2" /> Delete Element
          </Button>
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
