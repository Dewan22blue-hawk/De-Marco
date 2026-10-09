-- MIGRATION: Phase 07/08 Auto Post Security Hardening 2 (Column Revoke)

-- Revoke select on sensitive columns from authenticated users
REVOKE SELECT (access_token, refresh_token) ON public.social_accounts FROM authenticated;

-- Grant select on non-sensitive columns to authenticated users
GRANT SELECT (
    id, organization_id, platform, account_id, account_name,
    status, expires_at, metadata, created_at, updated_at, created_by
) ON public.social_accounts TO authenticated;
