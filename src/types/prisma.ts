import { Prisma } from '@prisma/client'

/**
 * A centralized type for a Task that includes all its relations:
 * - comments (with user)
 * - attachments (with uploader)
 * Generated using Prisma's GetPayload helper for type safety.
 */
export type TaskWithDetails = Prisma.TaskGetPayload<{
  include: {
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
