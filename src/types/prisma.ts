import { Prisma } from '@prisma/client'

/**
 * A centralized type for a Task that includes all its relations:
 * - comments (with user)
 * - attachments (with uploader)
 * Generated using Prisma's GetPayload helper for type safety.
 */
export type TaskWithDetails = Prisma.TaskGetPayload<{
  include: {
    assignee: true, // Include the full user object for the assignee
    comments: {
      include: {
        user: true
      }
    },
    attachments: {
      include: {
        uploader: true
      }
    }
  }
}>

/**
 * Type for a single column object stored in the `columns` JSON field of a Project.
 */
export type ProjectColumn = {
  id: string
  title: string
}
