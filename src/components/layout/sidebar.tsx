import Link from 'next/link'
import { LayoutDashboard, Megaphone, Palette, Users, FileText, Settings, Droplets, Image } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-neutral-100 dark:bg-neutral-900 flex flex-col h-screen p-4 sticky top-0 transition-all duration-300 shadow-[4px_0_15px_rgba(0,0,0,0.05)] border-r border-neutral-200 z-20">
      <div className="mb-8 px-2 flex items-center mt-2">
        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-xl shadow-[2px_2px_4px_rgba(59,130,246,0.5),_-2px_-2px_4px_rgba(255,255,255,0.9),_inset_2px_2px_4px_rgba(255,255,255,0.4)] mr-3">D</div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Deraly</h2>
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem href="/marketing" icon={<Megaphone size={20} />} label="Marketing" />
        <NavItem href="/creative" icon={<Palette size={20} />} label="Creative Studio" />
        <NavItem href="/assets" icon={<Image size={20} />} label="Asset Library" />
        <NavItem href="/documents" icon={<FileText size={20} />} label="Documents" />
        <NavItem href="/crm" icon={<Users size={20} />} label="Business Dev" />
        <NavItem href="/brand" icon={<Droplets size={20} />} label="Brand Kit" />
      </nav>
      <div className="mt-auto">
        <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" />
      </div>
    </aside>
  )
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center px-4 py-3 rounded-2xl text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900 hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),_inset_-2px_-2px_5px_rgba(255,255,255,0.5)] transition-all">
      <span className="mr-3 text-neutral-500 hover:text-neutral-900">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </Link>
  )
}
