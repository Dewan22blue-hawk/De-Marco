import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getBrandKit } from "./actions"
import { BrandKitForm } from "./brand-kit-form"

export default async function BrandSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  
  if (!profile?.default_organization_id) return <div>No organization assigned.</div>

  const brand = await getBrandKit(profile.default_organization_id)

  return (
    <div className="clay-surface rounded-3xl p-8 border border-outline-variant/20 dark:border-white/5 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Brand Kit</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Configure your organization's core brand identity.
          </p>
        </div>
      </div>

      <BrandKitForm initialData={brand} organizationId={profile.default_organization_id} />
    </div>
  )
}
