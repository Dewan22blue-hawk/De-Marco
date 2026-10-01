import { ReactNode } from "react"
import { SettingsTabs } from "./settings-tabs"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">Settings</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant">Manage your organization, brand identity, and team members.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-72 shrink-0">
          <SettingsTabs />
        </aside>
        
        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
