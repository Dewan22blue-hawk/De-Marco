"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"

export async function inviteMember(organizationId: string, email: string, roleName: string = "member") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Find the role ID
  const { data: role } = await supabase.from("roles").select("id").eq("name", roleName).single()
  if (!role) throw new Error("Role not found")

  // Find user profile by email
  const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle()
  if (!profile) {
    // For MVP prototyping: normally we would use Supabase Admin API to invite user via email.
    // Here we'll return an error if they haven't signed up yet.
    throw new Error("User with this email is not registered in the system yet.")
  }

  // Check if already a member
  const { data: existing } = await supabase.from("organization_members").select("id").eq("organization_id", organizationId).eq("user_id", profile.id).maybeSingle()
  if (existing) {
    throw new Error("User is already a member of this organization.")
  }

  // Insert member
  const { data: member, error } = await supabase.from("organization_members").insert({
    organization_id: organizationId,
    user_id: profile.id,
    role_id: role.id,
    status: "active"
  }).select().single()

  if (error) throw error

  await createAuditLog({
    organization_id: organizationId,
    table_name: "organization_members",
    record_id: member.id,
    action: "create",
    new_data: member
  })

  revalidatePath("/dashboard/settings/members")
  return { success: true }
}

export async function removeMember(organizationId: string, memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("organization_members")
    .delete()
    .eq("id", memberId)
    .eq("organization_id", organizationId) // Security check

  if (error) throw error

  await createAuditLog({
    organization_id: organizationId,
    table_name: "organization_members",
    record_id: memberId,
    action: "delete"
  })

  revalidatePath("/dashboard/settings/members")
  return { success: true }
}

export async function updateMemberRole(organizationId: string, memberId: string, newRoleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("organization_members")
    .update({ role_id: newRoleId })
    .eq("id", memberId)
    .eq("organization_id", organizationId) // Security check

  if (error) throw error

  await createAuditLog({
    organization_id: organizationId,
    table_name: "organization_members",
    record_id: memberId,
    action: "update",
    new_data: { role_id: newRoleId }
  })

  revalidatePath("/dashboard/settings/members")
  return { success: true }
}
