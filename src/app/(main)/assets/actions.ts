"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveAssetMetadata(data: {
  name: string
  mime_type: string
  file_size: number
  storage_bucket: string
  storage_path: string
  asset_type: 'image' | 'document' | 'font' | 'video' | 'audio' | 'archive' | 'other'
}) {
  const supabase = await createClient()
  
  // Need to get the authenticated user and their organization context
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get user's active organization assuming the simplest single-org implementation for MVP
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  // Save the asset record mapping to the physical file on bucket
  const { data: insertedAsset, error } = await supabase
    .from('assets')
    .insert({
      organization_id: profile.default_organization_id,
      name: data.name,
      asset_type: data.asset_type,
      storage_bucket: data.storage_bucket,
      storage_path: data.storage_path,
      mime_type: data.mime_type,
      file_size: data.file_size,
      created_by: user.id,
      updated_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to save asset metadata:", error)
    throw new Error(error.message)
  }

  revalidatePath('/assets')
  
  return insertedAsset
}
