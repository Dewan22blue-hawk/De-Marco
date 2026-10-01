import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return <div>Profile not found.</div>
  }

  return (
    <div className="clay-surface rounded-3xl p-8 border border-outline-variant/20 dark:border-white/5 space-y-8">
      <div>
        <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Personal Profile</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Manage your personal details and workspace preferences.
        </p>
      </div>

      <ProfileForm initialData={profile} email={user.email || ""} />
    </div>
  )
}
