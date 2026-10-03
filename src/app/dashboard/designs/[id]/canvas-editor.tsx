"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Move, Maximize2, RotateCw, Lock, Unlock, Eye, EyeOff } from "lucide-react"

interface Element {
  id: string
  element_type: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  z_index: number
  visible: boolean
  locked: boolean
  content: any
  style: any
  asset_id?: string
}

interface CanvasEditorProps {
  elements: Element[]
  width: number
  height: number
  onUpdateElement: (id: string, updates: Partial<Element>) => void
  onDeleteElement: (id: string) => void
  onDuplicateElement: (id: string) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  scale: number
  assetMap?: Record<string, { url: string; name?: string }>
}

type InteractionMode = 'drag' | 'resize' | 'rotate' | null

export function CanvasEditor({ 
  elements, 
  width, 
  height, 
  onUpdateElement, 
  onDeleteElement,
  onDuplicateElement,
  selectedId, 
  onSelect,
  scale,
  assetMap = {}
}: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [interaction, setInteraction] = useState<{ 
    id: string, 
    mode: InteractionMode,
    startX: number, 
    startY: number, 
    initialX: number, 
    initialY: number,
    initialWidth: number,
    initialHeight: number,
    initialRotation: number
  } | null>(null)

  const handleMouseDown = (e: React.MouseEvent, el: Element, mode: InteractionMode = 'drag') => {
    if (el.locked || !el.visible) return
    e.stopPropagation()
    onSelect(el.id)
    
    setInteraction({
      id: el.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialWidth: el.width,
      initialHeight: el.height,
      initialRotation: el.rotation
    })
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedId) return
    
    // Don't trigger if user is typing in an input
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

    if (e.key === 'Delete' || e.key === 'Backspace') {
      onDeleteElement(selectedId)
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault()
      onDuplicateElement(selectedId)
    }
  }, [selectedId, onDeleteElement, onDuplicateElement])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!interaction) return
      
      const dx = (e.clientX - interaction.startX) / scale
      const dy = (e.clientY - interaction.startY) / scale
      
      if (interaction.mode === 'drag') {
        onUpdateElement(interaction.id, {
          x: Math.round(interaction.initialX + dx),
          y: Math.round(interaction.initialY + dy)
        })
      } else if (interaction.mode === 'resize') {
        onUpdateElement(interaction.id, {
          width: Math.max(10, Math.round(interaction.initialWidth + dx)),
          height: Math.max(10, Math.round(interaction.initialHeight + dy))
        })
      } else if (interaction.mode === 'rotate') {
        // Simple rotation logic based on horizontal mouse movement
        onUpdateElement(interaction.id, {
          rotation: Math.round(interaction.initialRotation + dx) % 360
        })
      }
    }

    const handleMouseUp = () => {
      setInteraction(null)
    }

    if (interaction) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [interaction, scale, onUpdateElement])

  const selectedEl = elements.find(el => el.id === selectedId)

  return (
    <div 
      ref={containerRef}
      className="relative bg-white shadow-2xl overflow-hidden"
      style={{
        width: width * scale,
        height: height * scale,
        cursor: interaction?.mode === 'drag' ? "grabbing" : "default"
      }}
      onClick={() => onSelect(null)}
    >
      <div 
        id="design-canvas"
        style={{
          width: width,
          height: height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative"
        }}
      >
        {elements
          .sort((a, b) => a.z_index - b.z_index)
          .map((el) => (
            <div
              key={el.id}
              onMouseDown={(e) => handleMouseDown(e, el)}
              className={`absolute group transition-shadow ${
                selectedId === el.id ? "ring-2 ring-primary ring-offset-2 z-[9999]" : "hover:ring-1 hover:ring-primary/50"
              } ${el.locked ? "cursor-not-allowed" : "cursor-grab"} ${!el.visible ? "hidden" : ""}`}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                transform: `rotate(${el.rotation}deg)`,
                opacity: el.opacity,
                zIndex: el.z_index,
                ...(el.style as React.CSSProperties)
              }}
            >
              {/* Resize Handle (Bottom Right) */}
              {selectedId === el.id && !el.locked && (
                <div 
                  onMouseDown={(e) => handleMouseDown(e, el, 'resize')}
                  className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-primary rounded-sm cursor-nwse-resize z-50 flex items-center justify-center"
                >
                  <div className="w-1 h-1 bg-primary rounded-full" />
                </div>
              )}

              {/* Rotate Handle */}
              {selectedId === el.id && !el.locked && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-primary z-50">
                  <div 
                    onMouseDown={(e) => handleMouseDown(e, el, 'rotate')}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full flex items-center justify-center cursor-alias hover:scale-110 transition-transform shadow-sm"
                  >
                    <RotateCw className="w-3 h-3 text-primary" />
                  </div>
                </div>
              )}

              {/* Element Selection Corners (visual only) */}
              {selectedId === el.id && !el.locked && (
                <>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-primary" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-primary" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-primary" />
                </>
              )}

              {/* Element Content Renderers */}
              {el.element_type === 'text' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', ...(el.style as any) }}>
                  {el.content?.text || 'Text'}
                </div>
              )}
              {el.element_type === 'shape' && (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: el.style?.backgroundColor || '#ccc', 
                  borderRadius: el.style?.borderRadius || 0,
                  ...el.style
                }} />
              )}
              {el.element_type === 'image' && el.asset_id && (
                 <div className="w-full h-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-outline-variant/10">
                   {assetMap[el.asset_id]?.url ? (
                     <img src={assetMap[el.asset_id].url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                   ) : (
                     <span className="text-[10px] text-outline font-bold uppercase">{el.element_type}</span>
                   )}
                 </div>
              )}
              
              {/* Status Icons */}
              <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {el.locked && <Lock className="w-3 h-3 text-on-surface-variant bg-surface/80 rounded p-0.5" />}
                {!el.visible && <EyeOff className="w-3 h-3 text-on-surface-variant bg-surface/80 rounded p-0.5" />}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
