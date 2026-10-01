"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { name: "Organization", href: "/dashboard/settings/organization", icon: "domain" },
  { name: "Brand Kit", href: "/dashboard/settings/brand", icon: "palette" },
  { name: "Members & Roles", href: "/dashboard/settings/members", icon: "group" },
  { name: "Personal Profile", href: "/dashboard/settings/profile", icon: "person" },
]

export function SettingsTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1.5 p-2 bg-surface-container-low rounded-3xl border border-outline-variant/30">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-body-md text-body-md ${
              isActive
                ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {tab.icon}
            </span>
            <span>{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
