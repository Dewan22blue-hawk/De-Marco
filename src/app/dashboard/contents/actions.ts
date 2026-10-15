"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"
import { runAITask } from "@/lib/ai/service"
import { GeneratedContentSchema } from "@/schemas/ai-content"

export async function listContents(opts?: { search?: string; status?: string; platform?: string; sort?: string; limit?: number; offset?: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  let query = supabase
    .from("contents")
    .select("*, brand:brands(name), content_calendar(id, scheduled_at, status)", { count: "exact" })
    .eq("organization_id", profile.default_organization_id)
    .is("deleted_at", null)

  if (opts?.search) query = query.ilike("title", `%${opts.search}%`)
  if (opts?.status && opts.status !== "all") query = query.eq("status", opts.status)
  if (opts?.platform && opts.platform !== "all") query = query.eq("platform", opts.platform)

  const limit = opts?.limit || 24
  const offset = opts?.offset || 0

  const sortBy = opts?.sort || "newest"
  let orderColumn = "created_at"
  let ascending = false
  if (sortBy === "title-asc") { orderColumn = "title"; ascending = true; }
  else if (sortBy === "title-desc") { orderColumn = "title"; ascending = false; }
  else { orderColumn = "created_at"; ascending = false; }

  query = query.order(orderColumn, { ascending }).range(offset, offset + limit - 1)

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

  const { hasPermission } = await import("@/lib/auth/authorization")
  const isAllowed = await hasPermission("contents.create")
  if (!isAllowed) throw new Error("Forbidden")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")
  const organizationId = profile.default_organization_id

  const { data: content, error } = await supabase
    .from("contents")
    .insert({
      organization_id: organizationId,
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

  // If campaign_id is provided, securely link to campaign
  if (payload.campaign_id) {
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", payload.campaign_id)
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .maybeSingle()

    if (campaign) {
      const canUpdateCampaign = await hasPermission("campaigns.update")
      if (canUpdateCampaign) {
        const { error: linkError } = await supabase
          .from("campaign_contents")
          .insert({
            campaign_id: campaign.id,
            content_id: content.id,
            added_by: user.id
          })
        if (linkError && linkError.code !== "23505") {
          console.error("Failed to link content to campaign:", linkError)
        }
      } else {
        console.warn("User lacks campaigns.update permission; skipping campaign link for content:", content.id)
      }
    } else {
      console.warn("Campaign not found or not in organization; skipping campaign link:", payload.campaign_id)
    }
  }

  await createAuditLog({
    organization_id: organizationId,
    table_name: "contents",
    record_id: content.id,
    action: "create",
    new_data: content
  })

  revalidatePath("/dashboard/contents")
  return { success: true, content }
}

export async function generateContentWithAI(
  topic: string,
  contentType: string = "post",
  campaignId?: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { hasPermission } = await import("@/lib/auth/authorization")
  const isAllowed = await hasPermission("contents.create")
  if (!isAllowed) throw new Error("Forbidden")

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) throw new Error("No organization assigned");
  const organizationId = profile.default_organization_id;

  const { data: brandKit } = await supabase
    .from("brands")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle()

  // Check if AI is configured
  const { getOrgApiKey } = await import("@/lib/ai/key-vault")
  const apiKey = await getOrgApiKey(organizationId, 'gemini')
  if (!apiKey) {
    throw new Error("AI_NOT_CONFIGURED: Please configure your Gemini API key in Settings > AI Configuration")
  }

  let campaign = null
  if (campaignId) {
    const { data: campaignData } = await supabase
      .from("campaigns")
      .select("id, name, code, objective, target_audience, description")
      .eq("id", campaignId)
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .maybeSingle()
    campaign = campaignData
  }

  let prompt = `Generate a ${contentType} about: ${topic}

Return ONLY a valid JSON object with this exact structure:
{
  "title": "string (3-100 chars)",
  "body": "string (min 10 chars)",
  "hashtags": ["string", "string"],
  "cta": "string (optional)",
  "tone": "string (optional, default: Professional)",
  "content_type": "post|story|reel|article|announcement (default: post)"
}

Rules:
- No markdown formatting
- No backticks
- No conversational text
- Only the JSON object`;

  if (campaign) {
    const campaignDetails: string[] = []
    if (campaign.name) campaignDetails.push(`Campaign Name: ${campaign.name}`)
    if (campaign.code) campaignDetails.push(`Campaign Code: ${campaign.code}`)
    if (campaign.objective) campaignDetails.push(`Objective: ${campaign.objective}`)
    if (campaign.target_audience) campaignDetails.push(`Target Audience: ${campaign.target_audience}`)
    if (campaign.description) campaignDetails.push(`Description: ${campaign.description}`)
    if (campaignDetails.length > 0) {
      prompt += `\n\nCampaign Context:\n${campaignDetails.join("\n")}`
    }
  }

  try {
    const generated = await runAITask({
      organization_id: organizationId,
      task_type: "content_generation",
      context: { brand: brandKit, campaign: campaign || undefined } as any,
      prompt,
      schema: GeneratedContentSchema
    });

    return { generated };
  } catch (error: any) {
    // Provide more specific error messages
    const errMsg = String(error?.message || error || "").toLowerCase()
    
    if (errMsg.includes("ai_not_configured") || errMsg.includes("ai provider configuration missing")) {
      throw new Error("AI_NOT_CONFIGURED: Please configure your Gemini API key in Settings > AI Configuration")
    }
    if (errMsg.includes("invalid ai output format") || errMsg.includes("json")) {
      throw new Error("AI_RESPONSE_INVALID: The AI returned an invalid response. Please try again.")
    }
    if (errMsg.includes("api key") || errMsg.includes("authentication") || errMsg.includes("permission")) {
      throw new Error("AI_AUTH_ERROR: Invalid or expired API key. Please update your Gemini API key in Settings.")
    }
    if (errMsg.includes("quota") || errMsg.includes("rate limit") || errMsg.includes("resource_exhausted") || errMsg.includes("high demand") || errMsg.includes("429") || errMsg.includes("model is currently experiencing")) {
      throw new Error("AI_RATE_LIMITED: AI quota exceeded. Please wait a moment and try again.")
    }
    throw new Error(`AI_GENERATION_FAILED: ${error?.message || "Unknown error occurred"}`)
  }
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

  if (error || !content) {
    throw new Error(error?.message || "Content not found or delete blocked")
  }

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

export async function bulkDeleteContents(contentIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { hasPermission } = await import("@/lib/auth/authorization")
  const isAllowed = await hasPermission("contents.delete")
  if (!isAllowed) throw new Error("Forbidden")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")
  const organizationId = profile.default_organization_id

  // Verify all contents belong to the organization
  const { data: contents, error: fetchError } = await supabase
    .from("contents")
    .select("id")
    .in("id", contentIds)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)

  if (fetchError) throw fetchError
  if (!contents || contents.length !== contentIds.length) {
    throw new Error("Some contents not found or access denied")
  }

  const { error } = await supabase
    .from("contents")
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_by: user.id
    })
    .in("id", contentIds)
    .eq("organization_id", organizationId)

  if (error) throw error

  for (const contentId of contentIds) {
    await createAuditLog({
      organization_id: organizationId,
      table_name: "contents",
      record_id: contentId,
      action: "delete",
      new_data: { deleted_at: new Date().toISOString() }
    })
  }

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
