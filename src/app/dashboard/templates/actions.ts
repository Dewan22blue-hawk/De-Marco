"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { templateSchema, type TemplateWithRelations, type TemplateVariable, type TemplateElement } from "@/schemas/template"
import { createAuditLog } from "@/lib/audit"

export async function listTemplates(options?: {
  category_id?: string
  template_type?: string
  search?: string
  limit?: number
  offset?: number
  include_relations?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) {
    throw new Error("No active organization found for user.")
  }

  let query = supabase
    .from('templates')
    .select(`
      *,
      category:template_categories(name, slug),
      thumbnail:assets!thumbnail_asset_id(storage_path, storage_bucket),
      background:assets!background_asset_id(storage_path, storage_bucket)
    `, { count: 'exact' })
    .eq('organization_id', profile.default_organization_id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (options?.category_id) {
    query = query.eq('category_id', options.category_id)
  }
  if (options?.template_type) {
    query = query.eq('template_type', options.template_type)
  }
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error, count } = await query

  if (error) throw error

  // If relations requested, fetch variables and elements for each template
  if (options?.include_relations && data) {
    const templateIds = data.map(t => t.id)
    const [{ data: variables }, { data: elements }] = await Promise.all([
      supabase.from('template_variables').select('*').in('template_id', templateIds).order('sort_order'),
      supabase.from('template_elements').select('*').in('template_id', templateIds).order('z_index')
    ])
    
    const variablesByTemplate = (variables || []).reduce((acc, v) => {
      (acc[v.template_id] = acc[v.template_id] || []).push(v)
      return acc
    }, {} as Record<string, Array<Record<string, unknown>>>)
    
    const elementsByTemplate = (elements || []).reduce((acc, e) => {
      (acc[e.template_id] = acc[e.template_id] || []).push(e)
      return acc
    }, {} as Record<string, Array<Record<string, unknown>>>)

    const enriched = data.map(t => ({
      ...t,
      template_variables: variablesByTemplate[t.id] || [],
      template_elements: elementsByTemplate[t.id] || []
    }))
    
    return { data: enriched, count: count || 0 }
  }

  return { data: data || [], count: count || 0 }
}

export async function getTemplate(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) throw new Error("No organization")

  const { data: template, error } = await supabase
    .from('templates')
    .select(`
      *,
      category:template_categories(name, slug),
      thumbnail:assets!thumbnail_asset_id(storage_path, storage_bucket),
      background:assets!background_asset_id(storage_path, storage_bucket)
    `)
    .eq('id', templateId)
    .eq('organization_id', profile.default_organization_id)
    .single()

  if (error?.code === "PGRST116") return null
  if (error) throw error

  // Fetch variables and elements
  const [{ data: variables }, { data: elements }] = await Promise.all([
    supabase.from('template_variables').select('*').eq('template_id', templateId).order('sort_order'),
    supabase.from('template_elements').select('*').eq('template_id', templateId).order('z_index')
  ])

  return {
    ...template,
    template_variables: variables || [],
    template_elements: elements || []
  } as TemplateWithRelations
}

export async function createTemplate(data: Record<string, unknown>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) throw new Error("No organization")

  const variables = Array.isArray(data.variables) ? (data.variables as TemplateVariable[]) : undefined
  const elements = Array.isArray(data.elements) ? (data.elements as TemplateElement[]) : undefined

  const validated = templateSchema.parse({
    ...data,
    variables,
    elements,
    organization_id: profile.default_organization_id,
  })

  const { variables: parsedVariables, elements: parsedElements, ...templateData } = validated

  const { data: template, error } = await supabase
    .from('templates')
    .insert({
      ...templateData,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  // Create template version 1
  await supabase.from('template_versions').insert({
    template_id: template.id,
    version: 1,
    change_note: "Initial version",
    schema_snapshot: { variables: parsedVariables || [], elements: parsedElements || [] },
    created_by: user.id,
  })

  // Insert variables
  if (parsedVariables && parsedVariables.length > 0) {
    const { error: varError } = await supabase
      .from('template_variables')
      .insert(parsedVariables.map((v: TemplateVariable, i: number) => ({
        ...v,
        template_id: template.id,
        sort_order: v.sort_order ?? i,
      })))
    if (varError) console.error("Variables insert error:", varError)
  }

  // Insert elements
  if (parsedElements && parsedElements.length > 0) {
    const { error: elemError } = await supabase
      .from('template_elements')
      .insert(parsedElements.map((e: TemplateElement) => ({
        ...e,
        template_id: template.id,
      })))
    if (elemError) console.error("Elements insert error:", elemError)
  }

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "templates",
    record_id: template.id,
    action: "create",
    new_data: template
  })

  revalidatePath("/dashboard/templates")
  return { success: true, data: template }
}

