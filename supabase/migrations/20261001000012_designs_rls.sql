-- Enable RLS
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_versions ENABLE ROW LEVEL SECURITY;

-- DESIGNS POLICIES
CREATE POLICY "Members can view designs" ON public.designs 
  FOR SELECT TO authenticated
  USING (private.has_permission(organization_id, 'designs.read'));

CREATE POLICY "Design creators can create" ON public.designs 
  FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(organization_id, 'designs.create'));

CREATE POLICY "Design editors can update" ON public.designs 
  FOR UPDATE TO authenticated
  USING (private.has_permission(organization_id, 'designs.update'))
  WITH CHECK (private.has_permission(organization_id, 'designs.update'));

CREATE POLICY "Design owners can delete" ON public.designs 
  FOR DELETE TO authenticated
  USING (private.has_permission(organization_id, 'designs.delete'));

-- DESIGN_ELEMENTS POLICIES
CREATE POLICY "Members can view design elements" ON public.design_elements 
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_elements.design_id 
    AND private.has_permission(d.organization_id, 'designs.read')
  ));

CREATE POLICY "Design creators can create elements" ON public.design_elements 
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_elements.design_id 
    AND private.has_permission(d.organization_id, 'designs.create')
  ));

CREATE POLICY "Design editors can update elements" ON public.design_elements 
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_elements.design_id 
    AND private.has_permission(d.organization_id, 'designs.update')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_elements.design_id 
    AND private.has_permission(d.organization_id, 'designs.update')
  ));

CREATE POLICY "Design owners can delete elements" ON public.design_elements 
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_elements.design_id 
    AND private.has_permission(d.organization_id, 'designs.delete')
  ));

-- DESIGN_VERSIONS POLICIES
CREATE POLICY "Members can view design versions" ON public.design_versions 
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_versions.design_id 
    AND private.has_permission(d.organization_id, 'designs.read')
  ));

CREATE POLICY "Design creators can create versions" ON public.design_versions 
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_versions.design_id 
    AND private.has_permission(d.organization_id, 'designs.create')
  ));

CREATE POLICY "Design editors can update versions" ON public.design_versions 
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_versions.design_id 
    AND private.has_permission(d.organization_id, 'designs.update')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_versions.design_id 
    AND private.has_permission(d.organization_id, 'designs.update')
  ));

CREATE POLICY "Design owners can delete versions" ON public.design_versions 
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.designs d 
    WHERE d.id = design_versions.design_id 
    AND private.has_permission(d.organization_id, 'designs.delete')
  ));
