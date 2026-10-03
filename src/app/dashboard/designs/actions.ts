"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"
import { getTemplate } from "@/app/dashboard/templates/actions"

export async function listDesigns(opts?: { 
  search?: string; 
  status?: string; 
  design_type?: string; 
  sort_by?: string; 
  sort_dir?: 'asc'|'desc'; 
  limit?: number; 
  offset?: number 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  let query = supabase
    .from("designs")
    .select(`
      *,
      preview_asset:assets!preview_asset_id(*),
      source_template:templates!source_template_id(id, name)
    `, { count: "exact" })
    .eq("organization_id", profile.default_organization_id)
    .is("deleted_at", null)

  if (opts?.search) {
    query = query.ilike("name", `%${opts.search}%`)
  }

  if (opts?.status && opts.status !== "all") {
    query = query.eq("status", opts.status)
  } else {
    // If no status is specified, default to non-archived
    query = query.neq("status", "archived")
  }

  if (opts?.design_type && opts.design_type !== "all") {
    query = query.eq("design_type", opts.design_type)
  }

  const limit = opts?.limit || 24
  const offset = opts?.offset || 0

  if (opts?.sort_by) {
    query = query.order(opts.sort_by, { ascending: opts.sort_dir === 'asc' })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error("Error fetching designs:", error)
    return { data: [], count: 0 }
  }

  return { data, count: count || 0 }
}

export async function getDesign(designId: string) {
  const supabase = await createClient()
  
  const { data: design, error } = await supabase
    .from("designs")
    .select(`
      *,
      design_elements(*, asset:assets(*)),
      source_template:templates!source_template_id(id, name, width, height, unit),
      preview_asset:assets!preview_asset_id(*)
    `)
    .eq("id", designId)
    .maybeSingle()

  if (error) {
    console.error("Error fetching design:", error)
    return null
  }

  return design
}

export async function createDesignFromTemplate(payload: { templateId: string; name: string; variableValues?: Record<string, unknown> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) throw new Error("No organization assigned")

  // Fetch source template
  const template = await getTemplate(payload.templateId)
  if (!template) throw new Error("Template not found")

  // Insert Design
  const { data: design, error: designError } = await supabase
    .from("designs")
    .insert({
      organization_id: profile.default_organization_id,
      source_template_id: template.id,
      source_template_version: template.current_version,
      brand_id: template.brand_id,
      name: payload.name,
      design_type: template.template_type,
      format_code: template.format_code,
      width: template.width,
      height: template.height,
      unit: template.unit,
      status: "draft",
      created_by: user.id
    })
    .select()
    .single()

  if (designError) throw designError

  // Map elements and override content based on variables
  const elementsToInsert = template.template_elements.map((el: any) => {
    const newEl = {
      design_id: design.id,
      source_template_element_id: el.id,
      element_type: el.element_type,
      asset_id: el.asset_id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation,
      opacity: el.opacity,
      z_index: el.z_index,
      visible: el.visible,
      locked: el.locked,
      content: el.content || {},
      style: el.style || {},
      metadata: el.metadata || {}
    }

    // Replace variable values if there's a match
    if (el.variable_id && payload.variableValues && payload.variableValues[el.variable_id] !== undefined) {
      const variableValue = payload.variableValues[el.variable_id];
      const variableDef = template.template_variables.find((v: any) => v.id === el.variable_id);
      
      if (variableDef?.variable_type === 'image') {
        newEl.asset_id = variableValue as string;
      } else {
        newEl.content = { ...newEl.content, text: variableValue };
      }
    }

    return newEl;
  });

  if (elementsToInsert.length > 0) {
    const { error: elementsError } = await supabase.from("design_elements").insert(elementsToInsert)
    if (elementsError) console.error("Error inserting design elements:", elementsError)
  }

  // Insert Design Version
  const { error: versionError } = await supabase
    .from("design_versions")
    .insert({
      design_id: design.id,
      version: 1,
      snapshot: { template_snapshot: template, variableValues: payload.variableValues },
      created_by: user.id
    })

  if (versionError) console.error("Error inserting design version:", versionError)

  // Increment template usage count (Service Role required if RLS blocks, but normally we can just call RPC or direct update if allowed)
  await supabase.from("templates").update({ usage_count: (template.usage_count || 0) + 1 }).eq("id", template.id)

  await createAuditLog({
    organization_id: profile.default_organization_id,
    table_name: "designs",
    record_id: design.id,
    action: "create",
    new_data: design
  })

  revalidatePath("/dashboard/designs")
  return { success: true, design }
}

export async function archiveDesign(designId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: design, error } = await supabase
    .from("designs")
    .update({ status: "archived", updated_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", designId)
    .select("organization_id")
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: design.organization_id,
    table_name: "designs",
    record_id: designId,
    action: "update",
    new_data: { status: "archived" }
  })

  revalidatePath("/dashboard/designs")
  return { success: true }
}

