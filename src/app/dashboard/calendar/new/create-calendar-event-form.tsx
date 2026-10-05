"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createCalendarEvent } from "../actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { DatetimePicker } from "@/components/ui/datetime-picker"

export function CreateCalendarEventForm({ contents, campaigns }: { contents: any[], campaigns: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    content_id: "",
    campaign_id: "",
    platform: "instagram",
    scheduled_at: "",
    status: "scheduled",
    is_auto_post: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.content_id) {
      setError("Please select a content to schedule")
      return
    }

    if (!formData.scheduled_at) {
      setError("Please select a schedule time")
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          ...formData,
          campaign_id: formData.campaign_id || null
        }
        const res = await createCalendarEvent(payload)
        if (res.success) {
          router.push("/dashboard/calendar")
        }
      } catch (err: any) {
        setError(err.message || "Failed to schedule content")
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
            Content <span className="text-error">*</span>
          </label>
          <CustomSelect 
            name="content_id"
            value={formData.content_id}
            onChange={(val) => setFormData(prev => ({ ...prev, content_id: val }))}
            placeholder="Select content"
            options={contents.map(c => ({ value: c.id, label: `${c.title} (${c.status})` }))}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-on-surface">Campaign (Optional)</label>
          <CustomSelect 
            name="campaign_id"
            value={formData.campaign_id}
            onChange={(val) => setFormData(prev => ({ ...prev, campaign_id: val }))}
            placeholder="None"
            options={campaigns.map(c => ({ value: c.id, label: c.name }))}
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
            <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
              Scheduled Date & Time <span className="text-error">*</span>
            </label>
            <DatetimePicker 
              name="scheduled_at"
              value={formData.scheduled_at}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input 
            type="checkbox"
            id="is_auto_post"
            checked={formData.is_auto_post}
            onChange={(e) => setFormData(prev => ({ ...prev, is_auto_post: e.target.checked }))}
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
          />
          <label htmlFor="is_auto_post" className="text-sm font-medium text-on-surface">
            Enable Auto-Post via n8n
          </label>
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
          Schedule
        </Button>
      </div>
    </form>
  )
}
