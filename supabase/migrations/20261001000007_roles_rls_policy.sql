-- Add SELECT policy for roles table
CREATE POLICY "Users can view roles of their organizations" ON public.roles
  FOR SELECT USING (organization_id IN (SELECT public.user_organizations()));
