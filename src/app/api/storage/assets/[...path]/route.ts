import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const storagePath = path.join("/")
  
  const supabase = await createClient()
  
  // Verify the asset exists and user has access
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    return Response.json({ error: "No organization" }, { status: 400 })
  }

  // Check if asset exists and belongs to user's organization
  const { data: asset } = await supabase
    .from('assets')
    .select('storage_path, storage_bucket')
    .eq('storage_path', storagePath)
    .eq('organization_id', profile.default_organization_id)
    .is('deleted_at', null)
    .single()

  if (!asset) {
    return Response.json({ error: "Asset not found" }, { status: 404 })
  }

  // Get signed URL from Supabase Storage (valid for 1 hour)
  const { data: signedUrl, error } = await supabase.storage
    .from(asset.storage_bucket)
    .createSignedUrl(storagePath, 3600)

  if (error || !signedUrl) {
    return Response.json({ error: "Failed to generate URL" }, { status: 500 })
  }

  // Redirect to the signed URL
  return Response.redirect(signedUrl.signedUrl, 302)
}