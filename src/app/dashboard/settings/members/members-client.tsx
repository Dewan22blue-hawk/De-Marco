"use client"

import { useState, useTransition } from "react"
import { inviteMember, removeMember, updateMemberRole } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertModal, AlertModalContent, AlertModalHeader, AlertModalTitle, AlertModalDescription, AlertModalFooter, AlertModalCancel, AlertModalAction } from "@/components/ui/alert-modal"

export function MembersClient({ members, organizationId, availableRoles }: { members: any[], organizationId: string, availableRoles: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  
  const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInviteError("")
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const role = formData.get("role") as string

    startTransition(async () => {
      try {
        await inviteMember(organizationId, email, role)
        setIsInviteModalOpen(false)
      } catch (err: any) {
        setInviteError(err.message || "Failed to invite member.")
      }
    })
  }

  const handleRemove = (memberId: string) => {
    setRemovingMemberId(memberId)
  }

  const confirmRemove = () => {
    if (!removingMemberId) return
    const id = removingMemberId
    setRemovingMemberId(null)
    startTransition(async () => {
      try {
        await removeMember(organizationId, id)
      } catch (err: any) {
        setActionError(err.message || "Failed to remove member.")
      }
    })
  }

  const handleRoleChange = (memberId: string, roleId: string) => {
    startTransition(async () => {
      try {
        await updateMemberRole(organizationId, memberId, roleId)
      } catch (err: any) {
        setActionError(err.message || "Failed to update role.")
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface">Members & Roles</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage your team members and their access levels.
          </p>
        </div>
        <Button 
          onClick={() => setIsInviteModalOpen(true)}
          variant="default"
          className="font-semibold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Invite Member
        </Button>
      </div>

      <div className="border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm bg-surface">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30 text-label-code-sm font-label-code-sm font-bold text-on-surface-variant">
              <th className="px-6 py-4">MEMBER</th>
              <th className="px-6 py-4">ROLE</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {members?.map((member: any) => (
              <tr key={member.id} className={`hover:bg-surface-container-low/50 transition-colors ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center text-primary font-bold text-body-lg">
                      {member.profiles?.avatar_asset_id ? (
                        <img src={member.profiles?.avatar_asset_id} alt="" className="w-full h-full object-cover" />
                      ) : (
                        member.profiles?.full_name?.charAt(0).toUpperCase() || member.profiles?.email?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-body-md font-bold text-on-surface">{member.profiles?.full_name || "Unknown"}</div>
                      <div className="text-body-sm text-on-surface-variant">{member.profiles?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    defaultValue={member.role_id} 
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="bg-surface-container-high text-on-surface-variant text-label-code-sm font-label-code-sm font-medium border border-outline-variant/20 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-outline transition-colors"
                  >
                    {availableRoles.map(r => (
                      <option key={r.id} value={r.id}>{r.display_name || r.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  {member.status === 'active' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-label-code-sm text-label-code-sm font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  ) : (
                    <span className="text-outline font-label-code-sm text-label-code-sm font-semibold">{member.status}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleRemove(member.id)}
                    className="p-2 rounded-xl text-outline hover:text-error hover:bg-error/10 transition-colors"
                    title="Remove Member"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_remove</span>
                  </button>
                </td>
              </tr>
            ))}
            {(!members || members.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant text-body-md">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-outline-variant/20 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <h3 className="text-headline-sm font-bold text-on-surface">Invite Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-6">
              {inviteError && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm font-medium border border-error">
                  {inviteError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-label-code-sm font-semibold text-on-surface">Email Address</label>
                <Input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="colleague@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-code-sm font-semibold text-on-surface">Role</label>
                <select 
                  name="role" 
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body-md cursor-pointer"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  variant="default"
                  isLoading={isPending}
                  className="font-semibold flex items-center gap-2 transition-all"
                >
                  {isPending ? 'Sending...' : 'Send Invite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal open={removingMemberId !== null} onOpenChange={(open) => !open && setRemovingMemberId(null)}>
        <AlertModalContent>
          <AlertModalHeader>
            <AlertModalTitle>Remove Member</AlertModalTitle>
            <AlertModalDescription>
              Are you sure you want to remove this member? They will lose access to this organization.
            </AlertModalDescription>
          </AlertModalHeader>
          <AlertModalFooter>
            <AlertModalCancel>Cancel</AlertModalCancel>
            <AlertModalAction className="bg-red-600 hover:bg-red-700" onClick={confirmRemove}>
              Remove
            </AlertModalAction>
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>

      <AlertModal open={actionError !== null} onOpenChange={(open) => !open && setActionError(null)}>
        <AlertModalContent>
          <AlertModalHeader>
            <AlertModalTitle>Action Failed</AlertModalTitle>
            <AlertModalDescription>{actionError}</AlertModalDescription>
          </AlertModalHeader>
          <AlertModalFooter>
            <AlertModalAction onClick={() => setActionError(null)}>OK</AlertModalAction>
          </AlertModalFooter>
        </AlertModalContent>
      </AlertModal>
    </>
  )
}
