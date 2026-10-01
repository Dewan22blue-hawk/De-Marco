CREATE OR REPLACE FUNCTION public.user_organizations()
RETURNS SETOF uuid AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations
CREATE POLICY "Users can view own organizations" ON public.organizations
  FOR SELECT USING (id IN (SELECT public.user_organizations()));

CREATE POLICY "Users can update own organizations" ON public.organizations
  FOR UPDATE USING (id IN (SELECT public.user_organizations()));

-- Organization Members
CREATE POLICY "Users can view members of their organizations" ON public.organization_members
  FOR SELECT USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Users can update members of their organizations" ON public.organization_members
  FOR UPDATE USING (organization_id IN (SELECT public.user_organizations()));

-- Brands
CREATE POLICY "Users can view brands of their organizations" ON public.brands
  FOR SELECT USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Users can update brands of their organizations" ON public.brands
  FOR UPDATE USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Users can insert brands to their organizations" ON public.brands
  FOR INSERT WITH CHECK (organization_id IN (SELECT public.user_organizations()));
