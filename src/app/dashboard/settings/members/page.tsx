import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MembersClient } from "./members-client"

export default async function MembersSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  if (!profile?.default_organization_id) return <div>No organization assigned.</div>

  const { data: membersRaw } = await supabase
    .from("organization_members")
    .select(`
      id,
      user_id,
      status,
      joined_at,
      role_id,
      roles ( name, display_name )
    `)
    .eq("organization_id", profile.default_organization_id)

  const userIds = membersRaw?.map((m: { user_id: string }) => m.user_id) || []
  
  const { data: profilesRaw } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_asset_id, job_title")
    .in("id", userIds)

  const members = membersRaw?.map((member: { user_id: string; [key: string]: unknown }) => ({
    ...member,
    profiles: profilesRaw?.find((p: { id: string }) => p.id === member.user_id)
  }))

  const { data: roles } = await supabase.from("roles").select("id, name, display_name")

  return (
    <div className="clay-surface rounded-3xl p-8 border border-outline-variant/20 dark:border-white/5 space-y-8">
      <MembersClient 
        members={members || []} 
        organizationId={profile.default_organization_id} 
        availableRoles={roles || []} 
      />
    </div>
  )
}
