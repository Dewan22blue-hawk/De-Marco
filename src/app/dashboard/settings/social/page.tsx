import { SocialService } from "@/lib/social"
import { SocialAccountsClient } from "./social-accounts-client"

export const metadata = {
  title: "Social Accounts | De-Marco Studio",
}

export default async function SocialAccountsPage() {
  const accounts = await SocialService.getAccounts()

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-title-lg font-title-lg font-bold text-on-surface">Social Media Integrations</h2>
        <p className="text-body-md font-body-md text-on-surface-variant mt-1 max-w-2xl">
          Connect your brand&apos;s social media accounts to enable Auto Post and scheduling.
        </p>
      </div>

      <SocialAccountsClient initialAccounts={accounts} />
    </div>
  )
}
