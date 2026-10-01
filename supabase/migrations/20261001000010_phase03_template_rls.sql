-- Phase 03: tenant isolation and RBAC for the reusable template blueprint engine.

ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_elements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view template categories" ON public.template_categories;
DROP POLICY IF EXISTS "Template managers can create template categories" ON public.template_categories;
DROP POLICY IF EXISTS "Template managers can update template categories" ON public.template_categories;
DROP POLICY IF EXISTS "Template managers can delete template categories" ON public.template_categories;

CREATE POLICY "Members can view template categories"
  ON public.template_categories
  FOR SELECT TO authenticated
  USING (private.has_permission(organization_id, 'templates.read'));

CREATE POLICY "Template managers can create template categories"
  ON public.template_categories
  FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(organization_id, 'templates.create'));

CREATE POLICY "Template managers can update template categories"
  ON public.template_categories
  FOR UPDATE TO authenticated
  USING (private.has_permission(organization_id, 'templates.update'))
  WITH CHECK (private.has_permission(organization_id, 'templates.update'));

CREATE POLICY "Template managers can delete template categories"
  ON public.template_categories
  FOR DELETE TO authenticated
  USING (private.has_permission(organization_id, 'templates.delete'));

DROP POLICY IF EXISTS "Members can view templates" ON public.templates;
DROP POLICY IF EXISTS "Template managers can create templates" ON public.templates;
DROP POLICY IF EXISTS "Template managers can update templates" ON public.templates;
DROP POLICY IF EXISTS "Template managers can delete templates" ON public.templates;

CREATE POLICY "Members can view templates"
  ON public.templates
  FOR SELECT TO authenticated
  USING (private.has_permission(organization_id, 'templates.read'));

CREATE POLICY "Template managers can create templates"
  ON public.templates
  FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(organization_id, 'templates.create'));

CREATE POLICY "Template managers can update templates"
  ON public.templates
  FOR UPDATE TO authenticated
  USING (private.has_permission(organization_id, 'templates.update'))
  WITH CHECK (private.has_permission(organization_id, 'templates.update'));

CREATE POLICY "Template managers can delete templates"
  ON public.templates
  FOR DELETE TO authenticated
  USING (private.has_permission(organization_id, 'templates.delete'));

DROP POLICY IF EXISTS "Members can view template versions" ON public.template_versions;
DROP POLICY IF EXISTS "Template managers can create template versions" ON public.template_versions;

CREATE POLICY "Members can view template versions"
  ON public.template_versions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_versions.template_id
      AND private.has_permission(template.organization_id, 'templates.read')
  ));

CREATE POLICY "Template managers can create template versions"
  ON public.template_versions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_versions.template_id
      AND (
        private.has_permission(template.organization_id, 'templates.create')
        OR private.has_permission(template.organization_id, 'templates.update')
      )
  ));

DROP POLICY IF EXISTS "Members can view template variables" ON public.template_variables;
DROP POLICY IF EXISTS "Template managers can create template variables" ON public.template_variables;
DROP POLICY IF EXISTS "Template managers can update template variables" ON public.template_variables;
DROP POLICY IF EXISTS "Template managers can delete template variables" ON public.template_variables;

CREATE POLICY "Members can view template variables"
  ON public.template_variables
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_variables.template_id
      AND private.has_permission(template.organization_id, 'templates.read')
  ));

CREATE POLICY "Template managers can create template variables"
  ON public.template_variables
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_variables.template_id
      AND private.has_permission(template.organization_id, 'templates.create')
  ));

CREATE POLICY "Template managers can update template variables"
  ON public.template_variables
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_variables.template_id
      AND private.has_permission(template.organization_id, 'templates.update')
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_variables.template_id
      AND private.has_permission(template.organization_id, 'templates.update')
  ));

CREATE POLICY "Template managers can delete template variables"
  ON public.template_variables
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_variables.template_id
      AND private.has_permission(template.organization_id, 'templates.update')
  ));

DROP POLICY IF EXISTS "Members can view template elements" ON public.template_elements;
DROP POLICY IF EXISTS "Template managers can create template elements" ON public.template_elements;
DROP POLICY IF EXISTS "Template managers can update template elements" ON public.template_elements;
DROP POLICY IF EXISTS "Template managers can delete template elements" ON public.template_elements;

CREATE POLICY "Members can view template elements"
  ON public.template_elements
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_elements.template_id
      AND private.has_permission(template.organization_id, 'templates.read')
  ));

CREATE POLICY "Template managers can create template elements"
  ON public.template_elements
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_elements.template_id
      AND private.has_permission(template.organization_id, 'templates.create')
  ));

CREATE POLICY "Template managers can update template elements"
  ON public.template_elements
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_elements.template_id
      AND private.has_permission(template.organization_id, 'templates.update')
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_elements.template_id
      AND private.has_permission(template.organization_id, 'templates.update')
  ));

CREATE POLICY "Template managers can delete template elements"
  ON public.template_elements
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.templates AS template
    WHERE template.id = template_elements.template_id
      AND private.has_permission(template.organization_id, 'templates.update')
  ));
