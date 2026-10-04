"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"
import { runAITask } from "@/lib/ai/service"

export async function listContents(opts?: { search?: string; status?: string; limit?: number; offset?: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  let query = supabase
    .from("contents")
    .select("*, brand:brands(name)", { count: "exact" })
    .eq("organization_id", profile.default_organization_id)
    .is("deleted_at", null)

  if (opts?.search) query = query.ilike("title", `%${opts.search}%`)
  if (opts?.status && opts.status !== "all") query = query.eq("status", opts.status)

  const limit = opts?.limit || 24
  const offset = opts?.offset || 0

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) {
    console.error("Error fetching contents:", error)
    return { data: [], count: 0 }
  }

  return { data, count: count || 0 }
}

export async function createContent(payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  const { data: content, error } = await supabase
    .from("contents")
    .insert({
      organization_id: profile.default_organization_id,
      title: payload.title,
      body: payload.body,
      platform: payload.platform,
      content_type: payload.content_type,
      status: payload.status || "draft",
      created_by: user.id,
      owner_id: user.id
    })
    .select()
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "contents",
    record_id: content.id,
    action: "create",
    new_data: content
  })

  revalidatePath("/dashboard/contents")
  return { success: true, content }
}

export async function autoGenerateContent(topic: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  // Get active brand kit for context
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("organization_id", profile.default_organization_id)
    .eq("is_active", true)
    .limit(1)
    .single()

  const prompt = `Write an engaging social media post about: ${topic}. Give me just the post content directly.`;
  
  const generatedText = await runAITask({
    organization_id: profile.default_organization_id,
    task_type: "content_generation",
    prompt,
    context: { brand }
  });

  // Save as draft, requiring human review
  return await createContent({
    title: `Generated: ${topic.substring(0, 30)}...`,
    body: generatedText,
    platform: "other",
    content_type: "post",
    status: "draft"
  });
}

export async function submitForReview(contentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: content, error } = await supabase
    .from("contents")
    .update({ 
      status: "review", 
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", contentId)
    .select("organization_id")
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: content.organization_id,
    table_name: "contents",
    record_id: contentId,
    action: "update",
    new_data: { status: "review" }
  })

  revalidatePath("/dashboard/contents")
  return { success: true }
}

export async function approveContent(contentId: string, scheduleToCalendar?: boolean, platform?: string, scheduledAt?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: content, error } = await supabase
    .from("contents")
    .update({ 
      status: "approved", 
      approver_id: user.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", contentId)
    .select("*")
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: content.organization_id,
    table_name: "contents",
    record_id: contentId,
    action: "update",
    new_data: { status: "approved" }
  })

  if (scheduleToCalendar) {
    const { error: calError } = await supabase
      .from("content_calendar")
      .insert({
        organization_id: content.organization_id,
        content_id: content.id,
        platform: platform || content.platform || 'other',
        scheduled_at: scheduledAt || new Date(Date.now() + 86400000).toISOString(), // Use provided or fallback
        status: "scheduled",
        created_by: user.id
      })
      
    if (calError) console.error("Failed to schedule:", calError)
  }

  revalidatePath("/dashboard/contents")
  revalidatePath("/dashboard/calendar")
  return { success: true }
}
