"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"
import { runAITask } from "@/lib/ai/service"
import { z } from "zod"
import { GeneratedContentSchema } from "@/schemas/ai-content"

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

export async function autoGenerateContent(topic: string, contentType: string = "post") {
  // Legacy function: generates and saves as draft immediately
  const { content } = await generateContentWithAI(topic, contentType)
  return { success: true, content };
}

export async function generateContentWithAI(
  topic: string,
  contentType: string = "post",
  campaignId?: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) throw new Error("No organization assigned");
  const organizationId = profile.default_organization_id;

  const prompt = `Generate a ${contentType} about: ${topic}`;

  const generated = await runAITask({
    organization_id: organizationId,
    task_type: "content_generation",
    context: { brand: null, campaign: campaignId ? { id: campaignId } : undefined } as any,
    prompt,
    schema: GeneratedContentSchema
  });

  // Since runAITask with schema already validates, `generated` is already parsed and typed.
  const validated = generated;

  // Insert into contents as draft
  const { data: content, error } = await supabase
    .from("contents")
    .insert({
      organization_id: organizationId,
      title: validated.title,
      body: validated.body,
      platform: "instagram",
      content_type: validated.content_type,
      status: "draft",
      cta: validated.cta,
      hashtags: validated.hashtags,
      created_by: user.id,
      owner_id: user.id
    })
    .select()
    .single();

  if (error) throw error;

  return { content, generated };
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

export async function approveContent(contentId: string, scheduleToCalendar?: boolean, platform?: string, scheduledAt?: string, isAutoPost?: boolean) {
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
        is_auto_post: isAutoPost || false,
        created_by: user.id
      })
      
    if (calError) console.error("Failed to schedule:", calError)
  }

  revalidatePath("/dashboard/contents")
  revalidatePath("/dashboard/calendar")
  return { success: true }
}

export async function deleteContent(contentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: content, error } = await supabase
    .from("contents")
    .update({ 
      deleted_at: new Date().toISOString(),
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
    action: "delete",
    new_data: { deleted_at: new Date().toISOString() }
  })

  revalidatePath("/dashboard/contents")
  return { success: true }
}

export async function updateContent(contentId: string, payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: content, error } = await supabase
    .from("contents")
    .update({ 
      title: payload.title,
      body: payload.body,
      platform: payload.platform,
      content_type: payload.content_type,
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
    new_data: { ...payload, updated_at: new Date().toISOString() }
  })

  revalidatePath("/dashboard/contents")
  revalidatePath(`/dashboard/contents/${contentId}`)
  return { success: true }
}
