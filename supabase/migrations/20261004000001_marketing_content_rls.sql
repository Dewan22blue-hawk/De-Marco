-- MIGRATION: Marketing Content Module RLS
-- Fixes: campaigns, contents, content_calendar, campaign_contents
-- had ENABLE ROW LEVEL SECURITY from init_schema but NO policies,
-- causing default-deny that broke the Marketing menus.
-- Follows the RBAC permission pattern (private.has_permission) used by designs_rls.

-- =========================================================================
-- CAMPAIGNS
-- =========================================================================
CREATE POLICY "Members can view campaigns" ON public.campaigns
  FOR SELECT TO authenticated
  USING (private.has_permission(organization_id, 'campaigns.read'));

CREATE POLICY "Campaign managers can create campaigns" ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(organization_id, 'campaigns.create'));

CREATE POLICY "Campaign managers can update campaigns" ON public.campaigns
  FOR UPDATE TO authenticated
  USING (private.has_permission(organization_id, 'campaigns.update'))
  WITH CHECK (private.has_permission(organization_id, 'campaigns.update'));

CREATE POLICY "Campaign managers can delete campaigns" ON public.campaigns
  FOR DELETE TO authenticated
  USING (private.has_permission(organization_id, 'campaigns.delete'));

-- =========================================================================
-- CONTENTS
-- =========================================================================
CREATE POLICY "Members can view contents" ON public.contents
  FOR SELECT TO authenticated
  USING (private.has_permission(organization_id, 'contents.read'));

CREATE POLICY "Content editors can create contents" ON public.contents
  FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(organization_id, 'contents.create'));

CREATE POLICY "Content editors can update contents" ON public.contents
  FOR UPDATE TO authenticated
  USING (private.has_permission(organization_id, 'contents.update'))
  WITH CHECK (private.has_permission(organization_id, 'contents.update'));

CREATE POLICY "Content managers can delete contents" ON public.contents
  FOR DELETE TO authenticated
  USING (private.has_permission(organization_id, 'contents.delete'));

-- =========================================================================
-- CAMPAIGN_CONTENTS (join table) — scoped through parent campaign
-- =========================================================================
CREATE POLICY "Members can view campaign contents" ON public.campaign_contents
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_contents.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.read')
  ));

CREATE POLICY "Campaign managers can link contents" ON public.campaign_contents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_contents.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.update')
  ));

CREATE POLICY "Campaign managers can unlink contents" ON public.campaign_contents
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_contents.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.update')
  ));

-- =========================================================================
-- CONTENT_CALENDAR
-- =========================================================================
CREATE POLICY "Members can view calendar events" ON public.content_calendar
  FOR SELECT TO authenticated
  USING (private.has_permission(organization_id, 'contents.read'));

CREATE POLICY "Content editors can schedule events" ON public.content_calendar
  FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(organization_id, 'contents.update'));

CREATE POLICY "Content editors can update events" ON public.content_calendar
  FOR UPDATE TO authenticated
  USING (private.has_permission(organization_id, 'contents.update'))
  WITH CHECK (private.has_permission(organization_id, 'contents.update'));

CREATE POLICY "Content managers can delete events" ON public.content_calendar
  FOR DELETE TO authenticated
  USING (private.has_permission(organization_id, 'contents.delete'));
