
/**
 * File: src/components/timeline/project-timeline.tsx
 * 
 * Chức năng:
 * - Đây là Server Component chịu trách nhiệm fetch dữ liệu các task cho một project cụ thể.
 * - Sau khi có dữ liệu, nó sẽ truyền vào component client 'CustomGantt' để hiển thị.
 * - Component này được sử dụng trong trang chi tiết project (project/[id]/page.tsx) trong một Tab.
 * 
 * Logic chính:
 * - Nhận vào 'projectId' từ props.
 * - Sử dụng 'db.project.findUnique' để truy vấn project với tasks, columns, và workspace members.
 *   - Lựa chọn bao gồm cả thông tin người được giao ('assignee') để hiển thị avatar.
 *   - Sắp xếp các task theo 'order' để có thứ tự ổn định.
 *   - Lấy columns để biết cột nào là default khi tạo task mới.
 *   - Lấy workspace members để assign tasks (vì members thuộc workspace, không phải project).
 * - Dữ liệu sau khi fetch sẽ được truyền vào props của component 'CustomGantt'.
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { CustomGantt } from './custom-gantt'

interface ProjectTimelineProps {
    projectId: string;
}

export async function ProjectTimeline({ projectId }: ProjectTimelineProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth')

    // Fetch current user from Prisma
    const appUser = await db.user.findUnique({
        where: { supabaseId: user.id }
    })

    if (!appUser) return redirect('/auth')

    // Fetch dữ liệu thật với columns và workspace members
    const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
            tasks: {
                include: {
                    assignee: true, // Cần lấy assignee để hiện Avatar
                    comments: {
                        include: {
                            user: true // Lấy user info cho comments
                        },
                        orderBy: { createdAt: 'asc' }
                    },
                    attachments: {
                        include: {
                            uploader: true // Lấy uploader info cho attachments
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { order: 'asc' } // Sắp xếp theo thứ tự
            },
            workspace: {
                include: {
                    members: true // Lấy members từ workspace
                }
            }
        }
    })

    if (!project) return null

    // Parse columns từ JSON
    const columns = project.columns as { id: string; title: string; order: number }[]

    // Truyền data vào component Gantt với đầy đủ props
    return (
        <div className="h-[calc(100vh-140px)] w-full p-4">
            <CustomGantt
                tasks={project.tasks as any}
                projectId={projectId}
                columns={columns}
                members={project.workspace.members}
                currentUser={appUser}
            />
        </div>
    )
}
