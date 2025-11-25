'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateProjectModal } from '@/components/create-project-modal'
import { MemberListDialog } from './member-list-dialog'
import { Users } from 'lucide-react'
import type { User as PrismaUser, Workspace, Project } from '@prisma/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface WorkspaceHeaderActionsProps {
  workspace: Workspace & { members: PrismaUser[], projects: Project[] };
  currentUser: SupabaseUser;
}

export function WorkspaceHeaderActions({ workspace, currentUser }: WorkspaceHeaderActionsProps) {
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  const adminId = workspace.memberIds[0] || '';

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setIsMembersDialogOpen(true)}>
        <Users className="mr-2 h-4 w-4" />
        Members ({workspace.members.length})
      </Button>
      <CreateProjectModal workspaceId={workspace.id}>
        <Button>Tạo Project</Button>
      </CreateProjectModal>

      <MemberListDialog
        open={isMembersDialogOpen}
        onOpenChange={setIsMembersDialogOpen}
        workspaceId={workspace.id}
        members={workspace.members}
        currentUser={currentUser}
        adminId={adminId}
      />
    </div>
  )
}
