-- Organization Members missing policies
CREATE POLICY "Users can insert members to their organizations" ON public.organization_members
  FOR INSERT WITH CHECK (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Users can delete members of their organizations" ON public.organization_members
  FOR DELETE USING (organization_id IN (SELECT public.user_organizations()));
