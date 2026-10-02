/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useTransition } from "react"
import { updateProfile } from "./actions"

export function ProfileForm({ initialData, email }: { initialData: { [key: string]: string | null | undefined }, email: string }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const res = await updateProfile(formData)
        if (res.error) {
          setMessage({ type: "error", text: res.error })
        } else if (res.success) {
          setMessage({ type: "success", text: "Profile updated successfully." })
        }
      } catch (err: unknown) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "An unexpected error occurred." })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-body-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-error-container text-on-error-container border-error'}`}>
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 rounded-2xl bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/30">
          <img 
            className="w-full h-full object-cover" 
            alt="User Avatar" 
            src={initialData.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuATlC_m8QGfbzpjKTkQaXbXMV9Ta8K-DIrKR5alAxd6xPvZ6k3mK3lCI9NZC6D8BSHkczxCtPyU_PkH1GBpC2JXdJH29CugGt6bnj0GvGIkCr0gFaghVKNZKo9LqS8b1EuqxJWpozFauP2imFjyl5HzFkCpKQByJyj-WmrZ7GWmgS8d0FCI_2x5u_V0PxE5nzaeJr6VRP44Cb-wEEw7Zct3mRUvsT6CqHqoPnVkRPkZFIM6UD6xDrv2"} 
          />
        </div>
        <div className="flex flex-col gap-2">
          <button 
            type="button" 
            onClick={() => alert("Avatar upload will be integrated with the Asset Manager in the next phase.")}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-body-sm font-semibold text-on-surface transition-colors border border-outline-variant/30"
          >
            Change Avatar
          </button>
          <span className="text-[11px] text-outline font-body-sm">JPG, GIF or PNG. 1MB max.</span>
        </div>
      </div>

      <hr className="border-outline-variant/20" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Full Name</label>
          <input 
            type="text" 
            name="full_name"
            defaultValue={initialData.full_name || ""}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Email Address</label>
          <input 
            type="email" 
            defaultValue={email}
            disabled
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 outline-none text-on-surface-variant font-body-md opacity-60 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Job Title</label>
          <input 
            type="text" 
            name="job_title"
            defaultValue={initialData.job_title || ""}
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

      <div className="space-y-2">
        <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Bio</label>
        <textarea 
          name="bio"
          defaultValue={initialData.bio || ""}
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Timezone</label>
          <select 
            name="timezone"
            defaultValue={initialData.timezone || "Asia/Jakarta"}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md appearance-none"
          >
            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-label-code-sm font-label-code-sm font-semibold text-on-surface">Locale</label>
          <select 
            name="locale"
            defaultValue={initialData.locale || "id-ID"}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md appearance-none"
          >
            <option value="id-ID">Bahasa Indonesia</option>
            <option value="en-US">English (US)</option>
          </select>
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
              Save Profile
            </>
          )}
        </button>
      </div>
    </form>
  )
}