export async function updateTemplate(templateId: string, data: Record<string, unknown>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) throw new Error("No organization")

  const { data: oldTemplate } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('organization_id', profile.default_organization_id)
    .single()

  const variables = Array.isArray(data.variables) ? (data.variables as TemplateVariable[]) : undefined
  const elements = Array.isArray(data.elements) ? (data.elements as TemplateElement[]) : undefined
  const templateData = { ...data }
  delete templateData.variables
  delete templateData.elements

  const { data: template, error } = await supabase
    .from('templates')
    .update({
      ...templateData,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', templateId)
    .eq('organization_id', profile.default_organization_id)
    .select()
    .single()

  if (error) throw error

  // Update variables (delete and re-insert for simplicity)
  if (variables) {
    await supabase.from('template_variables').delete().eq('template_id', templateId)
    if (variables.length > 0) {
      await supabase.from('template_variables').insert(
        variables.map((v: TemplateVariable, i: number) => ({
          ...v,
          template_id: templateId,
          sort_order: v.sort_order ?? i,
        }))
      )
    }
  }

  // Update elements
  if (elements) {
    await supabase.from('template_elements').delete().eq('template_id', templateId)
    if (elements.length > 0) {
      await supabase.from('template_elements').insert(
        elements.map((e: TemplateElement) => ({ ...e, template_id: templateId }))
      )
    }
    
    // Create new version
    const { data: latestVersion } = await supabase
      .from('template_versions')
      .select('version')
      .eq('template_id', templateId)
      .order('version', { ascending: false })
      .limit(1)
      .single()
    
    await supabase.from('template_versions').insert({
      template_id: templateId,
      version: (latestVersion?.version || 0) + 1,
      change_note: "Updated template",
      schema_snapshot: { variables: variables || [], elements: elements || [] },
      created_by: user.id,
    })
  }

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "templates",
    record_id: templateId,
    action: "update",
    old_data: oldTemplate,
    new_data: template
  })

  revalidatePath("/dashboard/templates")
  revalidatePath(`/dashboard/templates/${templateId}`)
  return { success: true, data: template }
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) throw new Error("No organization")

  const { data: oldTemplate } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('organization_id', profile.default_organization_id)
    .single()

  const { error } = await supabase
    .from('templates')
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', templateId)
    .eq('organization_id', profile.default_organization_id)

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "templates",
    record_id: templateId,
    action: "delete",
    old_data: oldTemplate
  })

  revalidatePath("/dashboard/templates")
  return { success: true }
}

const DEFAULT_TEMPLATE_CATEGORIES = [
  { name: "Social Media", slug: "social-media", template_type: "social_post" },
  { name: "Promotion", slug: "promotion", template_type: "flyer" },
  { name: "Event", slug: "event", template_type: "banner" },
  { name: "Corporate", slug: "corporate", template_type: "poster" },
  { name: "Product", slug: "product", template_type: "social_post" },
  { name: "Announcement", slug: "announcement", template_type: "banner" },
  { name: "Campaign", slug: "campaign", template_type: "custom" },
  { name: "Presentation", slug: "presentation", template_type: "custom" },
  { name: "Poster", slug: "poster", template_type: "poster" },
  { name: "Flyer", slug: "flyer", template_type: "flyer" },
] as const

