import { CreateCampaignForm } from "./create-campaign-form"

export const metadata = {
  title: "New Campaign | De-Marco Studio",
}

export default function NewCampaignPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Create Campaign</h1>
        <p className="text-on-surface-variant mt-1">Start a new marketing campaign to organize your assets.</p>
      </div>

      <div className="clay-surface rounded-2xl p-6 border border-outline-variant/30">
        <CreateCampaignForm />
      </div>
    </div>
  )
}
