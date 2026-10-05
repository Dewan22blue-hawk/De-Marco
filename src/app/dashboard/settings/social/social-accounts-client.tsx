"use client"

import { useState } from "react"
import { SocialAccount } from "@/lib/social"
import { connectSocialAccountAction, deleteSocialAccountAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/ui/custom-select"
import { Share2, Trash2, Plus, AlertCircle } from "lucide-react"

export function SocialAccountsClient({ initialAccounts }: { initialAccounts: SocialAccount[] }) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [platform, setPlatform] = useState("instagram")
  const [accountName, setAccountName] = useState("")
  const [accountId, setAccountId] = useState("")
  const [accessToken, setAccessToken] = useState("")

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append("platform", platform)
      formData.append("account_name", accountName)
      formData.append("account_id", accountId)
      formData.append("access_token", accessToken)
      
      await connectSocialAccountAction(formData)
      
      // Temporary optimistic update (will be refreshed by Server Component anyway)
      setAccounts([...accounts, {
        id: "temp-" + Date.now(),
        organization_id: "temp",
        platform: platform as any,
        account_name: accountName,
        account_id: accountId,
        status: "active"
      } as SocialAccount])
      
      setAccountName("")
      setAccountId("")
      setAccessToken("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect account")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id))
    try {
      await deleteSocialAccountAction(id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
    }
  }

  return (
    <div className="space-y-8">
      <div className="clay-surface rounded-3xl p-6 border border-outline-variant/30">
        <h3 className="text-title-md font-bold mb-4 text-on-surface">Connected Accounts</h3>
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
              <Share2 size={24} />
            </div>
            <p className="text-on-surface-variant font-medium">No social accounts connected yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map(account => (
              <div key={account.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm capitalize">{account.platform}</p>
                    <p className="text-xs text-on-surface-variant">{account.account_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="p-2 rounded-xl text-error hover:bg-error/10 transition-colors"
                  title="Disconnect"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="clay-surface rounded-3xl p-6 border border-outline-variant/30">
        <h3 className="text-title-md font-bold mb-4 text-on-surface">Connect New Account</h3>
        <form onSubmit={handleConnect} className="space-y-5 max-w-lg">
          {error && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Platform</label>
            <CustomSelect 
              value={platform}
              onChange={setPlatform}
              options={[
                { value: "instagram", label: "Instagram" },
                { value: "facebook", label: "Facebook" },
                { value: "linkedin", label: "LinkedIn" },
                { value: "twitter", label: "X / Twitter" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Account Name</label>
            <Input 
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder="e.g. My Brand Page"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Account ID</label>
            <Input 
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              placeholder="Platform specific ID (e.g. FB Page ID)"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">Access Token</label>
            <Input 
              type="password"
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder="OAuth Access Token"
              required
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isConnecting} className="w-full flex items-center justify-center gap-2">
              <Plus size={18} />
              Connect Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
