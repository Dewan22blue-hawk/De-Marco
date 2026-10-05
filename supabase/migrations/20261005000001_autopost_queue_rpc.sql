CREATE INDEX IF NOT EXISTS idx_content_calendar_autopost_queue 
ON public.content_calendar (status, is_auto_post, scheduled_at);

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
AS $$
    UPDATE public.content_calendar
    SET status = 'queued',
        updated_at = now()
    WHERE id IN (
        SELECT id 
        FROM public.content_calendar
        WHERE status = 'scheduled'
          AND is_auto_post = true
          AND scheduled_at <= now()
        ORDER BY scheduled_at
        LIMIT limit_count
        FOR UPDATE SKIP LOCKED
    )
    RETURNING id, organization_id, platform, scheduled_at, content_id, campaign_id;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_due_auto_posts(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_due_auto_posts(int) TO service_role;
