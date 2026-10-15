-- Migration: 20261005000009_fix_templates_rls.sql
-- Description: Clean reset and fix of RLS policies on public.templates, template_categories, template_variables, and template_elements.
-- Resolves soft-delete failure caused by conflicting/stale policies with `WITH CHECK (deleted_at IS NULL)` and ensures update workflows can replace child records.

-- 1. Drop ALL existing policies on public.templates to eliminate stale/conflicting policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'templates'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.templates', r.policyname);
  END LOOP;
END $$;

-- Recreate canonical policies for public.templates
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
    AND (
      private.has_permission(organization_id, 'templates.update')
      OR private.has_permission(organization_id, 'templates.delete')
    )
  )
  WITH CHECK (
    private.has_permission(organization_id, 'templates.update')
    OR private.has_permission(organization_id, 'templates.delete')
  );

CREATE POLICY "Template managers can delete templates"
  ON public.templates
  FOR DELETE TO authenticated
  USING (
    private.has_permission(organization_id, 'templates.delete')
  );

-- 2. Drop and recreate policies for public.template_categories
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'template_categories'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.template_categories', r.policyname);
  END LOOP;
END $$;

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
    AND (
      private.has_permission(organization_id, 'templates.update')
      OR private.has_permission(organization_id, 'templates.delete')
    )
  )
  WITH CHECK (
    private.has_permission(organization_id, 'templates.update')
    OR private.has_permission(organization_id, 'templates.delete')
  );

CREATE POLICY "Template managers can delete template categories"
  ON public.template_categories
  FOR DELETE TO authenticated
  USING (
    private.has_permission(organization_id, 'templates.delete')
  );

-- 3. Fix DELETE policy on public.template_variables to allow template update workflows
DROP POLICY IF EXISTS "Template managers can delete template variables" ON public.template_variables;
CREATE POLICY "Template managers can delete template variables"
  ON public.template_variables
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_variables.template_id
        AND template.deleted_at IS NULL
        AND (
          private.has_permission(template.organization_id, 'templates.delete')
          OR private.has_permission(template.organization_id, 'templates.update')
        )
    )
  );

-- 4. Fix DELETE policy on public.template_elements to allow template update workflows
DROP POLICY IF EXISTS "Template managers can delete template elements" ON public.template_elements;
CREATE POLICY "Template managers can delete template elements"
  ON public.template_elements
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.templates AS template
      WHERE template.id = template_elements.template_id
        AND template.deleted_at IS NULL
        AND (
          private.has_permission(template.organization_id, 'templates.delete')
          OR private.has_permission(template.organization_id, 'templates.update')
        )
    )
  );
