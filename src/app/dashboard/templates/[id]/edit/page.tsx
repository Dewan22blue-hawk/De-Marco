import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { listTemplateCategories, getTemplate } from "../../actions"
import { TemplateFormClient } from "../../new/template-form-client"

export default async function EditTemplatePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    return <div className="text-center py-12 text-on-surface-variant">Template not found</div>
  }

  const categories = await listTemplateCategories()

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Design</p>
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Edit Template</h1>
        <p className="text-on-surface-variant text-body-md max-w-2xl">Perbarui blueprint template ini sesuai kebutuhan desain Anda.</p>
      </div>

      <TemplateFormClient categories={categories} initialData={template} />
    </div>
  )
}
