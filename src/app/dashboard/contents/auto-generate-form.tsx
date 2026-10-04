"use client"

import { useState } from "react"
import { autoGenerateContent } from "./actions"
import { Sparkles, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function AutoGenerateForm() {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    try {
      await autoGenerateContent(topic)
      setTopic("")
      router.refresh()
    } catch (error) {
      console.error("Failed to generate content:", error)
      alert("Failed to generate content")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleGenerate} className="flex gap-2 w-full max-w-lg">
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
        className="clay-button-primary px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Generate
      </button>
    </form>
  )
}
