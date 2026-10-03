"use client"

import React, { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Copy, 
  Archive, 
  Trash2, 
  Type, 
  Square, 
  ImagePlus, 
  Save, 
  Download, 
  Layers, 
  Sliders, 
  Sparkles,
  Palette
} from "lucide-react"
import { duplicateDesign, archiveDesign, deleteDesign, updateDesignElements } from "../actions"
import { createClient } from "@/lib/supabase/client"
import { CanvasEditor } from "./canvas-editor"
import { LayersPanel } from "./layers-panel"
import { PropertiesPanel } from "./properties-panel"

export function DesignDetailClient({ 
  design, 
  brandKit, 
  initialAssetMap 
}: { 
  design: any; 
  brandKit: any; 
  initialAssetMap: Record<string, { url: string; name?: string }> 
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  const [elements, setElements] = useState<any[]>(design.design_elements || [])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'layers'>('properties')
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  const [assetMap, setAssetMap] = useState<Record<string, { url: string; name?: string }>>(initialAssetMap)

  // Scaling calculations
  const maxPreviewWidth = 800
  const maxPreviewHeight = 600
  const scale = Math.min(
    1,
    maxPreviewWidth / design.width,
    maxPreviewHeight / design.height
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateDesignElements(design.id, elements)
      alert("Design saved successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to save changes.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { toPng } = await import('html-to-image')
      const node = document.getElementById('design-canvas')
      if (!node) throw new Error("Canvas element not found")
      
      const selectedEl = selectedElementId
      setSelectedElementId(null)
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const dataUrl = await toPng(node, {
        width: design.width,
        height: design.height,
        pixelRatio: 2
      })
      
      setSelectedElementId(selectedEl)
      
      const link = document.createElement('a')
      link.download = `${design.name}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error(err)
      alert("Failed to export image.")
    } finally {
      setIsExporting(false)
    }
  }

  const updateElement = (id: string, updates: any) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const addElement = (type: 'text' | 'shape' | 'image') => {
    const newEl = {
      id: 'el-' + crypto.randomUUID(),
      element_type: type,
      x: Math.round(design.width / 2 - 100),
      y: Math.round(design.height / 2 - 50),
      width: type === 'shape' || type === 'image' ? 200 : 300,
      height: type === 'shape' || type === 'image' ? 200 : 100,
      rotation: 0,
      opacity: 1,
      z_index: elements.length + 1,
      visible: true,
      locked: false,
      content: type === 'text' ? { text: 'New Text' } : {},
      style: type === 'text' ? { fontSize: '32px', color: '#000000', fontWeight: 'bold' } : 
             type === 'shape' ? { backgroundColor: '#4F46E5', borderRadius: '16px' } : {},
    }
    setElements(prev => [...prev, newEl])
    setSelectedElementId(newEl.id)
  }

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
    if (selectedElementId === id) setSelectedElementId(null)
  }

  const selectedElement = elements.find(el => el.id === selectedElementId)

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -mx-4 -mb-20 sm:mx-0 bg-surface border border-outline-variant/20 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/designs" className="p-2 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-headline-sm font-bold text-on-surface leading-tight">{design.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                {design.design_type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">{design.width} × {design.height} {design.unit}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-4 py-2 bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-high rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Save size={16} className={isSaving ? "animate-spin" : ""} />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="clay-button-primary px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <Download size={16} className={isExporting ? "animate-spin" : ""} />
            {isExporting ? "Exporting..." : "Export PNG"}
          </button>
        </div>
      </div>

      {/* Main Studio Workspace (PRD Section 12 Layout) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar (Tools & Elements) */}
        <div className="w-16 sm:w-64 bg-surface-container-low border-r border-outline-variant/20 flex flex-col p-3 gap-2 shrink-0 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wider text-outline px-2 hidden sm:block mt-2">Add Elements</p>
          
          <button onClick={() => addElement('text')} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-high text-on-surface transition-colors">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Type size={18} />
            </div>
            <span className="text-xs font-bold hidden sm:inline">Text Box</span>
          </button>

          <button onClick={() => addElement('shape')} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-high text-on-surface transition-colors">
            <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Square size={18} />
            </div>
            <span className="text-xs font-bold hidden sm:inline">Rectangle Shape</span>
          </button>

          <button onClick={() => addElement('image')} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-high text-on-surface transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <ImagePlus size={18} />
            </div>
            <span className="text-xs font-bold hidden sm:inline">Image Frame</span>
          </button>

          {brandKit && (
            <>
              <div className="my-2 border-t border-outline-variant/20"></div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-outline px-2 hidden sm:block">Brand Assets</p>
              
              {brandKit.logo_asset_id && (
                <button 
                  onClick={() => {
                    const newEl = {
                      id: 'el-' + crypto.randomUUID(),
                      element_type: 'image',
                      x: Math.round(design.width / 2 - 100),
                      y: Math.round(design.height / 2 - 100),
                      width: 200,
                      height: 200,
                      rotation: 0,
                      opacity: 1,
                      z_index: elements.length + 1,
                      visible: true,
                      locked: false,
                      asset_id: brandKit.logo_asset_id,
                      content: {},
                      style: {}
                    }
                    setElements(prev => [...prev, newEl])
                    setSelectedElementId(newEl.id)
                  }} 
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-xs font-bold hidden sm:inline">Brand Logo</span>
                </button>
              )}

              {brandKit.brand_colors && brandKit.brand_colors.length > 0 && (
                <div className="px-2 hidden sm:block">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandKit.brand_colors.map((c: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newEl = {
                            id: 'el-' + crypto.randomUUID(),
                            element_type: 'shape',
                            x: Math.round(design.width / 2 - 50),
                            y: Math.round(design.height / 2 - 50),
                            width: 100,
                            height: 100,
                            rotation: 0,
                            opacity: 1,
                            z_index: elements.length + 1,
                            visible: true,
                            locked: false,
                            content: {},
                            style: { backgroundColor: c.color_hex, borderRadius: '8px' }
                          }
                          setElements(prev => [...prev, newEl])
                          setSelectedElementId(newEl.id)
                        }}
                        className="w-6 h-6 rounded-full border border-outline-variant/20 hover:scale-110 transition-transform shadow-sm"
                        style={{ backgroundColor: c.color_hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Center Canvas Studio Area */}
        <div className="flex-1 bg-neutral-200 dark:bg-neutral-900/80 p-8 flex flex-col items-center justify-center overflow-auto relative">
          <div className="shadow-2xl border border-outline-variant/30 rounded-lg overflow-hidden">
            <CanvasEditor 
              elements={elements}
              width={design.width}
              height={design.height}
              scale={scale}
              selectedId={selectedElementId}
              onSelect={setSelectedElementId}
              onUpdateElement={updateElement}
              assetMap={assetMap}
            />
          </div>
        </div>

        {/* Right Inspector Sidebar (Properties & Layers Tabs) */}
        <div className="w-80 bg-surface border-l border-outline-variant/20 flex flex-col shrink-0">
          <div className="flex border-b border-outline-variant/20 bg-surface-container-lowest">
            <button 
              onClick={() => setActiveRightTab('properties')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeRightTab === 'properties' ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Sliders size={14} /> Properties
            </button>
            <button 
              onClick={() => setActiveRightTab('layers')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeRightTab === 'layers' ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Layers size={14} /> Layers
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeRightTab === 'properties' ? (
              <PropertiesPanel 
                element={selectedElement} 
                onUpdate={(updates) => selectedElementId && updateElement(selectedElementId, updates)}
                onDelete={() => selectedElementId && deleteElement(selectedElementId)}
                brandKit={brandKit}
                assetMap={assetMap}
                setAssetMap={setAssetMap}
              />
            ) : (
              <LayersPanel 
                elements={elements} 
                selectedId={selectedElementId}
                onSelect={setSelectedElementId}
                onUpdateElement={updateElement}
                onDeleteElement={deleteElement}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
