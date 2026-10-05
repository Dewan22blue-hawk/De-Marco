"use client"

import { useState } from "react"
import { autoGenerateContent, generateContentWithAI } from "./actions"
import { Sparkles, Loader2, ArrowRight, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel } from "@/components/ui/alert-modal"
import { Button } from "@/components/ui/button"

export function AutoGenerateForm() {
  const [topic, setTopic] = useState("")
  const [contentType, setContentType] = useState("post")
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)
  const router = useRouter()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    setShowModal(true)
    setGeneratedData(null)
    
    try {
      const result = await generateContentWithAI(topic, contentType)
      setGeneratedData(result.generated)
    } catch (error) {
      console.error("Failed to generate content:", error)
      setGeneratedData({ error: "Failed to generate content" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!generatedData || generatedData.error) return
    setIsLoading(true)
    try {
      // Legacy flow or just close modal since generateContentWithAI already saved it
      await autoGenerateContent(topic, contentType) 
      setTopic("")
      setShowModal(false)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyToForm = () => {
    if (!generatedData || generatedData.error) return
    const params = new URLSearchParams()
    if (generatedData.title) params.set("title", generatedData.title)
    if (generatedData.body) params.set("body", generatedData.body)
    if (generatedData.content_type) params.set("content_type", generatedData.content_type)
    if (generatedData.hashtags) params.set("hashtags", Array.isArray(generatedData.hashtags) ? generatedData.hashtags.join(" ") : generatedData.hashtags)
    
    setShowModal(false)
    setTopic("")
    router.push(`/dashboard/contents/new?${params.toString()}`)
  }

  return (
    <>
      <form onSubmit={handleGenerate} className="flex gap-2 w-full max-w-lg">
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
        <input
        type="text"
        placeholder="Topic for AI generation (e.g. Summer Sale)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="flex-1 px-4 py-2 bg-surface rounded-lg border border-outline-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
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
            ) : generatedData?.error ? (
              <div className="p-4 bg-error/10 text-error rounded-xl">
                {generatedData.error}
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
            {!isLoading && !generatedData?.error && (
              <>
                <Button variant="outline" onClick={handleSaveDraft} isLoading={isLoading}>
                  <Save className="w-4 h-4 mr-2" /> Save as Draft
                </Button>
                <Button variant="default" onClick={handleApplyToForm} isLoading={isLoading}>
                  Apply to Form <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>
    </>
  )
}
