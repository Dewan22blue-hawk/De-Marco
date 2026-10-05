import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { FileText, PlusCircle } from "lucide-react"

export const metadata = {
  title: "Campaign Details | De-Marco Studio",
}

export default async function CampaignDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const campaignId = params.id;

  const supabase = await createClient()
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      contents (*)
    `)
    .eq("id", campaignId)
    .single()

  if (error || !campaign) {
    notFound()
  }

  // Filter out soft-deleted contents
  const activeContents = (campaign.contents || []).filter((c: any) => !c.deleted_at)

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">{campaign.name}</h1>
          <p className="text-on-surface-variant mt-1 text-sm font-mono">{campaign.code}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/campaigns" className="text-sm font-medium text-on-surface-variant hover:text-on-surface">
            Back to Campaigns
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="clay-surface rounded-2xl p-6 border border-outline-variant/30">
            <h3 className="font-bold text-on-surface mb-4">Campaign Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Status</p>
                <span className="inline-block mt-1 text-xs font-medium px-2 py-1 bg-primary-container text-on-primary-container rounded-full">
                  {campaign.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Objective</p>
                <p className="text-sm text-on-surface font-medium capitalize mt-1">{campaign.objective}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Description</p>
                <p className="text-sm text-on-surface mt-1">{campaign.description || "-"}</p>
              </div>
              {campaign.start_date && (
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Start Date</p>
                  <p className="text-sm text-on-surface mt-1">{new Date(campaign.start_date).toLocaleDateString()}</p>
                </div>
              )}
              {campaign.end_date && (
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">End Date</p>
                  <p className="text-sm text-on-surface mt-1">{new Date(campaign.end_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-on-surface">Associated Contents</h3>
            <Link href={`/dashboard/contents/new?campaign_id=${campaign.id}`} className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
              <PlusCircle className="w-4 h-4" />
              Add Content
            </Link>
          </div>

          {activeContents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeContents.map((content: any) => (
                <Link href={`/dashboard/contents/${content.id}`} key={content.id} className="clay-card rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300 block">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-on-surface line-clamp-1">{content.title}</h4>
                    <span className="text-xs font-medium px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
                      {content.status}
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    {content.content_type} • {content.platform || "No platform"}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
              <p className="text-on-surface-variant mb-4">No content associated with this campaign yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
