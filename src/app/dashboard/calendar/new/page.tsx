import { CreateCalendarEventForm } from "./create-calendar-event-form"
import { listContents } from "@/app/dashboard/contents/actions"
import { listCampaigns } from "@/app/dashboard/campaigns/actions"

export const metadata = {
  title: "Schedule Content | De-Marco Studio",
}

export default async function NewCalendarEventPage() {
  const { data: contents } = await listContents({ limit: 100 })
  const { data: campaigns } = await listCampaigns({ limit: 100 })

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Schedule Content</h1>
        <p className="text-on-surface-variant mt-1">Schedule an existing content to be published.</p>
      </div>

      <div className="clay-surface rounded-2xl p-6 border border-outline-variant/30">
        <CreateCalendarEventForm contents={contents || []} campaigns={campaigns || []} />
      </div>
    </div>
  )
}
