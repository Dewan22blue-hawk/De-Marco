"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { updateContent } from "../actions"

export function EditContentForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    body: initialData.body || "",
    platform: initialData.platform || "other",
    content_type: initialData.content_type || "post"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    startTransition(async () => {
      try {
        const res = await updateContent(initialData.id, formData)
        if (res.success) {
          router.push("/dashboard/contents")
          router.refresh()
        }
      } catch (err: any) {
        setError(err.message || "Failed to update content")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-error-container text-on-error-container border border-error rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
            Content Title <span className="text-error">*</span>
          </label>
          <Input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Q3 Launch Announcement"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-on-surface">Content Body</label>
          <Textarea 
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Write your content here..."
            rows={8}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-on-surface">Platform</label>
            <CustomSelect 
              name="platform"
              value={formData.platform}
              onChange={(val) => setFormData(prev => ({ ...prev, platform: val }))}
              options={[
                { value: "instagram", label: "Instagram" },
                { value: "facebook", label: "Facebook" },
                { value: "linkedin", label: "LinkedIn" },
                { value: "whatsapp", label: "WhatsApp" },
                { value: "website", label: "Website / Blog" },
                { value: "other", label: "Other" }
              ]}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-on-surface">Content Type</label>
            <CustomSelect 
              name="content_type"
              value={formData.content_type}
              onChange={(val) => setFormData(prev => ({ ...prev, content_type: val }))}
              options={[
                { value: "post", label: "Social Post" },
                { value: "story", label: "Story" },
                { value: "reel", label: "Reel" },
                { value: "article", label: "Article" },
                { value: "announcement", label: "Announcement" }
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
        <div className="text-sm text-on-surface-variant">
          Status: <span className="font-semibold px-2 py-1 bg-surface-container rounded-md">{initialData.status}</span>
        </div>
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="ghost"
            onClick={() => router.back()} 
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="default"
            isLoading={isPending}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  )
}
