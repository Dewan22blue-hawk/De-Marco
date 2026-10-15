"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createContent } from "../actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"

export function CreateContentForm({
  campaigns = [],
  canLinkCampaigns = false,
}: {
  campaigns?: { id: string; name: string }[]
  canLinkCampaigns?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const initialCampaignId = searchParams.get("campaign_id") || ""
  const [campaignId, setCampaignId] = useState(initialCampaignId)

  const [formData, setFormData] = useState({
    title: searchParams.get("title") || "",
    body: searchParams.get("body") || "",
    platform: searchParams.get("platform") || "other",
    content_type: searchParams.get("content_type") || "post",
    status: "draft"
  })

  // Load generated content from sessionStorage on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("generated_content_form")
      if (stored) {
        const data = JSON.parse(stored)
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          body: data.body || prev.body,
          platform: data.platform || prev.platform,
          content_type: data.content_type || prev.content_type,
        }))
        if (data.campaign_id && canLinkCampaigns) {
          setCampaignId(data.campaign_id)
        }
        sessionStorage.removeItem("generated_content_form")
      }
    } catch (e) {
      console.error("Failed to load generated content:", e)
    }
  }, [canLinkCampaigns])

  const selectedCampaign = campaigns.find(c => c.id === campaignId)

  const campaignOptions = [
    { value: "", label: "No campaign" },
    ...campaigns.map(c => ({ value: c.id, label: c.name }))
  ]

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
        const payload: any = {
          ...formData,
          campaign_id: canLinkCampaigns && campaignId ? campaignId : undefined,
        }
        const res = await createContent(payload)
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

      {initialCampaignId && (
        <div className={`p-4 rounded-xl border flex flex-col gap-1 ${
          canLinkCampaigns 
            ? "bg-primary/5 border-primary/20 text-on-surface"
            : "bg-surface-container-high border-outline-variant/30 text-on-surface-variant"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Campaign Association
            </span>
            {!canLinkCampaigns && (
              <span className="text-xs text-rose-500 font-semibold">Read-only (No permission)</span>
            )}
          </div>
          <p className="text-sm font-semibold">
            {selectedCampaign?.name || "Linked Campaign"}
          </p>
          {!canLinkCampaigns && (
            <p className="text-xs text-on-surface-variant">
              You lack campaign update permissions; this content will be created without linking to the campaign.
            </p>
          )}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="space-y-1">
          <label className="text-sm font-semibold text-on-surface">Campaign</label>
          <CustomSelect 
            name="campaign_id"
            value={canLinkCampaigns ? campaignId : (initialCampaignId ? initialCampaignId : "")}
            onChange={(val) => setCampaignId(val)}
            options={campaignOptions}
            disabled={!canLinkCampaigns}
            placeholder="No campaign"
          />
          {!canLinkCampaigns && (
            <p className="text-xs text-on-surface-variant/80">
              Only Campaign Managers can link content to a campaign.
            </p>
          )}
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
