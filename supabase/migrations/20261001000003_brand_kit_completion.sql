-- =========================================================================
-- BRAND KIT MIGRATION (PHASE 03 - COMPLETION)
-- =========================================================================
-- Menambahkan:
--   1. Kolom logo_asset_id di tabel brands.
--   2. RLS + Policies untuk brand_colors & brand_fonts.
--   3. RLS + Policies untuk audit_logs (insert-only untuk authenticated).
--   4. Update policy assets agar scoped by organization_id.
-- =========================================================================

-- 1. Add logo_asset_id to brands
ALTER TABLE brands
    ADD COLUMN IF NOT EXISTS logo_asset_id uuid REFERENCES assets(id) ON DELETE SET NULL;

-- 2. Enable RLS on tables that are still missing it
ALTER TABLE brand_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_fonts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs  ENABLE ROW LEVEL SECURITY;

-- 3. Helper: a SQL function to get the user's active organization_id.
--    Used by RLS policies below so we can compare the row's
--    organization_id (or brand.organization_id) against the caller's
--    active membership.
CREATE OR REPLACE FUNCTION public.current_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT default_organization_id
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
$$;

-- Helper: check if current user is a member of the given organization.
CREATE OR REPLACE FUNCTION public.is_member_of(p_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members om
        WHERE om.organization_id = p_organization_id
          AND om.user_id = auth.uid()
          AND om.status = 'active'
    );
$$;

-- 4. brand_colors RLS policies
DROP POLICY IF EXISTS "Members can view brand colors"  ON brand_colors;
DROP POLICY IF EXISTS "Members can insert brand colors" ON brand_colors;
DROP POLICY IF EXISTS "Members can update brand colors" ON brand_colors;
DROP POLICY IF EXISTS "Members can delete brand colors" ON brand_colors;

CREATE POLICY "Members can view brand colors"
    ON brand_colors FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_colors.brand_id
              AND public.is_member_of(b.organization_id)
        )
    );

CREATE POLICY "Members can insert brand colors"
    ON brand_colors FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_colors.brand_id
              AND public.is_member_of(b.organization_id)
        )
    );

CREATE POLICY "Members can update brand colors"
    ON brand_colors FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_colors.brand_id
              AND public.is_member_of(b.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_colors.brand_id
              AND public.is_member_of(b.organization_id)
        )
    );

CREATE POLICY "Members can delete brand colors"
    ON brand_colors FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_colors.brand_id
              AND public.is_member_of(b.organization_id)
        )
    );

-- 5. brand_fonts RLS policies (same pattern)
DROP POLICY IF EXISTS "Members can view brand fonts"  ON brand_fonts;
DROP POLICY IF EXISTS "Members can insert brand fonts" ON brand_fonts;
DROP POLICY IF EXISTS "Members can update brand fonts" ON brand_fonts;
DROP POLICY IF EXISTS "Members can delete brand fonts" ON brand_fonts;

CREATE POLICY "Members can view brand fonts"
    ON brand_fonts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_fonts.brand_id
              AND public.is_member_of(b.organization_id)
        )
    );

CREATE POLICY "Members can insert brand fonts"
    ON brand_fonts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_fonts.brand_id
              AND public.is_member_of(b.organization_id)
        )
    );

CREATE POLICY "Members can update brand fonts"
    ON brand_fonts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_fonts.brand_id
              AND public.is_member_of(b.organization_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_fonts.brand_id
              AND public.is_member_of(b.organization_id)
        )
    );

CREATE POLICY "Members can delete brand fonts"
    ON brand_fonts FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM brands b
            WHERE b.id = brand_fonts.brand_id
              AND public.is_member_of(b.organization_id)
        )
    );

-- 6. Tighten assets policy: previously allowed any authenticated user to
--    SELECT/INSERT/UPDATE/DELETE any row. Now scoped by organization_id.
DROP POLICY IF EXISTS "Members can view assets"   ON assets;
DROP POLICY IF EXISTS "Members can insert assets" ON assets;
DROP POLICY IF EXISTS "Members can update assets" ON assets;
DROP POLICY IF EXISTS "Members can delete assets" ON assets;

CREATE POLICY "Members can view assets"
    ON assets FOR SELECT
    TO authenticated
    USING (public.is_member_of(organization_id));

CREATE POLICY "Members can insert assets"
    ON assets FOR INSERT
    TO authenticated
    WITH CHECK (public.is_member_of(organization_id));

CREATE POLICY "Members can update assets"
    ON assets FOR UPDATE
    TO authenticated
    USING (public.is_member_of(organization_id))
    WITH CHECK (public.is_member_of(organization_id));

CREATE POLICY "Members can delete assets"
    ON assets FOR DELETE
    TO authenticated
    USING (public.is_member_of(organization_id));

-- 7. audit_logs: insert-only by members of the referenced organization
DROP POLICY IF EXISTS "Members can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Members can view audit logs"   ON audit_logs;

CREATE POLICY "Members can insert audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IS NULL
        OR public.is_member_of(organization_id)
    );

CREATE POLICY "Members can view audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (
        organization_id IS NULL
        OR public.is_member_of(organization_id)
    );

-- 8. Helpful indices
CREATE INDEX IF NOT EXISTS idx_brand_colors_brand ON brand_colors(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_fonts_brand  ON brand_fonts(brand_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org     ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user    ON audit_logs(user_id);