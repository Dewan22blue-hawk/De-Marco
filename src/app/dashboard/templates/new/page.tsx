import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { listTemplateCategories } from "../actions"
import { TemplateFormClient } from "./template-form-client"

export default async function NewTemplatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const categories = await listTemplateCategories()

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Design</p>
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Create Template</h1>
        <p className="text-on-surface-variant text-body-md max-w-2xl">Buat blueprint template yang bisa dipakai ulang untuk kebutuhan marketing. Tentukan ukuran dan tipe desain.</p>
      </div>

      <TemplateFormClient categories={categories} />
    </div>
  )
}
