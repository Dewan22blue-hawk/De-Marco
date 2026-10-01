-- Phase 03 hardening: normalize template model and tighten tenant-scoped RLS.

CREATE UNIQUE INDEX IF NOT EXISTS idx_template_categories_org_slug_unique
    ON public.template_categories (organization_id, slug)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_template_categories_org_name_unique
    ON public.template_categories (organization_id, name)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_templates_org_active_deleted
    ON public.templates (organization_id, is_active, deleted_at);

CREATE INDEX IF NOT EXISTS idx_template_versions_template_version
    ON public.template_versions (template_id, version);

CREATE INDEX IF NOT EXISTS idx_template_variables_template_order
    ON public.template_variables (template_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_template_elements_template_zindex
    ON public.template_elements (template_id, z_index);

-- Harden template_categories policies to enforce tenant + soft-delete visibility.
DROP POLICY IF EXISTS "Members can view template categories" ON public.template_categories;
DROP POLICY IF EXISTS "Template managers can create template categories" ON public.template_categories;
DROP POLICY IF EXISTS "Template managers can update template categories" ON public.template_categories;
DROP POLICY IF EXISTS "Template managers can delete template categories" ON public.template_categories;

CREATE POLICY "Members can view template categories"
  ON public.template_categories
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.read')
  );

CREATE POLICY "Template managers can create template categories"
  ON public.template_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.create')
  );

CREATE POLICY "Template managers can update template categories"
  ON public.template_categories
  FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.update')
  )
  WITH CHECK (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.update')
  );

CREATE POLICY "Template managers can delete template categories"
  ON public.template_categories
  FOR DELETE TO authenticated
  USING (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.delete')
  );

-- Harden templates policies with soft-delete awareness.
DROP POLICY IF EXISTS "Members can view templates" ON public.templates;
DROP POLICY IF EXISTS "Template managers can create templates" ON public.templates;
DROP POLICY IF EXISTS "Template managers can update templates" ON public.templates;
DROP POLICY IF EXISTS "Template managers can delete templates" ON public.templates;

CREATE POLICY "Members can view templates"
  ON public.templates
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.read')
  );

CREATE POLICY "Template managers can create templates"
  ON public.templates
  FOR INSERT TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.create')
  );

CREATE POLICY "Template managers can update templates"
  ON public.templates
  FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.update')
  )
  WITH CHECK (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.update')
  );

CREATE POLICY "Template managers can delete templates"
  ON public.templates
  FOR DELETE TO authenticated
  USING (
    deleted_at IS NULL
    AND private.has_permission(organization_id, 'templates.delete')
  );

-- Harden template child tables to ensure they only expose rows from current org.
DROP POLICY IF EXISTS "Members can view template versions" ON public.template_versions;
DROP POLICY IF EXISTS "Template managers can create template versions" ON public.template_versions;

CREATE POLICY "Members can view template versions"
  ON public.template_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_versions.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.read')
    )
  );

CREATE POLICY "Template managers can create template versions"
  ON public.template_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_versions.template_id
        AND template.deleted_at IS NULL
        AND (
          private.has_permission(template.organization_id, 'templates.create')
          OR private.has_permission(template.organization_id, 'templates.update')
        )
    )
  );

DROP POLICY IF EXISTS "Members can view template variables" ON public.template_variables;
DROP POLICY IF EXISTS "Template managers can create template variables" ON public.template_variables;
DROP POLICY IF EXISTS "Template managers can update template variables" ON public.template_variables;
DROP POLICY IF EXISTS "Template managers can delete template variables" ON public.template_variables;

CREATE POLICY "Members can view template variables"
  ON public.template_variables
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_variables.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.read')
    )
  );

CREATE POLICY "Template managers can create template variables"
  ON public.template_variables
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_variables.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.create')
    )
  );

CREATE POLICY "Template managers can update template variables"
  ON public.template_variables
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_variables.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.update')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_variables.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.update')
    )
  );

CREATE POLICY "Template managers can delete template variables"
  ON public.template_variables
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_variables.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.delete')
    )
  );

DROP POLICY IF EXISTS "Members can view template elements" ON public.template_elements;
DROP POLICY IF EXISTS "Template managers can create template elements" ON public.template_elements;
DROP POLICY IF EXISTS "Template managers can update template elements" ON public.template_elements;
DROP POLICY IF EXISTS "Template managers can delete template elements" ON public.template_elements;

CREATE POLICY "Members can view template elements"
  ON public.template_elements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_elements.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.read')
    )
  );

CREATE POLICY "Template managers can create template elements"
  ON public.template_elements
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_elements.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.create')
    )
  );

CREATE POLICY "Template managers can update template elements"
  ON public.template_elements
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_elements.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.update')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_elements.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.update')
    )
  );

CREATE POLICY "Template managers can delete template elements"
  ON public.template_elements
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_elements.template_id
        AND template.deleted_at IS NULL
        AND private.has_permission(template.organization_id, 'templates.delete')
    )
  );
