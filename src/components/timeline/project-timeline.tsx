
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
 * - Sử dụng 'db.task.findMany' để truy vấn tất cả các task thuộc project đó từ database.
 *   - Lựa chọn bao gồm cả thông tin người được giao ('assignee') để hiển thị avatar.
 *   - Sắp xếp các task theo 'createdAt' để có thứ tự ổn định.
 * - Dữ liệu task sau khi fetch sẽ được truyền vào prop 'tasks' của component 'CustomGantt'.
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

    // Fetch dữ liệu thật
    const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
            tasks: {
                include: {
                    assignee: true, // Cần lấy assignee để hiện Avatar
                },
                orderBy: { order: 'asc' } // Sắp xếp theo thứ tự
            },
            workspace: true
        }
    })

    if (!project) return null

    // Truyền data vào component Gantt xịn
    return (
        <div className="h-[calc(100vh-140px)] w-full p-4">
            <CustomGantt tasks={project.tasks as any} />
            {/* Type assertion 'as any' tạm thời nếu dính lỗi type TaskWithDetails phức tạp,
          nhưng tốt nhất là import đúng type */}
        </div>
    )
}
