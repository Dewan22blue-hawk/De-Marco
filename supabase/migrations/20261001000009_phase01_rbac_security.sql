CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_org_member(
  target_organization_id uuid,
  target_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members AS member
    JOIN public.organizations AS organization
      ON organization.id = member.organization_id
    WHERE member.organization_id = target_organization_id
      AND member.user_id = target_user_id
      AND member.status = 'active'
      AND organization.is_active = true
      AND organization.deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION private.has_role(
  target_organization_id uuid,
  target_role_name text,
  target_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members AS member
    JOIN public.roles AS role ON role.id = member.role_id
    WHERE member.organization_id = target_organization_id
      AND member.user_id = target_user_id
      AND member.status = 'active'
      AND lower(role.name) = lower(target_role_name)
  );
$$;

CREATE OR REPLACE FUNCTION private.has_permission(
  target_organization_id uuid,
  target_permission_code text,
  target_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members AS member
    JOIN public.roles AS role ON role.id = member.role_id
    JOIN public.role_permissions AS role_permission ON role_permission.role_id = role.id
    JOIN public.permissions AS permission ON permission.id = role_permission.permission_id
    WHERE member.organization_id = target_organization_id
      AND member.user_id = target_user_id
      AND member.status = 'active'
      AND permission.code = target_permission_code
  );
$$;

REVOKE ALL ON FUNCTION private.is_org_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_role(uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_permission(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_org_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_permission(uuid, text, uuid) TO authenticated;

INSERT INTO public.permissions (code, name, module, description)
VALUES
  ('organizations.read', 'Read organizations', 'organizations', 'View organization details'),
  ('organizations.update', 'Update organizations', 'organizations', 'Update organization details'),
  ('organization_members.create', 'Create organization members', 'organization_members', 'Add organization members'),
  ('organization_members.update', 'Update organization members', 'organization_members', 'Update member roles and status'),
  ('organization_members.delete', 'Delete organization members', 'organization_members', 'Remove organization members'),
  ('assets.read', 'Read assets', 'assets', 'View organization assets'),
  ('assets.create', 'Create assets', 'assets', 'Create organization assets'),
  ('assets.update', 'Update assets', 'assets', 'Update organization assets'),
  ('assets.delete', 'Delete assets', 'assets', 'Delete organization assets'),
  ('designs.read', 'Read designs', 'designs', 'View organization designs'),
  ('designs.create', 'Create designs', 'designs', 'Create organization designs'),
  ('designs.update', 'Update designs', 'designs', 'Update organization designs'),
  ('designs.delete', 'Delete designs', 'designs', 'Delete organization designs'),
  ('templates.read', 'Read templates', 'templates', 'View organization templates'),
  ('templates.create', 'Create templates', 'templates', 'Create organization templates'),
  ('templates.update', 'Update templates', 'templates', 'Update organization templates'),
  ('templates.delete', 'Delete templates', 'templates', 'Delete organization templates'),
  ('contents.read', 'Read contents', 'contents', 'View organization contents'),
  ('contents.create', 'Create contents', 'contents', 'Create organization contents'),
  ('contents.update', 'Update contents', 'contents', 'Update organization contents'),
  ('contents.delete', 'Delete contents', 'contents', 'Delete organization contents'),
  ('campaigns.read', 'Read campaigns', 'campaigns', 'View organization campaigns'),
  ('campaigns.create', 'Create campaigns', 'campaigns', 'Create organization campaigns'),
  ('campaigns.update', 'Update campaigns', 'campaigns', 'Update organization campaigns'),
  ('campaigns.delete', 'Delete campaigns', 'campaigns', 'Delete organization campaigns'),
  ('documents.read', 'Read documents', 'documents', 'View organization documents'),
  ('documents.create', 'Create documents', 'documents', 'Create organization documents'),
  ('documents.update', 'Update documents', 'documents', 'Update organization documents'),
  ('documents.delete', 'Delete documents', 'documents', 'Delete organization documents'),
  ('leads.read', 'Read leads', 'leads', 'View organization leads'),
  ('leads.create', 'Create leads', 'leads', 'Create organization leads'),
  ('leads.update', 'Update leads', 'leads', 'Update organization leads'),
  ('leads.delete', 'Delete leads', 'leads', 'Delete organization leads')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  module = EXCLUDED.module,
  description = EXCLUDED.description;

CREATE OR REPLACE FUNCTION private.grant_role_permissions(target_role_id uuid, permission_codes text[])
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT target_role_id, permission.id
  FROM public.permissions AS permission
  WHERE permission.code = ANY (permission_codes)
  ON CONFLICT DO NOTHING;
$$;

DO $$
DECLARE
  organization_record record;
  role_record record;
  all_permissions text[] := ARRAY(
    SELECT code FROM public.permissions
  );
BEGIN
  FOR organization_record IN
    SELECT id FROM public.organizations WHERE deleted_at IS NULL
  LOOP
    INSERT INTO public.roles (organization_id, name, display_name, description, is_system)
    VALUES
      (organization_record.id, 'owner', 'Owner', 'Full organization access', true),
      (organization_record.id, 'admin', 'Admin', 'Organization administration access', true),
      (organization_record.id, 'marketing', 'Marketing', 'Marketing workflow access', true),
      (organization_record.id, 'designer', 'Designer', 'Design workflow access', true),
      (organization_record.id, 'business_development', 'Business Development', 'Business development access', true),
      (organization_record.id, 'viewer', 'Viewer', 'Read-only organization access', true)
    ON CONFLICT (organization_id, name) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      description = EXCLUDED.description,
      is_system = true;

    SELECT id INTO role_record FROM public.roles
    WHERE organization_id = organization_record.id AND name = 'owner';
    PERFORM private.grant_role_permissions(role_record.id, all_permissions);

    SELECT id INTO role_record FROM public.roles
    WHERE organization_id = organization_record.id AND name = 'admin';
    PERFORM private.grant_role_permissions(role_record.id, all_permissions);

    SELECT id INTO role_record FROM public.roles
    WHERE organization_id = organization_record.id AND name = 'viewer';
    PERFORM private.grant_role_permissions(
      role_record.id,
      ARRAY['assets.read', 'designs.read', 'templates.read', 'contents.read', 'campaigns.read', 'documents.read', 'leads.read']
    );

    SELECT id INTO role_record FROM public.roles
    WHERE organization_id = organization_record.id AND name = 'marketing';
    PERFORM private.grant_role_permissions(
      role_record.id,
      ARRAY['assets.read', 'assets.create', 'assets.update', 'designs.read', 'templates.read', 'contents.read', 'contents.create', 'contents.update', 'campaigns.read', 'campaigns.create', 'campaigns.update']
    );

    SELECT id INTO role_record FROM public.roles
    WHERE organization_id = organization_record.id AND name = 'designer';
    PERFORM private.grant_role_permissions(
      role_record.id,
      ARRAY['assets.read', 'assets.create', 'assets.update', 'designs.read', 'designs.create', 'designs.update', 'templates.read', 'templates.create', 'templates.update']
    );

    SELECT id INTO role_record FROM public.roles
    WHERE organization_id = organization_record.id AND name = 'business_development';
    PERFORM private.grant_role_permissions(
      role_record.id,
      ARRAY['contents.read', 'campaigns.read', 'documents.read', 'documents.create', 'documents.update', 'leads.read', 'leads.create', 'leads.update']
    );
  END LOOP;
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can view own organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update own organizations" ON public.organizations;
CREATE POLICY "Members can view active organizations" ON public.organizations
  FOR SELECT TO authenticated
  USING (private.is_org_member(id));
CREATE POLICY "Admins can update organizations" ON public.organizations
  FOR UPDATE TO authenticated
  USING (private.has_permission(id, 'organizations.update'))
  WITH CHECK (private.has_permission(id, 'organizations.update'));

DROP POLICY IF EXISTS "Users can view roles of their organizations" ON public.roles;
CREATE POLICY "Members can view organization roles" ON public.roles
  FOR SELECT TO authenticated USING (private.is_org_member(organization_id));

CREATE POLICY "Authenticated users can view permissions" ON public.permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members can view role permissions" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.roles AS role
    WHERE role.id = role_permissions.role_id
      AND private.is_org_member(role.organization_id)
  ));

DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can update members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can insert members to their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can delete members of their organizations" ON public.organization_members;
CREATE POLICY "Members can view active organization members" ON public.organization_members
  FOR SELECT TO authenticated USING (private.is_org_member(organization_id));
CREATE POLICY "Admins can insert organization members" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(organization_id, 'organization_members.create'));
CREATE POLICY "Admins can update organization members" ON public.organization_members
  FOR UPDATE TO authenticated
  USING (private.has_permission(organization_id, 'organization_members.update'))
  WITH CHECK (private.has_permission(organization_id, 'organization_members.update'));
CREATE POLICY "Admins can delete organization members" ON public.organization_members
  FOR DELETE TO authenticated
  USING (private.has_permission(organization_id, 'organization_members.delete'));

REVOKE ALL ON FUNCTION private.grant_role_permissions(uuid, text[]) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;