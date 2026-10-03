import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listTemplates } from "@/app/dashboard/templates/actions"
import { CreateDesignClient } from "./create-design-client"
import { getBrandKit } from "@/app/dashboard/brand/actions"

export default async function NewDesignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) return <div>No organization assigned</div>

  const orgId = profile.default_organization_id

  // Fetch templates for the picker
  const { data: templates } = await listTemplates({ limit: 50, sort_by: 'created_at', sort_dir: 'desc' })
  
  // Fetch brand kit to provide context if needed
  const brandKit = await getBrandKit(orgId)

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Creative Studio</p>
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Create New Design</h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl">
          Choose a template and customize its variables to generate a new design perfectly aligned with your brand.
        </p>
      </div>

      <CreateDesignClient templates={templates} brandKit={brandKit} />
    </div>
  )
}
