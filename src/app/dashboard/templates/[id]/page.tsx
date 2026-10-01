import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTemplate } from "../actions"
import { TemplateDetailClient } from "./template-detail-client"

export default async function TemplateDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  
  if (!profile?.default_organization_id) return <div>No organization assigned.</div>

  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    return <div className="text-center py-12 text-on-surface-variant">Template not found</div>
  }

  return <TemplateDetailClient template={template} />
}