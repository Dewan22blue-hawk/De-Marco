import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function BrandKitPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Brand Kit</h1>
        <p className="text-neutral-500 mt-1">Configure your organization's core brand identity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h3 className="font-semibold text-lg text-neutral-800 mb-4">Brand Logo</h3>
          <div className="w-full h-40 bg-neutral-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 mb-4 text-neutral-500">
             <span>Drag & drop your logo here</span>
             <span className="text-sm">or click to browse</span>
          </div>
          <Button variant="outline" className="w-full">Upload Logo</Button>
        </Card>

        <Card>
          <h3 className="font-semibold text-lg text-neutral-800 mb-4">Brand Colors</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Primary Color</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4)]"></div>
                <Input type="text" defaultValue="#3B82F6" className="w-24 h-10 text-center" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Secondary Color</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4)]"></div>
                <Input type="text" defaultValue="#10B981" className="w-24 h-10 text-center" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Accent Color</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4)]"></div>
                <Input type="text" defaultValue="#F97316" className="w-24 h-10 text-center" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h3 className="font-semibold text-lg text-neutral-800 mb-4">Typography</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Heading Font</label>
              <select className="flex h-12 w-full rounded-2xl border-none bg-neutral-100/50 px-4 py-2 text-sm shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:outline-none transition-all">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Outfit</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Body Font</label>
              <select className="flex h-12 w-full rounded-2xl border-none bg-neutral-100/50 px-4 py-2 text-sm shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:outline-none transition-all">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Open Sans</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <Button>Save Brand Settings</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
