import { listCalendarEvents } from "./actions"
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Content Calendar | De-Marco Studio",
}

export default async function CalendarPage() {
  const events = await listCalendarEvents();

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Content Calendar</h1>
          <p className="text-on-surface-variant mt-1">Schedule and manage your marketing content.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/calendar/new" className="clay-button-primary px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Schedule Content
          </Link>
        </div>
      </div>

      {events && events.length > 0 ? (
        <div className="flex flex-col gap-4">
          {events.map((event: any) => (
            <div key={event.id} className="clay-card rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex flex-col items-center justify-center shrink-0 shadow-inner">
                  <span className="text-xs font-bold uppercase">{new Date(event.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-black leading-none">{new Date(event.scheduled_at).getDate()}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-on-surface">{event.content?.title || 'Untitled Content'}</h3>
                  <div className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
                    <span className="capitalize">{event.platform || 'Unspecified'}</span>
                    {event.campaign && (
                      <>
                        <span>•</span>
                        <span>{event.campaign.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                 <span className="text-xs font-medium px-3 py-1 bg-surface-container text-on-surface-variant rounded-full border border-outline-variant/30">
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No scheduled content</h3>
          <p className="text-on-surface-variant max-w-md mx-auto mb-6">
            Start scheduling your contents and designs to view them on the calendar.
          </p>
          <Link href="/dashboard/calendar/new" className="clay-button-primary px-6 py-2.5 rounded-lg font-medium text-white">
            Schedule Now
          </Link>
        </div>
      )}
    </div>
  )
}
