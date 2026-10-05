import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EditContentForm } from "./edit-content-form"

export const metadata = {
  title: "Edit Content | De-Marco Studio",
}

export default async function EditContentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const contentId = params.id;

  const supabase = await createClient()
  const { data: content, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", contentId)
    .single()

  if (error || !content) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Edit Content</h1>
        <p className="text-on-surface-variant mt-1">Make changes to your marketing copy.</p>
      </div>

      <div className="clay-surface rounded-2xl p-6 border border-outline-variant/30">
        <EditContentForm initialData={content} />
      </div>
    </div>
  )
}
