-- Migration: 20261005000008_enable_campaign_link_rls.sql
-- Description: Enable RLS and define scoped policies for campaign_contents and campaign_designs join tables.

-- 1. Enable RLS on both join tables
ALTER TABLE public.campaign_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_designs ENABLE ROW LEVEL SECURITY;

-- 2. CAMPAIGN_CONTENTS policies
DROP POLICY IF EXISTS "Members can view campaign contents" ON public.campaign_contents;
CREATE POLICY "Members can view campaign contents" ON public.campaign_contents
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_contents.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.read')
  ));

DROP POLICY IF EXISTS "Campaign managers can link contents" ON public.campaign_contents;
CREATE POLICY "Campaign managers can link contents" ON public.campaign_contents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_contents.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.update')
  ));

DROP POLICY IF EXISTS "Campaign managers can unlink contents" ON public.campaign_contents;
CREATE POLICY "Campaign managers can unlink contents" ON public.campaign_contents
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_contents.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.update')
  ));

-- 3. CAMPAIGN_DESIGNS policies
DROP POLICY IF EXISTS "Members can view campaign designs" ON public.campaign_designs;
CREATE POLICY "Members can view campaign designs" ON public.campaign_designs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_designs.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.read')
  ));

DROP POLICY IF EXISTS "Campaign managers can link designs" ON public.campaign_designs;
CREATE POLICY "Campaign managers can link designs" ON public.campaign_designs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_designs.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.update')
  ));

DROP POLICY IF EXISTS "Campaign managers can unlink designs" ON public.campaign_designs;
CREATE POLICY "Campaign managers can unlink designs" ON public.campaign_designs
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_designs.campaign_id
    AND private.has_permission(c.organization_id, 'campaigns.update')
  ));
