"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit2, Copy, Loader2, Archive } from "lucide-react"
import type { TemplateWithRelations } from "@/schemas/template"
import { cloneTemplate, archiveTemplate } from "../actions"

interface TemplateVariable {
  id: string
  variable_key: string
  label: string
  variable_type: string
  default_value: string | null
  placeholder: string | null
  is_required: boolean
  max_length: number | null
  validation_rules: Record<string, unknown>
}

interface TemplateElement {
  id: string
  element_type: string
  role: string | null
  variable_id: string | null
  asset_id: string | null
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  z_index: number
  visible: boolean
  locked: boolean
  content: string | null
  style: Record<string, unknown>
  metadata: Record<string, unknown>
}

interface Props {
  template: TemplateWithRelations
}

export function TemplateDetailClient({ template }: Props) {
  const router = useRouter()
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleDuplicate = async () => {
    if (!template.id) {
      setMessage({ type: "error", text: "Template tidak valid." })
      return
    }

    setIsDuplicating(true)
    setMessage(null)

    try {
      const res = await cloneTemplate(template.id, `${template.name} - Copy`)
      if (res.success) {
        setMessage({ type: "success", text: "Template berhasil diduplikasi." })
        router.push(`/dashboard/templates/${res.data.id}`)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menduplikasi template."
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleArchive = async () => {
    if (!template.id) {
      setMessage({ type: "error", text: "Template tidak valid." })
      return
    }

    setIsArchiving(true)
    setMessage(null)

    try {
      const res = await archiveTemplate(template.id)
      if (res.success) {
        setMessage({ type: "success", text: "Template berhasil diarsipkan." })
        router.push("/dashboard/templates")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengarsipkan template."
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setIsArchiving(false)
    }
  }

  const getThumbnailUrl = (path: string | null | undefined) => {
    if (!path) return null
    return `/api/storage/assets/${path}`
  }

  const thumbUrl = getThumbnailUrl(template.thumbnail?.storage_path)
  const bgUrl = getThumbnailUrl(template.background?.storage_path)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/templates" 
          className="p-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">{template.name}</h1>
          <p className="text-on-surface-variant mt-1">
            {template.format_code} &middot; {template.width}×{template.height}{template.unit} &middot; Used {template.usage_count} times
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-body-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="clay-surface rounded-3xl overflow-hidden border border-outline-variant/20">
            <div className="aspect-video relative bg-surface-container-low overflow-hidden">
              {bgUrl ? (
                <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-container-low" />
              )}
              {thumbUrl && (
                <img
                  src={thumbUrl}
                  alt={template.name}
                  className="absolute inset-0 w-full h-full object-contain p-4"
                />
              )}
            </div>
          </div>

          <div className="clay-surface rounded-3xl p-4 border border-outline-variant/20">
            <h3 className="font-semibold text-on-surface mb-3">Template Structure ({template.template_elements.length} elements)</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {template.template_elements.map((el) => (
                <div key={el.id} className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-low">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">
                    {el.z_index}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-on-surface text-sm capitalize">{el.element_type}</span>
                      {el.role && <span className="px-1.5 py-0.5 rounded text-xs bg-surface-container-high text-on-surface-variant">{el.role}</span>}
                      {el.variable_id && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-secondary/10 text-secondary">Variable</span>
                      )}
                    </div>
                    <div className="text-xs text-outline">
                      {el.width}×{el.height} at ({el.x}, {el.y}) · z-index: {el.z_index}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="clay-surface rounded-3xl p-6 border border-outline-variant/20 sticky top-24">
            <h3 className="font-semibold text-on-surface mb-4">Template Info</h3>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <div className="flex justify-between gap-3"><span>Category</span><span className="font-medium text-on-surface">{template.category?.name || "Uncategorized"}</span></div>
              <div className="flex justify-between gap-3"><span>Type</span><span className="font-medium text-on-surface capitalize">{template.template_type}</span></div>
              <div className="flex justify-between gap-3"><span>Version</span><span className="font-medium text-on-surface">1</span></div>
              <div className="flex justify-between gap-3"><span>Status</span><span className="font-medium text-on-surface">{template.is_active === false ? "Archived" : "Active"}</span></div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-3">
              <button
                onClick={handleDuplicate}
                disabled={isDuplicating}
                className="w-full clay-button-primary py-3 rounded-xl text-white font-headline-sm text-body-md font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isDuplicating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Duplicate Template
                  </>
                )}
              </button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="w-full border border-outline-variant/30 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Archive size={18} />
                {isArchiving ? "Archiving..." : "Archive Template"}
              </button>
              <Link
                href="/dashboard/templates"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high font-headline-sm text-body-md font-semibold text-on-surface border border-outline-variant/40 flex items-center justify-center gap-2"
              >
                <Edit2 size={18} />
                <span>Back to Library</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}