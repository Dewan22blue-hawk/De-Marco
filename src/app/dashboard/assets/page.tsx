import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listAssets, listAssetCategories } from "./actions"
import { AssetLibraryClient } from "./asset-library-client"

export default async function AssetLibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; type?: string; sort?: string; view?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  
  if (!profile?.default_organization_id) return <div>No organization assigned.</div>

  const params = await searchParams
  const search = params.q || ""
  const category = params.category || ""
  const type = params.type || ""
  const sort = params.sort || "newest"
  const view = params.view || "grid"

  let sort_by = "created_at"
  let sort_dir: 'asc' | 'desc' = "desc"
  
  if (sort === "name-asc") { sort_by = "name"; sort_dir = "asc" }
  else if (sort === "size-desc") { sort_by = "file_size"; sort_dir = "desc" }
  else if (sort === "size-asc") { sort_by = "file_size"; sort_dir = "asc" }

  const limit = 24

  const [assetsResult, categories] = await Promise.all([
    listAssets({ 
      search, 
      category_id: category || undefined, 
      asset_type: type || undefined,
      sort_by,
      sort_dir,
      limit,
      offset: 0
    }),
    listAssetCategories()
  ])

  return (
    <AssetLibraryClient 
      initialAssets={assetsResult.data} 
      totalCount={assetsResult.count}
      categories={categories}
      search={search}
      selectedCategory={category}
      selectedType={type}
      selectedSort={sort}
      selectedView={view}
      organizationId={profile.default_organization_id}
      limit={limit}
    />
  )
}