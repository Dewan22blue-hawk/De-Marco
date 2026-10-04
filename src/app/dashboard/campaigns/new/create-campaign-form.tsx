"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createCampaign } from "../actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"

export function CreateCampaignForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    objective: "",
    status: "draft"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim() || !formData.code.trim()) {
      setError("Name and Code are required")
      return
    }

    startTransition(async () => {
      try {
        const res = await createCampaign(formData)
        if (res.success) {
          router.push("/dashboard/campaigns")
        }
      } catch (err: any) {
        setError(err.message || "Failed to create campaign")
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
            Campaign Name <span className="text-error">*</span>
          </label>
          <Input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Summer Sale 2026"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
            Campaign Code <span className="text-error">*</span>
          </label>
          <Input 
            type="text" 
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g. SUM26"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-on-surface">Description</label>
          <Textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the campaign..."
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-on-surface">Objective</label>
          <Input 
            type="text" 
            name="objective"
            value={formData.objective}
            onChange={handleChange}
            placeholder="e.g. Increase sales by 20%"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-on-surface">Status</label>
          <CustomSelect 
            name="status"
            value={formData.status}
            onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
            options={[
              { value: "draft", label: "Draft" },
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" }
            ]}
          />
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
          Create Campaign
        </Button>
      </div>
    </form>
  )
}
