import { listCalendarEvents } from "./actions"
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react"
import Link from "next/link"
import { CalendarGridClient } from "./calendar-grid-client"

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
        <CalendarGridClient events={events} />
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
