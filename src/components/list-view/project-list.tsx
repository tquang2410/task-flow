// @/components/list-view/project-list.tsx
/**
 * File: src/components/list-view/project-list.tsx
 *
 * Chức năng:
 * - Đây là một Server Component chịu trách nhiệm lấy dữ liệu cho trang danh sách task của một dự án.
 * - Component này lấy `projectId` làm prop, sau đó sử dụng `createClient` (Supabase) và `db` (Prisma)
 *   để truy vấn thông tin chi tiết của dự án, bao gồm tất cả các task liên quan.
 * - Logic fetch dữ liệu được thiết kế để lấy đầy đủ thông tin cần thiết cho bảng (như `assignee`,
 *   `comments`, `attachments`) tương tự như component `ProjectBoard`.
 * - Sau khi có dữ liệu, nó sẽ render Client Component `<TaskTable />` và truyền dữ liệu task vào đó.
 * - Việc tách biệt logic fetch dữ liệu vào một Server Component giúp tối ưu hóa việc tải dữ liệu trên server,
 *   giảm lượng code JavaScript gửi về client.
 */
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { TaskTable } from './task-table'
import { type ProjectColumn } from '@/types/prisma'

interface ProjectListProps {
  projectId: string
}

export async function ProjectList({ projectId }: ProjectListProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId,
      workspace: {
        members: {
          some: {
            id: user.id,
          },
        },
      },
    },
    include: {
      tasks: {
        include: {
          assignee: true,
          reporter: true,
          comments: true,
          attachments: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  if (!project) {
    // This case should ideally be handled by a not-found page
    return <div className="p-4 text-red-500">Project not found or you don't have access.</div>
  }

  // The columns are stored as a JSON object, so we need to parse it.
  const columns = project.columns as unknown as ProjectColumn[];

  return <TaskTable data={project.tasks} columns={columns} />
}
