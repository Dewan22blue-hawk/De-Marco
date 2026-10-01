import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listTemplates, listTemplateCategories } from "./actions"
import { TemplateLibraryClient } from "./template-library-client"

export default async function TemplateLibraryPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    q?: string; 
    category?: string; 
    type?: string 
  }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  
  if (!profile?.default_organization_id) return <div>No organization assigned.</div>

  const params = await searchParams
  const search = params.q || ""
  const category = params.category || ""
  const type = params.type || ""

  const [templatesResult, categories] = await Promise.all([
    listTemplates({ search, category_id: category || undefined, template_type: type || undefined, limit: 50 }),
    listTemplateCategories()
  ])

  return (
    <TemplateLibraryClient 
      initialTemplates={templatesResult.data} 
      totalCount={templatesResult.count}
      categories={categories}
      search={search}
      selectedCategory={category}
      selectedType={type}
    />
  )
}