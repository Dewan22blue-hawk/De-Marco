import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfile, logout } from "./actions"
import { createClient } from "@/lib/supabase/server"

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Mengambil data user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id!)
    .single()

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Account Settings</h1>
        <p className="text-neutral-500 mt-1">Manage your profile, preferences, and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="col-span-1">
          <h2 className="text-lg font-semibold text-neutral-900">Personal Information</h2>
          <p className="text-sm text-neutral-500 mt-1">Update your basic profile information and email address.</p>
        </div>
        <Card className="col-span-2 p-6 bg-white/50">
          <form className="space-y-4" action={updateProfile}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700" htmlFor="full_name">Full Name</label>
              <Input id="full_name" name="full_name" type="text" defaultValue={profile?.full_name || ''} required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700" htmlFor="email">Email Address <span className="text-neutral-400 text-xs font-normal">(Read only)</span></label>
              <Input id="email" type="email" defaultValue={profile?.email || ''} disabled className="opacity-70 bg-neutral-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700" htmlFor="bio">Bio</label>
              <textarea 
                id="bio" 
                name="bio" 
                rows={3} 
                defaultValue={profile?.bio || ''}
                className="w-full p-3 rounded-xl bg-neutral-100/50 text-sm border-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-neutral-700"
                placeholder="A short description about yourself..."
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="border-t border-neutral-200 my-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <h2 className="text-lg font-semibold text-neutral-900">Account Access</h2>
          <p className="text-sm text-neutral-500 mt-1">Control your active sessions or sign out from this device.</p>
        </div>
        <Card className="col-span-2 p-6 flex items-center justify-between bg-white/50">
          <div>
            <h3 className="font-medium text-neutral-800">Sign Out</h3>
            <p className="text-sm text-neutral-500 mt-1">You will be securely logged out from the platform.</p>
          </div>
          <form action={logout}>
            <Button type="submit" className="bg-red-50 text-red-600 hover:bg-red-100 shadow-[4px_4px_8px_rgba(0,0,0,0.05),_-4px_-4px_8px_rgba(255,255,255,0.8),_inset_2px_2px_4px_rgba(255,255,255,0.4)]">
              Sign Out Now
            </Button>
          </form>
        </Card>
      </div>

    </div>
  )
}
