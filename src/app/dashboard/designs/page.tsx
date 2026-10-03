import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listDesigns } from "./actions"
import { DesignLibraryClient } from "./design-library-client"

export default async function DesignsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; status?: string; type?: string; sort?: string; view?: string }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) {
    return <div>No organization assigned</div>
  }

  const { q, status, type, sort, view } = await searchParams

  const [sort_by, sort_dir] = sort ? sort.split('-') : ['created_at', 'desc']

  const { data: designs, count } = await listDesigns({
    search: q,
    status: status,
    design_type: type,
    sort_by: sort_by,
    sort_dir: sort_dir as 'asc' | 'desc',
    limit: 24,
    offset: 0
  })

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Creative Studio</h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl">
          Create, view, and manage all your marketing designs here.
        </p>
      </div>

      <DesignLibraryClient 
        initialDesigns={designs} 
        totalCount={count} 
        initialView={view as 'grid' | 'list' || 'grid'} 
      />
    </div>
  )
}
