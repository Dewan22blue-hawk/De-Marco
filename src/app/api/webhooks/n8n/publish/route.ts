import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

  const enrichedEvents = claimedEvents.map((e: any) => ({
    ...e,
    content: e.content_id ? contentsMap.get(e.content_id) : null
  }))

  return NextResponse.json({ data: enrichedEvents })
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const { eventId, contentId, organizationId, status, publishedUrl, error_note, is_mock } = payload

    if (!eventId || !status || !contentId || !organizationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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
          notes: error_note || "Publishing failed via n8n"
        })
        .eq("id", eventId)

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