export async function cloneTemplate(templateId: string, preferredName?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) throw new Error("No organization")

  const template = await getTemplate(templateId)
  if (!template) throw new Error("Template not found")

  const { data: variables } = await supabase
    .from('template_variables')
    .select('*')
    .eq('template_id', templateId)
    .order('sort_order', { ascending: true })

  const { data: elements } = await supabase
    .from('template_elements')
    .select('*')
    .eq('template_id', templateId)
    .order('z_index', { ascending: true })

  const nextCode = `${(template.code || 'template').trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/-+/g, '-') || 'template'}-copy-${Date.now().toString().slice(-6)}`
  const nextName = preferredName?.trim() || `${template.name} - Copy`

  const { data: duplicatedTemplate, error: templateError } = await supabase
    .from('templates')
    .insert({
      organization_id: profile.default_organization_id,
      category_id: template.category_id,
      brand_id: template.brand_id,
      name: nextName,
      code: nextCode,
      description: template.description,
      template_type: template.template_type,
      format_code: template.format_code,
      width: template.width,
      height: template.height,
      unit: template.unit,
      thumbnail_asset_id: template.thumbnail_asset_id,
      background_asset_id: template.background_asset_id,
      is_system: false,
      is_active: true,
      current_version: 1,
      usage_count: 0,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single()

  if (templateError) throw templateError

  const variableMap = new Map<string, string>()

  if (variables && variables.length > 0) {
    const insertedVariables = await supabase
      .from('template_variables')
      .insert(
        variables.map((variable: TemplateVariable) => ({
          template_id: duplicatedTemplate.id,
          variable_key: variable.variable_key,
          label: variable.label,
          variable_type: variable.variable_type,
          default_value: variable.default_value,
          placeholder: variable.placeholder,
          is_required: variable.is_required,
          max_length: variable.max_length,
          sort_order: variable.sort_order,
          validation_rules: variable.validation_rules || {},
        }))
      )
      .select()

    if (insertedVariables.data) {
      insertedVariables.data.forEach((variable: Record<string, unknown>, index: number) => {
        const sourceVariable = variables[index]
        const variableId = typeof variable.id === 'string' ? variable.id : null
        if (sourceVariable && variableId) {
          variableMap.set(sourceVariable.id, variableId)
        }
      })
    }
  }

  if (elements && elements.length > 0) {
    await supabase
      .from('template_elements')
      .insert(
        elements.map((element: TemplateElement) => ({
          template_id: duplicatedTemplate.id,
          parent_id: element.parent_id,
          element_type: element.element_type,
          role: element.role,
          variable_id: element.variable_id ? variableMap.get(element.variable_id) ?? null : null,
          asset_id: element.asset_id,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          rotation: element.rotation,
          opacity: element.opacity,
          z_index: element.z_index,
          visible: element.visible,
          locked: element.locked,
          content: element.content,
          style: element.style || {},
          metadata: element.metadata || {},
        }))
      )
  }

  await supabase.from('template_versions').insert({
    template_id: duplicatedTemplate.id,
    version: 1,
    change_note: 'Duplicated from template',
    schema_snapshot: {
      variables: variables || [],
      elements: elements || [],
    },
    created_by: user.id,
  })

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: 'templates',
    record_id: duplicatedTemplate.id,
    action: 'create',
    new_data: duplicatedTemplate,
  })

  revalidatePath('/dashboard/templates')
  return { success: true, data: duplicatedTemplate }
}

export async function archiveTemplate(templateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) throw new Error("No organization")

  const { data: oldTemplate } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('organization_id', profile.default_organization_id)
    .single()

  const { data: archivedTemplate, error } = await supabase
    .from('templates')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', templateId)
    .eq('organization_id', profile.default_organization_id)
    .select()
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: 'templates',
    record_id: templateId,
    action: 'update',
    old_data: oldTemplate,
    new_data: archivedTemplate,
  })

  revalidatePath('/dashboard/templates')
  return { success: true, data: archivedTemplate }
}

export async function createTemplateFromForm(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) throw new Error("No organization")

  const payload = {
    name: String(formData.get('name') || '').trim(),
    code: String(formData.get('code') || '').trim(),
    description: String(formData.get('description') || '').trim() || null,
    category_id: String(formData.get('category_id') || '') || null,
    template_type: String(formData.get('template_type') || 'custom') as 'flyer' | 'poster' | 'banner' | 'social_post' | 'social_story' | 'custom',
    format_code: String(formData.get('format_code') || 'custom'),
    width: Number(formData.get('width') || 1080),
    height: Number(formData.get('height') || 1080),
    unit: String(formData.get('unit') || 'px'),
    is_active: true,
    variables: [],
    elements: [],
    organization_id: profile.default_organization_id,
  }

  const result = await createTemplate(payload)
  if (!result.success || !result.data) throw new Error('Failed to create template')

  revalidatePath('/dashboard/templates')
  redirect('/dashboard/templates')
}

export async function listTemplateCategories(templateType?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.default_organization_id) throw new Error("No organization")

  let query = supabase
    .from('template_categories')
    .select('*')
    .eq('organization_id', profile.default_organization_id)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (templateType) {
    query = query.eq('template_type', templateType)
  }

  const { data, error } = await query
  if (error) throw error

  if ((data || []).length === 0) {
    const defaults = DEFAULT_TEMPLATE_CATEGORIES.map((item, index) => ({
      organization_id: profile.default_organization_id,
      name: item.name,
      slug: item.slug,
      template_type: item.template_type,
      description: `${item.name} templates`,
      icon: 'layout-template',
      sort_order: index,
      is_system: true,
    }))

    // Use Service Role to bypass RLS on online Supabase for system data seeding
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: insertError } = await adminSupabase
      .from('template_categories')
      .insert(defaults)

    if (insertError) {
      console.error('Failed to seed template categories (RLS or Admin Key issue):', insertError)
    }

    let retryQuery = supabase
      .from('template_categories')
      .select('*')
      .eq('organization_id', profile.default_organization_id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      
    if (templateType) {
      retryQuery = retryQuery.eq('template_type', templateType)
    }

    const { data: seededData, error: seededError } = await retryQuery
    if (seededError) throw seededError
    return seededData || []
  }

  return data || []
}