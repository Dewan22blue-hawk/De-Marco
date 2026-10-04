"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createContent } from "../actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"

export function CreateContentForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    platform: "other",
    content_type: "post",
    status: "draft"
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
        const res = await createContent(formData)
        if (res.success) {
          router.push("/dashboard/contents")
        }
      } catch (err: any) {
        setError(err.message || "Failed to create content")
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
            rows={6}
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
                { value: "twitter", label: "Twitter / X" },
                { value: "linkedin", label: "LinkedIn" },
                { value: "tiktok", label: "TikTok" },
                { value: "website", label: "Website / Blog" },
                { value: "email", label: "Email" },
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
                { value: "article", label: "Article" },
                { value: "email", label: "Email Campaign" },
                { value: "script", label: "Video Script" },
                { value: "ad_copy", label: "Ad Copy" }
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/20">
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
          Create Draft
        </Button>
      </div>
    </form>
  )
}
