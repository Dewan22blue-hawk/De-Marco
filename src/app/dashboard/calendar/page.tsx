import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CalendarLibraryClient } from "./calendar-library-client"
import { listCalendarEvents } from "./actions"

export const metadata = {
  title: "Content Calendar | De-Marco Studio",
}

export default async function CalendarPage(props: {
  searchParams?: Promise<{ q?: string; status?: string; platform?: string; sort?: string; view?: string; page?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const statusFilter = searchParams?.status || "";
  const platformFilter = searchParams?.platform || "";
  const sort = searchParams?.sort || "newest";
  const view = searchParams?.view || "grid";
  const page = Number(searchParams?.page) || 1;
  const limit = 50; // Use a higher limit for calendar to ensure a full month is loaded
  // const offset = (page - 1) * limit;

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const { data: profile } = await supabase.from("profiles").select("default_organization_id").eq("id", user.id).single()
  if (!profile?.default_organization_id) return <div>No organization assigned.</div>

  // Fetch events
  const events = await listCalendarEvents();
  // `listCalendarEvents` should ideally be updated to support the offset/limit/search params,
  // but for now we pass the fetched events directly since it fetches the upcoming ones.

  return (
    <CalendarLibraryClient 
      initialEvents={events || []} 
      totalCount={events?.length || 0}
      search={query}
      selectedStatus={statusFilter}
      selectedPlatform={platformFilter}
      selectedSort={sort}
      selectedView={view}
      limit={limit}
    />
  )
}
