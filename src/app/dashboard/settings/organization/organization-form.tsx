"use client"

import { useState, useTransition } from "react"
import { updateOrganization } from "./actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function OrganizationForm({ initialData }: { initialData: { id: string; [key: string]: string | null | undefined } }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const res = await updateOrganization(formData)
        if (res.error) {
          setMessage({ type: "error", text: res.error })
        } else if (res.success) {
          setMessage({ type: "success", text: "Organization updated successfully." })
        }
      } catch (err: unknown) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "An unexpected error occurred." })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={initialData.id} />

      {message && (
        <div className={`p-4 rounded-xl text-body-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-error-container text-on-error-container border-error'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Organization Name</label>
          <Input 
            type="text" 
            name="name"
            defaultValue={initialData.name || ""}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Legal Name</label>
          <Input 
            type="text" 
            name="legal_name"
            defaultValue={initialData.legal_name || ""}
          />
        </div>

        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Industry</label>
          <Input 
            type="text" 
            name="industry"
            defaultValue={initialData.industry || ""}
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Website</label>
          <Input 
            type="url" 
            name="website"
            defaultValue={initialData.website || ""}
            placeholder="https://"
          />
        </div>

        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Contact Email</label>
          <Input 
            type="email" 
            name="email"
            defaultValue={initialData.email || ""}
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Phone Number</label>
          <Input 
            type="text" 
            name="phone"
            defaultValue={initialData.phone || ""}
          />
        </div>
      </div>

      <hr className="border-outline-variant/20" />

      <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Address</h3>

      <div className="space-y-2">
        <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Street Address</label>
        <Textarea 
          name="address"
          defaultValue={initialData.address || ""}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">City</label>
          <Input 
            type="text" 
            name="city"
            defaultValue={initialData.city || ""}
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Province / State</label>
          <Input 
            type="text" 
            name="province"
            defaultValue={initialData.province || ""}
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Postal Code</label>
          <Input 
            type="text" 
            name="postal_code"
            defaultValue={initialData.postal_code || ""}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          variant="default"
          isLoading={isPending}
          className="font-semibold flex items-center gap-2"
        >
          {!isPending && <span className="material-symbols-outlined text-[18px]">save</span>}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
