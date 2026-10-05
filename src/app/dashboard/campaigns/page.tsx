import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CampaignLibraryClient } from "./campaign-library-client"
import { listCampaigns } from "./actions"

export const metadata = {
  title: "Campaigns | De-Marco Studio",
}

export default async function CampaignsPage(props: {
  searchParams?: Promise<{ q?: string; status?: string; sort?: string; view?: string; page?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const statusFilter = searchParams?.status || "";
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

  // Fetch campaigns
  const { data: campaigns, count } = await listCampaigns({
    search: query,
    // Add additional filters to the server action as needed later
    limit,
    offset
  });

  return (
    <CampaignLibraryClient 
      initialCampaigns={campaigns || []} 
      totalCount={count || 0}
      search={query}
      selectedStatus={statusFilter}
      selectedSort={sort}
      selectedView={view}
      limit={limit}
    />
  )
}
