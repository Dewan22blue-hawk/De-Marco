import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarProvider } from "@/components/layout/sidebar-provider"
import { MainContentWrapper } from "@/components/layout/main-content-wrapper"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative">
        <Sidebar />
        <MainContentWrapper className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-4 md:p-8 space-y-8 flex-1 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </MainContentWrapper>
      </div>
    </SidebarProvider>
  )
}
