import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listTemplates } from "@/app/dashboard/templates/actions"
import { listCampaigns } from "@/app/dashboard/campaigns/actions"
import { hasPermission } from "@/lib/auth/authorization"
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
  const { data: templates } = await listTemplates({ limit: 50 })
  
  // Fetch campaigns for linking
  const { data: campaigns } = await listCampaigns({ limit: 100 })
  const canLinkCampaigns = await hasPermission("campaigns.update")

  // Fetch brand kit to provide context if needed
  const brandKit = await getBrandKit(orgId)

  // Fetch assets for AI context
  const { data: assets } = await supabase
    .from("assets")
    .select("id, name, asset_type, storage_bucket, storage_path")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .limit(50)

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Creative Studio</p>
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Create New Design</h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl">
          Choose a template and customize its variables to generate a new design perfectly aligned with your brand.
        </p>
      </div>

      <CreateDesignClient 
        templates={templates || []} 
        brandKit={brandKit} 
        assets={assets || []} 
        campaigns={(campaigns || []).map((c: any) => ({ id: c.id, name: c.name }))}
        canLinkCampaigns={canLinkCampaigns}
      />
    </div>
  )
}
