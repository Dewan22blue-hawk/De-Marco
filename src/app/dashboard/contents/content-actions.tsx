"use client"

import { useState } from "react"
import { submitForReview, approveContent, deleteContent } from "./actions"
import { Send, CheckCircle, Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScheduleModal } from "./schedule-modal"

export function ContentActions({ contentId, status, defaultPlatform }: { contentId: string, status: string, defaultPlatform?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const handleReview = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    try {
      await submitForReview(contentId)
    } catch (error) {
      console.error("Failed to submit for review:", error)
      alert("Failed to submit for review")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (e: React.MouseEvent, schedule: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    if (schedule) {
      setIsScheduleOpen(true)
      return
    }
    
    setIsLoading(true)
    try {
      await approveContent(contentId, false)
    } catch (error) {
      console.error("Failed to approve:", error)
      alert("Failed to approve")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleConfirm = async (platform: string, scheduledAt: string, isAutoPost: boolean) => {
    await approveContent(contentId, true, platform, scheduledAt, isAutoPost)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this content?")) return
    
    setIsLoading(true)
    try {
      await deleteContent(contentId)
    } catch (error) {
      console.error(error)
      alert("Failed to delete content")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "draft") {
    return (
      <Button 
        onClick={handleReview} 
        disabled={isLoading}
        isLoading={isLoading}
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5"
      >
        <Send className="w-3.5 h-3.5" />
        Submit Review
      </Button>
    )
  }

  if (status === "review") {
    return (
      <div className="flex items-center gap-2">
        <Button 
          onClick={(e) => handleApprove(e, false)} 
          disabled={isLoading}
          isLoading={isLoading}
          size="sm"
          className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approve
        </Button>
        <Button 
          onClick={(e) => handleApprove(e, true)} 
          disabled={isLoading}
          isLoading={isLoading}
          variant="default"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          Approve & Schedule
        </Button>

        <ScheduleModal 
          open={isScheduleOpen}
          onOpenChange={setIsScheduleOpen}
          onSchedule={handleScheduleConfirm}
          defaultPlatform={defaultPlatform}
        />
      </div>
    )
  }

  return (
    <Button 
      onClick={handleDelete}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="text-error hover:bg-error/10 hover:text-error border-transparent"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}
