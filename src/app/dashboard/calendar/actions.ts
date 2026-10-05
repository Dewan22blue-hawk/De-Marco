"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"

export async function listCalendarEvents(opts?: { startDate?: string; endDate?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  let query = supabase
    .from("content_calendar")
    .select(`
      *,
      content:contents(id, title, metadata),
      campaign:campaigns(id, name)
    `)
    .eq("organization_id", profile.default_organization_id)

  if (opts?.startDate) query = query.gte("scheduled_at", opts.startDate)
  if (opts?.endDate) query = query.lte("scheduled_at", opts.endDate)

  query = query.order("scheduled_at", { ascending: true })

  const { data, error } = await query
  if (error) {
    console.error("Error fetching calendar events:", error)
    return []
  }

  return data
}

export async function createCalendarEvent(payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  const { data: event, error } = await supabase
    .from("content_calendar")
    .insert({
      organization_id: profile.default_organization_id,
      content_id: payload.content_id,
      campaign_id: payload.campaign_id,
      platform: payload.platform,
      scheduled_at: payload.scheduled_at,
      status: payload.status || "planned",
      is_auto_post: payload.is_auto_post || false,
      created_by: user.id
    })
    .select()
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "content_calendar",
    record_id: event.id,
    action: "create",
    new_data: event
  })

  revalidatePath("/dashboard/calendar")
  return { success: true, event }
}

export async function retryCalendarEvent(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  const { data: event, error } = await supabase
    .from("content_calendar")
    .update({ status: "scheduled", notes: null, claimed_at: null, updated_at: new Date().toISOString() }) // Clear error notes and reset lease
    .eq("id", id)
    .in("status", ["failed", "queued"]) // Only allow retrying failed or stuck queued events
    .select()
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "content_calendar",
    record_id: event.id,
    action: "update",
    new_data: { status: "scheduled", notes: null, claimed_at: null }
  })

  revalidatePath("/dashboard/calendar")
  return { success: true, event }
}
