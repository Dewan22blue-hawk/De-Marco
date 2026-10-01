import { createClient } from "@/lib/supabase/server"

export type UserContext = {
  user: {
    id: string
    email?: string
  }
  profile: {
    id: string
    email: string | null
    full_name: string | null
    avatar_asset_id: string | null
  }
  organization: {
    id: string
    name: string
    slug: string
    is_active: boolean | null
  }
  role: {
    id: string
    name: string
    display_name: string
  }
  permissions: string[]
}

export async function getCurrentUserContext(): Promise<UserContext | null> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_asset_id")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || !profile) {
    console.error(`[AUTH DEBUG] Profile missing for user ${user.id}. Error:`, profileError);
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, role_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (membershipError || !membership) {
    console.error(`[AUTH DEBUG] Membership missing for user ${user.id}. Error:`, membershipError);
    return null;
  }

  const [{ data: organization, error: orgError }, { data: role, error: roleError }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, is_active")
      .eq("id", membership.organization_id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("roles")
      .select("id, name, display_name")
      .eq("id", membership.role_id)
      .maybeSingle(),
  ])

  if (orgError || roleError || !organization || !role) {
    console.error(`[AUTH DEBUG] Org or Role missing for user ${user.id}. OrgError:`, orgError, `RoleError:`, roleError);
    return null;
  }

  const { data: rolePermissions } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", role.id)

  const permissionIds = rolePermissions?.map((permission) => permission.permission_id) ?? []
  const { data: permissions } = permissionIds.length
    ? await supabase.from("permissions").select("code").in("id", permissionIds)
    : { data: [] as { code: string }[] }

  return {
    user: { id: user.id, email: user.email },
    profile,
    organization,
    role,
    permissions: permissions?.map((permission) => permission.code) ?? [],
  }
}

export async function hasPermission(permission: string): Promise<boolean> {
  const context = await getCurrentUserContext()
  return context?.permissions.includes(permission) ?? false
}

export async function hasRole(roleName: string): Promise<boolean> {
  const context = await getCurrentUserContext()
  return context?.role.name.toLowerCase() === roleName.toLowerCase()
}