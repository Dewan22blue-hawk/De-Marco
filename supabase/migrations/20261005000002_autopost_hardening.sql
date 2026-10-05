-- MIGRATION: Auto Post Hardening (Fix 1 & 2)

-- 1. Add claimed_at column for lease tracking
ALTER TABLE public.content_calendar
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- 2. Hardened RPC with search_path and lease reclaim logic
-- Note: This RPC is deliberately cross-organization because it is called by a global cron worker (n8n) using service_role.
CREATE OR REPLACE FUNCTION public.claim_due_auto_posts(limit_count int)
RETURNS TABLE (
    id uuid,
    organization_id uuid,
    platform content_platform,
    scheduled_at timestamptz,
    content_id uuid,
    campaign_id uuid
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    UPDATE public.content_calendar
    SET status = 'queued',
        claimed_at = now(),
        updated_at = now()
    WHERE id IN (
        SELECT id 
        FROM public.content_calendar
        WHERE (
            (status = 'scheduled' AND is_auto_post = true AND scheduled_at <= now())
            OR
            (status = 'queued' AND claimed_at < now() - interval '10 minutes')
        )
        ORDER BY scheduled_at
        LIMIT limit_count
        FOR UPDATE SKIP LOCKED
    )
    RETURNING id, organization_id, platform, scheduled_at, content_id, campaign_id;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_due_auto_posts(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_due_auto_posts(int) TO service_role;
