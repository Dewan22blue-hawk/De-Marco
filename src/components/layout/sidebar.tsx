import { SidebarClient } from "@/components/layout/sidebar-client"
import { getCurrentUserContext } from "@/lib/auth/authorization"

export async function Sidebar() {
  let context = null;
  try {
    context = await getCurrentUserContext()
  } catch (e) {
    console.warn("Sidebar auth context warning:", e)
  }

  return (
    <SidebarClient 
      organizationName={context?.organization?.name} 
      userProfile={context?.profile} 
    />
  )
}