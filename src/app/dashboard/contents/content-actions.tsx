"use client"

import { useState } from "react"
import { submitForReview, approveContent, deleteContent } from "./actions"
import { Send, CheckCircle, Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScheduleModal } from "./schedule-modal"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel, AlertModalAction } from "@/components/ui/alert-modal"

export function ContentActions({ contentId, status, defaultPlatform }: { contentId: string, status: string, defaultPlatform?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleReview = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    try {
      await submitForReview(contentId)
    } catch (error: any) {
      console.error("Failed to submit for review:", error)
      setErrorMsg(error?.message || "Failed to submit for review")
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
    } catch (error: any) {
      console.error("Failed to approve:", error)
      setErrorMsg(error?.message || "Failed to approve")
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleConfirm = async (platform: string, scheduledAt: string, isAutoPost: boolean) => {
    try {
      await approveContent(contentId, true, platform, scheduledAt, isAutoPost)
    } catch (error: any) {
      setErrorMsg(error?.message || "Failed to schedule content")
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    setIsLoading(true)
    try {
      await deleteContent(contentId)
    } catch (error: any) {
      console.error(error)
      setErrorMsg(error?.message || "Failed to delete content")
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
    <>
      <Button 
        onClick={handleDelete}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="text-error hover:bg-error/10 hover:text-error border-transparent"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>

      <AlertModal open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertModalContent onClick={(e) => e.stopPropagation()}>
          <AlertModalHeader>
            <AlertModalTitle>Delete content</AlertModalTitle>
            <AlertModalDescription>
              Are you sure you want to delete this content? This action cannot be undone.
            </AlertModalDescription>
          </AlertModalHeader>
          <AlertModalFooter>
            <AlertModalCancel onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>Cancel</AlertModalCancel>
            <AlertModalAction className="bg-red-600 hover:bg-red-700" onClick={(e) => { e.stopPropagation(); confirmDelete(); }}>
              Delete
            </AlertModalAction>
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>

      <AlertModal open={errorMsg !== null} onOpenChange={(open) => !open && setErrorMsg(null)}>
        <AlertModalContent onClick={(e) => e.stopPropagation()}>
          <AlertModalHeader>
            <AlertModalTitle>Action Failed</AlertModalTitle>
            <AlertModalDescription>{errorMsg}</AlertModalDescription>
          </AlertModalHeader>
          <AlertModalFooter>
            <AlertModalAction onClick={(e) => { e.stopPropagation(); setErrorMsg(null); }}>OK</AlertModalAction>
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>
    </>
  )
}
