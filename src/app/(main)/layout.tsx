import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarProvider } from "@/components/layout/sidebar-provider"
import { MainContentWrapper } from "@/components/layout/main-content-wrapper"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-neutral-100 relative">
        <Sidebar />
        <MainContentWrapper className="flex-1 flex flex-col relative">
          <Topbar />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </MainContentWrapper>
      </div>
    </SidebarProvider>
  )
}
