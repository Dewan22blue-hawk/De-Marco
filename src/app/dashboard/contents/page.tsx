import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContentLibraryClient } from "./content-library-client"
import { listContents } from "./actions"

export const metadata = {
  title: "Content Library | De-Marco Studio",
}

export default async function ContentsPage(props: {
  searchParams?: Promise<{ q?: string; status?: string; platform?: string; sort?: string; view?: string; page?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const statusFilter = searchParams?.status || "";
  const platformFilter = searchParams?.platform || "";
  const sort = searchParams?.sort || "newest";
  const view = searchParams?.view || "grid";
  const page = Number(searchParams?.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) return <div>No organization assigned.</div>

  // Fetch contents
  const { data: contents, count } = await listContents({
    search: query,
    limit,
    offset
  });

  return (
    <ContentLibraryClient 
      initialContents={contents || []} 
      totalCount={count || 0}
      search={query}
      selectedStatus={statusFilter}
      selectedPlatform={platformFilter}
      selectedSort={sort}
      selectedView={view}
      limit={limit}
    />
  )
}