export async function deleteDesign(designId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: design, error } = await supabase
    .from("designs")
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", designId)
    .select("organization_id")
    .single()

  if (error) throw error

  await createAuditLog({
    organization_id: design.organization_id,
    table_name: "designs",
    record_id: designId,
    action: "delete",
    old_data: { id: designId }
  })

  revalidatePath("/dashboard/designs")
  return { success: true }
}

export async function duplicateDesign(designId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const sourceDesign = await getDesign(designId)
  if (!sourceDesign) throw new Error("Design not found")

  const { data: design, error: designError } = await supabase
    .from("designs")
    .insert({
      organization_id: sourceDesign.organization_id,
      source_template_id: sourceDesign.source_template_id,
      source_template_version: sourceDesign.source_template_version,
      brand_id: sourceDesign.brand_id,
      name: `${sourceDesign.name} (Copy)`,
      design_type: sourceDesign.design_type,
      format_code: sourceDesign.format_code,
      width: sourceDesign.width,
      height: sourceDesign.height,
      unit: sourceDesign.unit,
      status: "draft",
      created_by: user.id
    })
    .select()
    .single()

  if (designError) throw designError

  const elementsToInsert = sourceDesign.design_elements.map((el: any) => ({
    design_id: design.id,
    source_template_element_id: el.source_template_element_id,
    element_type: el.element_type,
    asset_id: el.asset_id,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    opacity: el.opacity,
    z_index: el.z_index,
    visible: el.visible,
    locked: el.locked,
    content: el.content,
    style: el.style,
    metadata: el.metadata
  }))

  if (elementsToInsert.length > 0) {
    await supabase.from("design_elements").insert(elementsToInsert)
  }

  await createAuditLog({
    organization_id: design.organization_id,
    table_name: "designs",
    record_id: design.id,
    action: "create",
    new_data: design
  })

  revalidatePath("/dashboard/designs")
  return { success: true, design }
}

export async function updateDesignElements(designId: string, elements: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const sourceDesign = await getDesign(designId)
  if (!sourceDesign) throw new Error("Design not found")

  // Delete all existing elements for this design and insert the new state
  const { error: deleteError } = await supabase
    .from("design_elements")
    .delete()
    .eq("design_id", designId)

  if (deleteError) throw deleteError

  const elementsToInsert = elements.map(el => ({
    design_id: designId,
    parent_id: el.parent_id || null,
    source_template_element_id: el.source_template_element_id || null,
    element_type: el.element_type,
    asset_id: el.asset_id,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    opacity: el.opacity,
    z_index: el.z_index,
    visible: el.visible,
    locked: el.locked,
    content: el.content || {},
    style: el.style || {},
    metadata: el.metadata || {}
  }))

  if (elementsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("design_elements")
      .insert(elementsToInsert)
      
    if (insertError) throw insertError
  }

  // Get current max version
  const { data: versionData } = await supabase
    .from("design_versions")
    .select("version")
    .eq("design_id", designId)
    .order("version", { ascending: false })
    .limit(1)

  const nextVersion = versionData && versionData.length > 0 ? (versionData[0].version || 0) + 1 : 1

  // Insert Design Version
  const { error: versionError } = await supabase
    .from("design_versions")
    .insert({
      design_id: designId,
      version: nextVersion,
      snapshot: { elements: elementsToInsert },
      created_by: user.id
    })

  if (versionError) {
    console.error("Error inserting design version:", versionError)
    throw versionError
  }

  // Update design current_version
  await supabase
    .from("designs")
    .update({ 
      current_version: nextVersion,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", designId)

  await createAuditLog({
    organization_id: sourceDesign.organization_id,
    table_name: "designs",
    record_id: designId,
    action: "update",
    new_data: { elements_count: elementsToInsert.length }
  })

  revalidatePath(`/dashboard/designs/${designId}`)
  return { success: true }
}
