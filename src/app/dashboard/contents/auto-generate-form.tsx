"use client"

import { useState } from "react"
import { createContent, generateContentWithAI } from "./actions"
import { Sparkles, Loader2, ArrowRight, Save, Palette } from "lucide-react"
import { useRouter } from "next/navigation"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel } from "@/components/ui/alert-modal"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { storeDesignBrief } from "@/lib/design/content-brief"

interface GeneratedContent {
  title: string
  body: string
  hashtags?: string[]
  cta?: string
  tone?: string
  content_type?: string
}

export function AutoGenerateForm({
  campaigns = [],
  canLinkCampaigns = false,
}: {
  campaigns?: { id: string; name: string }[]
  canLinkCampaigns?: boolean
}) {
  const [topic, setTopic] = useState("")
  const [contentType, setContentType] = useState("post")
  const [platform, setPlatform] = useState("instagram")
  const [campaignId, setCampaignId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [generatedData, setGeneratedData] = useState<GeneratedContent | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const router = useRouter()

  const campaignOptions = [
    { value: "", label: "No campaign" },
    ...(campaigns || []).map((c) => ({ value: c.id, label: c.name })),
  ]

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    setShowModal(true)
    setGeneratedData(null)
    setGenerationError(null)
    
    try {
      const activeCampaignId = canLinkCampaigns && campaignId ? campaignId : undefined
      const result = await generateContentWithAI(topic, contentType, activeCampaignId)
      setGeneratedData(result.generated)
    } catch (error: any) {
      console.error("Failed to generate content:", error)
      const errorMessage = error?.message || "Failed to generate content"
      setGenerationError(errorMessage)
      setGeneratedData({ error: errorMessage } as any)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!generatedData || generationError) return
    setIsLoading(true)
    try {
      await createContent({
        title: generatedData.title,
        body: generatedData.body,
        platform: platform,
        content_type: generatedData.content_type || contentType,
        status: "draft",
        campaign_id: canLinkCampaigns && campaignId ? campaignId : undefined,
      })
      setTopic("")
      setShowModal(false)
      router.refresh()
    } catch (error: any) {
      setGenerationError(error?.message || "Failed to save draft")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyToForm = () => {
    if (!generatedData || generationError) return
    
    // Use sessionStorage to pass large content instead of URL params
    try {
      const formData = {
        title: generatedData.title || "",
        body: generatedData.body || "",
        content_type: generatedData.content_type || contentType,
        hashtags: Array.isArray(generatedData.hashtags) ? generatedData.hashtags.join(" ") : (generatedData.hashtags || ""),
        platform: platform,
        campaign_id: canLinkCampaigns && campaignId ? campaignId : "",
      }
      sessionStorage.setItem("generated_content_form", JSON.stringify(formData))
      setShowModal(false)
      setTopic("")
      router.push("/dashboard/contents/new")
    } catch (error) {
      console.error("Failed to store generated content:", error)
      setGenerationError("Failed to apply content to form")
    }
  }

  const handleCreateDesign = async () => {
    if (!generatedData || generationError) return
    setIsLoading(true)
    setGenerationError(null)

    const activeCampaignId = canLinkCampaigns && campaignId ? campaignId : undefined

    try {
      // Persist the generated copy so it lives in the Content Library
      const saved = await createContent({
        title: generatedData.title,
        body: generatedData.body,
        platform: platform,
        content_type: generatedData.content_type || contentType,
        status: "draft",
        campaign_id: activeCampaignId,
      })

      // Hand the brief to the Creative Studio for confirmation
      storeDesignBrief({
        title: generatedData.title,
        body: generatedData.body,
        hashtags: generatedData.hashtags,
        cta: generatedData.cta,
        content_type: generatedData.content_type || contentType,
        platform: platform,
        campaign_id: activeCampaignId ?? null,
        content_id: saved?.content?.id ?? null,
      })

      setShowModal(false)
      setTopic("")
      router.push("/dashboard/designs/new")
    } catch (error: any) {
      console.error("Failed to start design from content:", error)
      setGenerationError(error?.message || "Failed to create design from content")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleGenerate} className="flex flex-col gap-3 w-full max-w-3xl">
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="px-4 py-2 bg-surface rounded-lg border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            disabled={isLoading}
          >
            <option value="post">Social Post</option>
            <option value="story">Story</option>
            <option value="reel">Reel</option>
            <option value="article">Article</option>
            <option value="announcement">Announcement</option>
          </select>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-4 py-2 bg-surface rounded-lg border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            disabled={isLoading}
          >
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="website">Website / Blog</option>
          </select>
          <input
            type="text"
            placeholder="Topic for AI generation (e.g. Summer Sale)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-surface rounded-lg border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="clay-button-primary px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate with AI
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="w-full sm:w-64">
            <CustomSelect
              value={canLinkCampaigns ? campaignId : ""}
              onChange={setCampaignId}
              options={campaignOptions}
              disabled={!canLinkCampaigns}
              placeholder="No campaign"
            />
          </div>
          {!canLinkCampaigns && (
            <span className="text-xs text-on-surface-variant/80">
              Only Campaign Managers can link content to a campaign.
            </span>
          )}
        </div>
      </form>

      <AlertModal open={showModal} onOpenChange={(open) => !isLoading && setShowModal(open)}>
        <AlertModalContent className="max-w-2xl">
          <AlertModalHeader>
            <AlertModalTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> 
              AI Content Generator
            </AlertModalTitle>
            <AlertModalDescription>
              {isLoading ? "Drafting engaging content for your campaign..." : "Review the generated content below."}
            </AlertModalDescription>
          </AlertModalHeader>

          <div className="p-6 pt-0">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-surface-container-high rounded-md w-3/4"></div>
                <div className="h-24 bg-surface-container-high rounded-md w-full"></div>
                <div className="h-4 bg-surface-container-high rounded-md w-1/2"></div>
              </div>
            ) : generationError ? (
              <div className="p-4 bg-error/10 text-error rounded-xl">
                <p className="font-medium mb-2">Generation Failed</p>
                <p className="text-sm">{generationError}</p>
                {generationError.includes("AI_NOT_CONFIGURED") && (
                  <Button variant="outline" className="mt-3" onClick={() => router.push("/dashboard/settings?tab=ai")}>
                    Configure AI Settings
                  </Button>
                )}
              </div>
            ) : generatedData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-on-surface-variant mb-1">Generated Title</h4>
                  <p className="text-on-surface font-semibold text-lg">{generatedData.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface-variant mb-1">Content Body</h4>
                  <div className="p-4 bg-surface-container-low rounded-xl text-on-surface whitespace-pre-wrap font-medium">
                    {generatedData.body}
                  </div>
                </div>
                {generatedData.hashtags && (
                  <div>
                    <h4 className="text-sm font-bold text-on-surface-variant mb-1">Hashtags</h4>
                    <p className="text-primary font-medium">{Array.isArray(generatedData.hashtags) ? generatedData.hashtags.join(" ") : generatedData.hashtags}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <AlertModalFooter className="border-t border-outline-variant/30 mt-0 pt-4">
            <AlertModalCancel disabled={isLoading}>Cancel</AlertModalCancel>
            {!isLoading && !generationError && (
              <>
                <Button variant="outline" onClick={handleSaveDraft} isLoading={isLoading}>
                  <Save className="w-4 h-4 mr-2" /> Save as Draft
                </Button>
                <Button variant="outline" onClick={handleApplyToForm} isLoading={isLoading}>
                  Apply to Form <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="default" onClick={handleCreateDesign} isLoading={isLoading}>
                  <Palette className="w-4 h-4 mr-2" /> Create Design
                </Button>
              </>
            )}
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>
    </>
  )
}
