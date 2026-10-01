import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OrganizationForm } from "./organization-form"

export default async function OrganizationSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  // Get user profile to find their default organization
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  if (!profile?.default_organization_id) {
    return <div>No organization assigned to this user.</div>
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.default_organization_id)
    .single()

  if (!org) {
    return <div>Organization not found.</div>
  }

  return (
    <div className="clay-surface rounded-3xl p-8 border border-outline-variant/20 dark:border-white/5 space-y-8">
      <div>
        <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Organization Profile</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Manage your organization's legal and contact details. This information will be used on official documents like proposals and MoUs.
        </p>
      </div>

      <OrganizationForm initialData={org} />
    </div>
  )
}
