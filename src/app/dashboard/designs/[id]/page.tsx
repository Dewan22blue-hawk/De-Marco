import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getDesign } from "../actions"
import { getBrandKit } from "../../brand/actions"
import { DesignDetailClient } from "./design-detail-client"

export default async function DesignDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  const { id } = await params
  const design = await getDesign(id)

  if (!design) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <h1 className="text-2xl font-bold text-on-surface">Design Not Found</h1>
        <p className="text-on-surface-variant">The design you are looking for does not exist or you do not have permission to view it.</p>
      </div>
    )
  }

  const brandKit = await getBrandKit(profile.default_organization_id)

  // Build Asset Map (pre-fetch URLs for all assets in the design elements)
  const assetMap: Record<string, { url: string; name?: string }> = {}
  
  if (design.design_elements) {
    for (const el of design.design_elements) {
      if (el.asset_id && el.asset) {
        const { data } = supabase.storage.from(el.asset.storage_bucket).getPublicUrl(el.asset.storage_path)
        assetMap[el.asset_id] = { url: data.publicUrl, name: el.asset.name }
      }
    }
  }

  // Pre-fetch Brand Logo URL if exists
  if (brandKit?.logo_asset_id) {
    const { data: logoAsset } = await supabase.from('assets').select('*').eq('id', brandKit.logo_asset_id).single()
    if (logoAsset) {
      const { data } = supabase.storage.from(logoAsset.storage_bucket).getPublicUrl(logoAsset.storage_path)
      assetMap[logoAsset.id] = { url: data.publicUrl, name: logoAsset.name }
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <DesignDetailClient design={design} brandKit={brandKit} initialAssetMap={assetMap} />
    </div>
  )
}
