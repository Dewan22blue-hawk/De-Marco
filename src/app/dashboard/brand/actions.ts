"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { brandKitSchema, type BrandKit, BrandColor, BrandFont } from "@/schemas/brand"
import { createAuditLog } from "@/lib/audit"
import { saveAssetMetadata } from "@/app/dashboard/assets/actions"

export async function getBrandKit(organizationId: string) {
  const supabase = await createClient()

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select(`
      *,
      brand_colors (*),
      brand_fonts (*),
      logo:assets!logo_asset_id (*)
    `)
    .eq("organization_id", organizationId)
    .eq("is_default", true)
    .maybeSingle()

  if (brandError) {
    console.error("Error fetching brand kit:", brandError)
    return null
  }

  return brand
}

export async function upsertBrandKit(organizationId: string, data: Record<string, unknown>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Validate main brand data
  const validatedBrand = brandKitSchema.parse({
    ...data,
    organization_id: organizationId,
    slug: data.slug || data.name.toLowerCase().replace(/ /g, "-"),
  })

  // 2. Get existing brand to compare for audit log
  const { data: oldBrand } = await supabase
    .from("brands")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_default", true)
    .maybeSingle()

  // 3. Upsert Brand
  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .upsert({
      id: oldBrand?.id,
      organization_id: organizationId,
      name: validatedBrand.name,
      slug: validatedBrand.slug,
      tagline: validatedBrand.tagline,
      description: validatedBrand.description,
      preferred_cta: validatedBrand.preferred_cta,
      tone_of_voice: validatedBrand.tone_of_voice,
      forbidden_words: validatedBrand.forbidden_words,
      logo_asset_id: validatedBrand.logo_asset_id,
      is_default: true,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
      created_by: oldBrand ? oldBrand.created_by : user.id,
    })
    .select()
    .single()

  if (brandError) throw brandError

  // 4. Handle Colors
  if (data.colors && Array.isArray(data.colors)) {
    // Delete existing colors that are not in the new list if they have IDs
    const newColorIds = data.colors
      .map((c: Record<string, unknown>) => c.id)
      .filter((id: unknown) => id && typeof id === 'string' && !id.startsWith("new_"));
      
    if (oldBrand) {
        if (newColorIds.length > 0) {
            await supabase
              .from("brand_colors")
              .delete()
              .eq("brand_id", brand.id)
              .not("id", "in", `(${newColorIds.join(",")})`)
        } else {
            await supabase
              .from("brand_colors")
              .delete()
              .eq("brand_id", brand.id)
        }
    }

    // Upsert colors
    const colorsToUpsert = data.colors.map((c: Record<string, unknown>) => {
      const colorObj: Record<string, unknown> = {
        brand_id: brand.id,
        name: c.name,
        hex_code: c.hex_code,
        role: c.role,
        sort_order: c.sort_order || 0
      }
      if (typeof c.id === 'string' && !c.id.startsWith("new_")) {
        colorObj.id = c.id
      }
      return colorObj
    })
    
    const { error: colorError } = await supabase.from("brand_colors").upsert(colorsToUpsert)
    if (colorError) console.error("Color sync error:", colorError)
  }

  // 5. Handle Fonts
  if (data.fonts && Array.isArray(data.fonts)) {
    const fontsToUpsert = data.fonts.map((f: Record<string, unknown>) => {
      const fontObj: Record<string, unknown> = {
        brand_id: brand.id,
        name: f.name,
        role: f.role,
        font_family: f.font_family,
        weights: f.weights || [],
        is_active: true
      }
      if (typeof f.id === 'string' && !f.id.startsWith("new_")) {
        fontObj.id = f.id
      }
      return fontObj
    })
    
    const { error: fontError } = await supabase.from("brand_fonts").upsert(fontsToUpsert, { onConflict: "brand_id, role" })
    if (fontError) console.error("Font sync error:", fontError)
  }

  // 6. Audit Log
  await createAuditLog({
    organization_id: organizationId,
    table_name: "brands",
    record_id: brand.id,
    action: oldBrand ? "update" : "create",
    old_data: oldBrand,
    new_data: brand
  })

  revalidatePath("/dashboard/brand")
  return { success: true, data: brand }
}

export async function uploadBrandLogo(organizationId: string, brandId: string, assetData: Record<string, unknown>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Save Asset Metadata
  const asset = await saveAssetMetadata({
    ...assetData,
    asset_type: "image",
    organization_id: organizationId, // saveAssetMetadata already handles this from profile but we pass it anyway if it supports it
  })

  // 2. Update Brand logo_asset_id
  const { error: updateError } = await supabase
    .from("brands")
    .update({ 
      logo_asset_id: asset.id,
      updated_at: new Date().toISOString(),
      updated_by: user.id 
    })
    .eq("id", brandId)

  if (updateError) throw updateError

  await createAuditLog({
    organization_id: organizationId,
    table_name: "brands",
    record_id: brandId,
    action: "update",
    new_data: { logo_asset_id: asset.id }
  })

  revalidatePath("/dashboard/brand")
  return { success: true, asset }
}
