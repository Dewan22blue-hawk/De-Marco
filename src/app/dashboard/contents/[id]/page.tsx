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

  const { data: calendarEvents } = await supabase
    .from("content_calendar")
    .select("id, status, platform, scheduled_at, updated_at, notes")
    .eq("content_id", contentId)
    .order("scheduled_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Edit Content</h1>
        <p className="text-on-surface-variant mt-1">Make changes to your marketing copy.</p>
      </div>

      <div className="clay-surface rounded-2xl p-6 border border-outline-variant/30">
        <EditContentForm initialData={content} />
      </div>

      {calendarEvents && calendarEvents.length > 0 && (
        <div className="clay-surface rounded-2xl p-6 border border-outline-variant/30 mt-4">
          <h2 className="text-xl font-bold tracking-tight text-on-surface mb-4">Publication History</h2>
          <div className="space-y-4">
            {calendarEvents.map((event) => (
              <div key={event.id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface capitalize">{event.platform}</span>
                    <span className="text-xs text-on-surface-variant">
                      Scheduled for: {new Date(event.scheduled_at).toLocaleString()}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    event.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                    event.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    event.status === 'queued' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {event.status}
                  </span>
                </div>
                
                {event.status === 'failed' && event.notes && (
                  <div className="mt-3 p-3 bg-red-50/50 text-red-800 rounded-lg text-sm border border-red-100">
                    <strong>Error:</strong> {event.notes}
                  </div>
                )}
                
                {event.status === 'published' && content.metadata?.published_url && (
                  <div className="mt-3 text-sm">
                    <a href={content.metadata.published_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      View Live Post ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
