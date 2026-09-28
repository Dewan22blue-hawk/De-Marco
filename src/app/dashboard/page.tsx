import { Card } from "@/components/ui/card"
import { Megaphone, Map, FileCode, Users } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Good morning!</h1>
        <p className="text-neutral-500 mt-1">Here is the overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard title="Active Campaigns" value="12" icon={<Megaphone className="text-blue-500" size={24} />} />
        <DashboardStatCard title="Designs Created" value="148" icon={<FileCode className="text-purple-500" size={24} />} />
        <DashboardStatCard title="Total Leads" value="45" icon={<Users className="text-orange-500" size={24} />} />
        <DashboardStatCard title="Proposals Sent" value="8" icon={<Map className="text-emerald-500" size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 h-[400px] flex flex-col">
          <h3 className="font-semibold text-lg text-neutral-800">Recent Activities</h3>
          <div className="flex-1 flex items-center justify-center text-neutral-400">
            Activity stream will be available soon.
          </div>
        </Card>
        
        <Card className="h-[400px] flex flex-col">
          <h3 className="font-semibold text-lg text-neutral-800">Quick Actions</h3>
          <div className="mt-4 flex flex-col space-y-3">
             <button className="flex items-center text-left px-4 py-3 bg-neutral-100 rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),_inset_-2px_-2px_5px_rgba(255,255,255,0.8)] hover:shadow-clay transition-all duration-300">
               <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3"><FileCode size={16}/></span>
               <span className="font-medium text-sm text-neutral-700">Create new Design</span>
             </button>
             <button className="flex items-center text-left px-4 py-3 bg-neutral-100 rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),_inset_-2px_-2px_5px_rgba(255,255,255,0.8)] hover:shadow-clay transition-all duration-300">
               <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3"><Users size={16}/></span>
               <span className="font-medium text-sm text-neutral-700">Add new Lead</span>
             </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function DashboardStatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-3xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  )
}
