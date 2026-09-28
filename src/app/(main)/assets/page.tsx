import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePlus, Search, Download, Trash2 } from "lucide-react"
import { AssetUploader } from "@/components/features/assets/AssetUploader"

import { createClient } from "@/lib/supabase/server"

// Format bytes to human readable string
function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default async function AssetLibraryPage() {
  const supabase = await createClient()
  
  // Ambil profil untuk melihat default tenant (organization_id)
  const { data: userData } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData?.user?.id!)
    .single()

  let assets: any[] = []
  if (profile?.default_organization_id) {
    const { data } = await supabase
      .from('assets')
      .select('*')
      .eq('organization_id', profile.default_organization_id)
      .order('created_at', { ascending: false })
    
    if (data) assets = data
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Asset Library</h1>
          <p className="text-neutral-500 mt-1">Manage and access all your marketing resources.</p>
        </div>
        <Button className="flex items-center">
          <ImagePlus size={18} className="mr-2" />
          Upload Asset
        </Button>
      </div>

      <div className="flex space-x-4 items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search assets by name or tags..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-neutral-100/50 text-sm border-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-neutral-700 placeholder:text-neutral-400"
          />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Image</Button>
          <Button variant="outline" size="sm">Logo</Button>
          <Button variant="outline" size="sm">Document</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
        {/* Upload Area Component */}
        <div className="col-span-1 group">
          <AssetUploader />
        </div>

        {/* Dynamic Real Data Asset Cards */}
        {assets.map((asset) => (
          <AssetCard 
            key={asset.id} 
            name={asset.name} 
            mime={asset.mime_type || 'unknown'} 
            size={formatBytes(asset.file_size || 0)} 
          />
        ))}

        {assets.length === 0 && (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 flex items-center justify-center p-8 border-2 border-dashed border-neutral-200 rounded-3xl h-48 bg-neutral-50">
            <p className="text-sm font-medium text-neutral-400">Belum ada aset, silakan upload file baru.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AssetCard({ name, mime, size }: { name: string, mime: string, size: string }) {
  return (
    <Card className="h-48 p-0 overflow-hidden flex flex-col relative group">
      <div className="flex-1 bg-neutral-200/50 w-full flex items-center justify-center">
        {/* Thumbnail Placeholder */}
        <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xs uppercase shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4)]">
          {mime.split('/')[1] || 'FILE'}
        </div>
      </div>
      <div className="h-16 bg-neutral-100 p-3 flex flex-col justify-center border-t border-neutral-200/60 shadow-[inset_0_4px_6px_-2px_rgba(0,0,0,0.03)]">
        <p className="text-xs font-semibold text-neutral-800 truncate">{name}</p>
        <p className="text-[10px] text-neutral-500 mt-0.5">{size} • {mime}</p>
      </div>

      {/* Hover overlay actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <button className="w-8 h-8 rounded-full bg-white/90 text-neutral-700 shadow-sm flex items-center justify-center hover:bg-white hover:text-blue-500">
          <Download size={14} />
        </button>
        <button className="w-8 h-8 rounded-full bg-white/90 text-neutral-700 shadow-sm flex items-center justify-center hover:bg-white hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  )
}
