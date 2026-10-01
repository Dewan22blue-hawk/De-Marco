"use client"

import { useState, useTransition } from "react"
import { updateOrganization } from "./actions"

export function OrganizationForm({ initialData }: { initialData: any }) {
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
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "An unexpected error occurred." })
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
          <input 
            type="text" 
            name="name"
            defaultValue={initialData.name}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Legal Name</label>
          <input 
            type="text" 
            name="legal_name"
            defaultValue={initialData.legal_name || ""}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Industry</label>
          <input 
            type="text" 
            name="industry"
            defaultValue={initialData.industry || ""}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Website</label>
          <input 
            type="url" 
            name="website"
            defaultValue={initialData.website || ""}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
            placeholder="https://"
          />
        </div>

        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Contact Email</label>
          <input 
            type="email" 
            name="email"
            defaultValue={initialData.email || ""}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Phone Number</label>
          <input 
            type="text" 
            name="phone"
            defaultValue={initialData.phone || ""}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
      </div>

      <hr className="border-outline-variant/20" />

      <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Address</h3>

      <div className="space-y-2">
        <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Street Address</label>
        <textarea 
          name="address"
          defaultValue={initialData.address || ""}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">City</label>
          <input 
            type="text" 
            name="city"
            defaultValue={initialData.city || ""}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Province / State</label>
          <input 
            type="text" 
            name="province"
            defaultValue={initialData.province || ""}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Postal Code</label>
          <input 
            type="text" 
            name="postal_code"
            defaultValue={initialData.postal_code || ""}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="clay-button-primary px-6 py-2.5 rounded-xl text-white font-headline-sm text-body-md font-semibold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}
