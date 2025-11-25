import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addMemberToWorkspace, removeMemberFromWorkspace } from '@/app/actions'
import type { User as PrismaUser } from '@prisma/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'

interface MemberListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  members: PrismaUser[]
  currentUser: SupabaseUser
  adminId: string
}

export function MemberListDialog({
  open,
  onOpenChange,
  workspaceId,
  members,
  currentUser,
  adminId,
}: MemberListDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const isCurrentUserAdmin = currentUser.id === adminId

  const handleAddMember = () => {
    if (!email) {
      toast.error('Email cannot be empty.')
      return
    }

    const promise = addMemberToWorkspace({ workspaceId, email }).then((res) => {
      if (res.status === 'error') {
        throw new Error(res.message)
      }
      return res.data
    })

    startTransition(() => {
      toast.promise(promise, {
        loading: 'Adding member...',
        success: (data) => {
          setEmail('')
          return data
        },
        error: (err) => err.message || 'Failed to add member.',
      })
    })
  }

  const handleRemoveMember = (userId: string) => {
    const promise = removeMemberFromWorkspace({ workspaceId, userId }).then(
      (res) => {
        if (res.status === 'error') {
          throw new Error(res.message)
        }
        return res.data
      }
    )

    startTransition(() => {
      toast.promise(promise, {
        loading: 'Removing member...',
        success: (data) => data,
        error: (err) => err.message || 'Failed to remove member.',
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-dashboard-background border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            Add or remove members from this workspace.
          </DialogDescription>
        </DialogHeader>

        {/* Add Member Form */}
        <div className="mt-4 flex items-center gap-2">
          <Input
            type="email"
            placeholder="member@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-900 border-slate-700"
            disabled={isPending}
          />
          <Button
            type="submit"
            onClick={handleAddMember}
            disabled={isPending}
            className="bg-dashboard-primary hover:bg-dashboard-primary/90"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Member List */}
        <div className="mt-6 space-y-4 max-h-80 overflow-y-auto">
          {members.map((member) => {
            const canRemove = (isCurrentUserAdmin && member.supabaseId !== adminId) || (member.supabaseId === currentUser.id && member.supabaseId !== adminId);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-slate-700">
                      {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name || 'No Name'}</p>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>
                </div>
                {canRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.supabaseId)}
                    disabled={isPending}
                    className="text-red-500 hover:text-red-400"
                  >
                    <TrashIcon />
                  </Button>
                )}
                {member.supabaseId === adminId && (
                    <span className="text-xs text-slate-500">Admin</span>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
