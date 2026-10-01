"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"

export async function saveAssetMetadata(data: {
  name: string
  mime_type: string
  file_size: number
  storage_bucket: string
  storage_path: string
  asset_type: 'image' | 'document' | 'font' | 'video' | 'audio' | 'archive' | 'other'
  category_id?: string
  tags?: string[]
  width?: number
  height?: number
  brand_id?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  const { data: insertedAsset, error } = await supabase
    .from('assets')
    .insert({
      organization_id: profile.default_organization_id,
      category_id: data.category_id || null,
      brand_id: data.brand_id || null,
      name: data.name,
      asset_type: data.asset_type,
      storage_bucket: data.storage_bucket,
      storage_path: data.storage_path,
      mime_type: data.mime_type,
      file_size: data.file_size,
      width: data.width,
      height: data.height,
      tags: data.tags || [],
      created_by: user.id,
      updated_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to save asset metadata:", error)
    throw new Error(error.message)
  }

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "assets",
    record_id: insertedAsset.id,
    action: "create",
    new_data: insertedAsset
  })

  revalidatePath('/dashboard/assets')
  
  return insertedAsset
}

export async function listAssets(options?: {
  category_id?: string
  search?: string
  asset_type?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  let query = supabase
    .from('assets')
    .select(`
      *,
      category:asset_categories(name, slug)
    `, { count: 'exact' })
    .eq('organization_id', profile.default_organization_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (options?.category_id) {
    query = query.eq('category_id', options.category_id)
  }
  if (options?.search) {
    const safeSearch = options.search.replace(/[^\w\s-]/gi, '').trim()
    if (safeSearch) {
      query = query.or(`name.ilike.%${safeSearch}%,tags.cs.{${safeSearch}}`)
    }
  }
  if (options?.asset_type && options.asset_type !== 'All') {
    query = query.eq('asset_type', options.asset_type.toLowerCase())
  }
  
  const sortCol = options?.sort_by || 'created_at'
  const sortAsc = options?.sort_dir === 'asc'
  query = query.order(sortCol, { ascending: sortAsc })
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset !== undefined && options?.limit) {
    query = query.range(options.offset, options.offset + options.limit - 1)
  }

  const { data, error, count } = await query

  if (error) throw error

  return { data: data || [], count: count || 0 }
}

export async function renameAsset(assetId: string, newName: string) {
  if (!newName || !newName.trim()) throw new Error("Name cannot be empty")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  const { data: oldAsset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .eq('organization_id', profile.default_organization_id)
    .single()

  const { data: updatedAsset, error } = await supabase
    .from('assets')
    .update({ 
      name: newName,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', assetId)
    .eq('organization_id', profile.default_organization_id)
    .select()
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "assets",
    record_id: assetId,
    action: "update",
    old_data: oldAsset,
    new_data: updatedAsset
  })

  revalidatePath('/dashboard/assets')
  return { success: true, data: updatedAsset }
}

export async function updateAssetTags(assetId: string, tags: string[]) {
  if (tags.length > 20) throw new Error("Maximum 20 tags allowed")
  const cleanTags = tags.map(t => t.trim().toLowerCase()).filter(Boolean)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  const { data: oldAsset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .eq('organization_id', profile.default_organization_id)
    .single()

  const { data: updatedAsset, error } = await supabase
    .from('assets')
    .update({ 
      tags: cleanTags,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', assetId)
    .eq('organization_id', profile.default_organization_id)
    .select()
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "assets",
    record_id: assetId,
    action: "update",
    old_data: oldAsset,
    new_data: updatedAsset
  })

  revalidatePath('/dashboard/assets')
  return { success: true, data: updatedAsset }
}

export async function deleteAsset(assetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  const { data: oldAsset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .eq('organization_id', profile.default_organization_id)
    .single()

  // Soft delete
  const { error } = await supabase
    .from('assets')
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', assetId)
    .eq('organization_id', profile.default_organization_id)

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "assets",
    record_id: assetId,
    action: "delete",
    old_data: oldAsset
  })

  revalidatePath('/dashboard/assets')
  return { success: true }
}

export async function bulkDeleteAssets(assetIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  const { data: oldAssets } = await supabase
    .from('assets')
    .select('*')
    .in('id', assetIds)
    .eq('organization_id', profile.default_organization_id)

  const { error } = await supabase
    .from('assets')
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_by: user.id
    })
    .in('id', assetIds)
    .eq('organization_id', profile.default_organization_id)

  if (error) throw error

  if (oldAssets) {
    for (const asset of oldAssets) {
      await createAuditLog({
        organization_id: profile.default_organization_id,
        table_name: "assets",
        record_id: asset.id,
        action: "delete",
        old_data: asset
      })
    }
  }

  revalidatePath('/dashboard/assets')
  return { success: true }
}

export async function bulkUpdateAssets(assetIds: string[], data: { category_id?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  const { data: oldAssets } = await supabase
    .from('assets')
    .select('*')
    .in('id', assetIds)
    .eq('organization_id', profile.default_organization_id)

  const { error } = await supabase
    .from('assets')
    .update({ 
      category_id: data.category_id || null,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .in('id', assetIds)
    .eq('organization_id', profile.default_organization_id)

  if (error) throw error

  if (oldAssets) {
    for (const asset of oldAssets) {
      await createAuditLog({
        organization_id: profile.default_organization_id,
        table_name: "assets",
        record_id: asset.id,
        action: "update",
        old_data: asset,
        new_data: { ...asset, category_id: data.category_id || null }
      })
    }
  }

  revalidatePath('/dashboard/assets')
  return { success: true }
}

export async function listAssetCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  const { data, error } = await supabase
    .from('asset_categories')
    .select('*')
    .eq('organization_id', profile.default_organization_id)
    .order('sort_order', { ascending: true })

  if (error) throw error

  return data || []
}