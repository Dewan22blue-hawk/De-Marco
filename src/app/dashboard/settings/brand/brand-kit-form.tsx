"use client"

import { useState, useTransition } from "react"
import { upsertBrandKit } from "./actions"

export function BrandKitForm({ initialData, organizationId }: { initialData: any, organizationId: string }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  
  // Initialize with existing colors or defaults
  const defaultColors = [
    { id: "new_1", name: "Primary", hex_code: "#4F46E5", role: "primary" },
    { id: "new_2", name: "Secondary", hex_code: "#7C3AED", role: "secondary" },
    { id: "new_3", name: "Accent", hex_code: "#06B6D4", role: "accent" }
  ]
  const [colors, setColors] = useState<any[]>(initialData?.brand_colors?.length > 0 ? initialData.brand_colors : defaultColors)

  const handleAddColor = () => {
    setColors([...colors, { id: `new_${Date.now()}`, name: "Custom", hex_code: "#000000", role: "custom" }])
  }

  const handleRemoveColor = (id: string) => {
    setColors(colors.filter(c => c.id !== id))
  }

  const handleColorChange = (id: string, field: string, value: string) => {
    setColors(colors.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get("name"),
      tagline: formData.get("tagline"),
      colors: colors.map((c, idx) => ({ ...c, sort_order: idx })),
      fonts: [
        { name: "Heading", role: "heading", font_family: formData.get("heading_font") },
        { name: "Body", role: "body", font_family: formData.get("body_font") },
      ]
    }

    startTransition(async () => {
      try {
        const res = await upsertBrandKit(organizationId, data)
        if (res.success) {
          setMessage({ type: "success", text: "Brand settings updated successfully." })
        }
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to update brand." })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`p-4 rounded-xl text-body-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-error-container text-on-error-container border-error'}`}>
          {message.text}
        </div>
      )}

      {/* Main Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Brand Name</label>
          <input 
            name="name" 
            defaultValue={initialData?.name || "My Default Brand"} 
            required 
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Tagline</label>
          <input 
            name="tagline" 
            defaultValue={initialData?.tagline || ""} 
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
      </div>

      <hr className="border-outline-variant/20" />

      {/* Brand Colors - CRUD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Brand Colors</h3>
          <button 
            type="button" 
            onClick={handleAddColor}
            className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary-container/80 font-label-code-sm text-label-code-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add Color
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {colors.map((color) => (
            <div key={color.id} className="relative group flex flex-col gap-2 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 transition-colors">
              <button 
                type="button" 
                onClick={() => handleRemoveColor(color.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-surface shadow-sm border border-outline-variant/30 flex items-center justify-center text-error opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
              
              <div className="w-full aspect-square rounded-xl shadow-inner border border-outline-variant/20 relative overflow-hidden" style={{ backgroundColor: color.hex_code }}>
                <input 
                  type="color" 
                  value={color.hex_code}
                  onChange={(e) => handleColorChange(color.id, "hex_code", e.target.value)}
                  className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <input 
                  type="text" 
                  value={color.name}
                  onChange={(e) => handleColorChange(color.id, "name", e.target.value)}
                  className="w-full bg-transparent text-label-code-sm font-label-code-sm font-bold text-on-surface outline-none focus:border-b focus:border-primary px-1"
                />
                <input 
                  type="text" 
                  value={color.hex_code}
                  onChange={(e) => handleColorChange(color.id, "hex_code", e.target.value)}
                  className="w-full bg-transparent text-label-code-sm font-label-code-sm text-outline outline-none px-1 uppercase"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-outline-variant/20" />

      {/* Typography */}
      <div className="space-y-4">
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Typography</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Heading Font</label>
            <input 
              name="heading_font" 
              defaultValue={initialData?.brand_fonts?.find((f:any) => f.role === 'heading')?.font_family || "Plus Jakarta Sans"} 
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Body Font</label>
            <input 
              name="body_font" 
              defaultValue={initialData?.brand_fonts?.find((f:any) => f.role === 'body')?.font_family || "Inter"} 
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="clay-button-primary px-6 py-2.5 rounded-xl text-white font-headline-sm text-body-md font-semibold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Brand Kit
            </>
          )}
        </button>
      </div>
    </form>
  )
}
