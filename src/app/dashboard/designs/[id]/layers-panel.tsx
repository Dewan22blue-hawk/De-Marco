"use client"

import React from "react"
import { Eye, EyeOff, Lock, Unlock, Layers, ChevronUp, ChevronDown, Trash2 } from "lucide-react"

export function LayersPanel({ 
  elements, 
  selectedId, 
  onSelect, 
  onUpdateElement,
  onDeleteElement
}: { 
  elements: any[], 
  selectedId: string | null, 
  onSelect: (id: string) => void,
  onUpdateElement: (id: string, updates: any) => void,
  onDeleteElement: (id: string) => void
}) {
  const sortedElements = [...elements].sort((a, b) => b.z_index - a.z_index)

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    onUpdateElement(id, { z_index: el.z_index + (direction === 'up' ? 1 : -1) })
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center gap-2 p-4 border-b border-outline-variant/20">
        <Layers className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-on-surface text-sm">Layers</h3>
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant">
          {elements.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedElements.map((el) => (
          <div 
            key={el.id}
            onClick={() => onSelect(el.id)}
            className={`group flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer border ${
              selectedId === el.id 
                ? "bg-primary/10 border-primary/30" 
                : "hover:bg-surface-container-low border-transparent"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              selectedId === el.id ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
            }`}>
              <span className="text-[10px] font-bold uppercase">{el.element_type[0]}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold truncate ${selectedId === el.id ? "text-primary" : "text-on-surface"}`}>
                {el.role || el.name || `${el.element_type.charAt(0).toUpperCase() + el.element_type.slice(1)}`}
              </p>
              <p className="text-[10px] text-outline truncate">Z-Index: {el.z_index}</p>
            </div>

            <div className={`flex items-center gap-1 transition-opacity ${selectedId === el.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateElement(el.id, { visible: !el.visible }) }}
                className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant"
              >
                {el.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-error" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateElement(el.id, { locked: !el.locked }) }}
                className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant"
              >
                {el.locked ? <Lock size={14} className="text-amber-600" /> : <Unlock size={14} />}
              </button>
              <div className="flex flex-col gap-0.5 ml-1">
                <button onClick={(e) => { e.stopPropagation(); handleMove(el.id, 'up') }} className="p-0.5 hover:bg-surface-container-high rounded text-on-surface-variant"><ChevronUp size={10} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleMove(el.id, 'down') }} className="p-0.5 hover:bg-surface-container-high rounded text-on-surface-variant"><ChevronDown size={10} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
