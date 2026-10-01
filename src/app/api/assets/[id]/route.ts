import { createClient } from "@/lib/supabase/server"
import { createAuditLog } from "@/lib/audit"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    return Response.json({ error: "No organization" }, { status: 400 })
  }

  const body = await request.json()
  const { name } = body

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 })
  }

  const { data: oldAsset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .eq('organization_id', profile.default_organization_id)
    .single()

  const { data: updatedAsset, error } = await supabase
    .from('assets')
    .update({ 
      name,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', id)
    .eq('organization_id', profile.default_organization_id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "assets",
    record_id: id,
    action: "update",
    old_data: oldAsset,
    new_data: updatedAsset
  })

  return Response.json({ data: updatedAsset })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    return Response.json({ error: "No organization" }, { status: 400 })
  }

  const { data: oldAsset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .eq('organization_id', profile.default_organization_id)
    .single()

  const { error } = await supabase
    .from('assets')
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', id)
    .eq('organization_id', profile.default_organization_id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "assets",
    record_id: id,
    action: "delete",
    old_data: oldAsset
  })

  return Response.json({ success: true })
}