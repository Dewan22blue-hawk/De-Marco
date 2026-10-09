import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

// Secure Service Role Client for Webhook (Bypasses RLS)
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Ensure the request is authorized via Header Secret
const isAuthorized = (request: Request) => {
  const authHeader = request.headers.get("authorization")
  const expectedToken = process.env.N8N_WEBHOOK_SECRET
  
  if (!expectedToken) {
    console.warn("N8N_WEBHOOK_SECRET is not configured!")
    return false
  }

  return authHeader === `Bearer ${expectedToken}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminClient()

  // Use the RPC to atomically claim due auto-posts
  const { data: claimedEvents, error: claimError } = await supabase.rpc(
    "claim_due_auto_posts", 
    { limit_count: 50 }
  )

  if (claimError) {
    console.error("Failed to claim scheduled events:", claimError)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!claimedEvents || claimedEvents.length === 0) {
    return NextResponse.json({ data: [] })
  }

  // Fetch full details of the contents for the claimed events
  const contentIds = claimedEvents.map((e: any) => e.content_id).filter(Boolean)
  
  if (contentIds.length === 0) {
      return NextResponse.json({ data: claimedEvents })
  }

  const { data: contents, error: contentsError } = await supabase
    .from("contents")
    .select("id, title, body, status, cta, hashtags")
    .in("id", contentIds)

  if (contentsError) {
    console.error("Failed to fetch contents:", contentsError)
  }

  const contentsMap = new Map(contents?.map((c: any) => [c.id, c]) || [])

  // Fetch social accounts for the organizations in claimedEvents
  const orgIds = Array.from(new Set(claimedEvents.map((e: any) => e.organization_id).filter(Boolean)))
  let socialAccounts: any[] = []
  if (orgIds.length > 0) {
    const { data: accounts, error: accountsError } = await supabase
      .from("social_accounts")
      .select("organization_id, platform, account_id, access_token, expires_at")
      .in("organization_id", orgIds as string[])
      .eq("status", "active")

    if (accountsError) {
      console.error("Failed to fetch social accounts:", accountsError)
    } else {
      socialAccounts = accounts || []
    }
  }

  const getSocialAccount = (orgId: string, platform: string) => {
    return socialAccounts.find(a => a.organization_id === orgId && a.platform === platform)
  }

  const validEvents = [];

  for (const e of claimedEvents) {
    const account = getSocialAccount(e.organization_id, e.platform);
    
    let failureReason = null;
    if (!account) {
      failureReason = "No active social account for platform";
    } else if (account.expires_at && new Date(account.expires_at) < new Date()) {
      failureReason = "Social account token expired";
    }

    if (failureReason) {
      // Mark as failed directly
      await supabase
        .from("content_calendar")
        .update({ status: "failed", notes: failureReason, claimed_at: null })
        .eq("id", e.id);
        
      await supabase.from("audit_logs").insert({
        organization_id: e.organization_id,
        table_name: "content_calendar",
        record_id: e.id,
        action: "update",
        new_data: { status: "failed", notes: failureReason },
        user_agent: "n8n-webhook-service"
      });
      continue;
    }

    validEvents.push({
      ...e,
      content: e.content_id ? contentsMap.get(e.content_id) : null,
      social_account: {
        account_id: account.account_id,
        access_token: account.access_token
      }
    });
  }

  return NextResponse.json({ data: validEvents })
}

const WebhookPayloadSchema = z.object({
  eventId: z.string().uuid(),
  contentId: z.string().uuid(),
  organizationId: z.string().uuid(),
  status: z.enum(["success", "failed"]),
  publishedUrl: z.string().url().optional().or(z.literal("")),
  error_note: z.string().max(2000).optional(),
  is_mock: z.boolean().optional()
});

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const jsonPayload = await request.json()
    const parseResult = WebhookPayloadSchema.safeParse(jsonPayload)
    
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid payload", details: parseResult.error.issues }, { status: 400 })
    }

    const { eventId, contentId, organizationId, status, publishedUrl, error_note, is_mock } = parseResult.data

    const supabase = getAdminClient()

    // Idempotency check: prevent duplicate processing
    const { data: currentEvent } = await supabase
      .from("content_calendar")
      .select("status")
      .eq("id", eventId)
      .single()

    if (currentEvent?.status === "published") {
      return NextResponse.json({ success: true, note: "Already published" })
    }

    if (status === "success") {
      // Update calendar status
      await supabase
        .from("content_calendar")
        .update({ status: "published" })
        .eq("id", eventId)
        .in("status", ["queued", "scheduled"])

      // Fetch existing metadata to merge
      const { data: currentContent } = await supabase
        .from("contents")
        .select("metadata")
        .eq("id", contentId)
        .single()
        
      const existingMetadata = currentContent?.metadata || {}

      // Update contents status
      await supabase
        .from("contents")
        .update({ 
          status: "published", 
          published_at: new Date().toISOString(),
          metadata: { ...existingMetadata, published_url: publishedUrl, is_mock: is_mock ?? false }
        })
        .eq("id", contentId)

      // Log to audit
      await supabase.from("audit_logs").insert({
        organization_id: organizationId,
        table_name: "contents",
        record_id: contentId,
        action: "update",
        new_data: { status: "published" },
        user_agent: "n8n-webhook-service"
      })

      return NextResponse.json({ success: true })

    } else {
      // Update calendar status to failed
      await supabase
        .from("content_calendar")
        .update({ 
          status: "failed",
          notes: error_note || "Publishing failed via n8n",
          claimed_at: null
        })
        .eq("id", eventId)
        .in("status", ["queued", "scheduled"])

      // Log to audit
      await supabase.from("audit_logs").insert({
        organization_id: organizationId,
        table_name: "content_calendar",
        record_id: eventId,
        action: "update",
        new_data: { status: "failed", error_note },
        user_agent: "n8n-webhook-service"
      })

      return NextResponse.json({ success: true, status: "failed" })
    }
  } catch (err) {
    console.error("Webhook processing error:", err)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
}
