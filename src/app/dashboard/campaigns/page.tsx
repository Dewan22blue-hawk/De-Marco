import { listCampaigns } from "./actions"
import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"
import { SearchBar } from "@/components/layout/search-bar"

export const metadata = {
  title: "Campaigns | De-Marco Studio",
}

export default async function CampaignsPage(props: {
  searchParams?: Promise<{ query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  const { data: campaigns, count } = await listCampaigns({
    search: query,
    limit,
    offset
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Campaigns</h1>
          <p className="text-on-surface-variant mt-1">Manage your marketing campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/campaigns/new" className="clay-button-primary px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Basic Search and Filters placeholder */}
      <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 clay-surface">
        <SearchBar placeholder="Search campaigns..." />
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="clay-card rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-on-surface line-clamp-1">{campaign.name}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-primary-container text-on-primary-container rounded-full">
                  {campaign.status}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant line-clamp-2">{campaign.description || "No description provided."}</p>
              <div className="text-xs text-on-surface-variant font-medium">
                {campaign.code} • {campaign.objective || "No objective"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <PlusCircle className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No campaigns found</h3>
          <p className="text-on-surface-variant max-w-md mx-auto mb-6">
            Get started by creating your first marketing campaign to organize your contents and designs.
          </p>
          <Link href="/dashboard/campaigns/new" className="clay-button-primary px-6 py-2.5 rounded-lg font-medium text-white">
            Create Campaign
          </Link>
        </div>
      )}
    </div>
  )
}
