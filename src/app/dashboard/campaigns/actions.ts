"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"

export async function listCampaigns(opts?: { search?: string; status?: string; limit?: number; offset?: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  let query = supabase
    .from("campaigns")
    .select("*", { count: "exact" })
    .eq("organization_id", profile.default_organization_id)
    .is("deleted_at", null)

  if (opts?.search) query = query.ilike("name", `%${opts.search}%`)
  if (opts?.status && opts.status !== "all") query = query.eq("status", opts.status)

  const limit = opts?.limit || 24
  const offset = opts?.offset || 0

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) {
    console.error("Error fetching campaigns:", error)
    return { data: [], count: 0 }
  }

  return { data, count: count || 0 }
}

export async function createCampaign(payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      organization_id: profile.default_organization_id,
      name: payload.name,
      code: payload.code,
      description: payload.description,
      objective: payload.objective,
      status: payload.status || "draft",
      created_by: user.id,
      owner_id: user.id
    })
    .select()
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "campaigns",
    record_id: campaign.id,
    action: "create",
    new_data: campaign
  })

  revalidatePath("/dashboard/campaigns")
  return { success: true, campaign }
}
