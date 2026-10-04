"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel } from "@/components/ui/alert-modal"

export function ScheduleModal({ 
  open, 
  onOpenChange, 
  onSchedule,
  defaultPlatform
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (platform: string, scheduledAt: string) => Promise<void>
  defaultPlatform?: string
}) {
  const [platform, setPlatform] = useState(defaultPlatform || "instagram")
  
  // Default to tomorrow 09:00
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  
  const [scheduledAt, setScheduledAt] = useState(
    new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0,16)
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSchedule(platform, new Date(scheduledAt).toISOString())
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertModal open={open} onOpenChange={onOpenChange}>
      <AlertModalContent>
        <AlertModalHeader>
          <AlertModalTitle>Schedule Content</AlertModalTitle>
          <AlertModalDescription>
            Choose the platform and time you want this content to be published.
          </AlertModalDescription>
        </AlertModalHeader>
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Platform</label>
            <CustomSelect 
              value={platform}
              onChange={setPlatform}
              options={[
                { value: "instagram", label: "Instagram" },
                { value: "facebook", label: "Facebook" },
                { value: "linkedin", label: "LinkedIn" },
                { value: "twitter", label: "X / Twitter" },
                { value: "other", label: "Other" }
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Scheduled Date & Time</label>
            <Input 
              type="datetime-local" 
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <AlertModalFooter className="mt-6 border-none px-0 pb-0">
            <AlertModalCancel type="button">Cancel</AlertModalCancel>
            <Button type="submit" isLoading={isLoading}>
              Schedule
            </Button>
          </AlertModalFooter>
        </form>
      </AlertModalContent>
    </AlertModal>
  )
}
