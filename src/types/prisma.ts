import { Prisma } from '@prisma/client'

/**
 * A centralized type for a Task that includes its nested comments,
 * and the user associated with each comment.
 * Generated using Prisma's GetPayload helper for type safety.
 */
export type TaskWithComments = Prisma.TaskGetPayload<{
  include: {
    comments: {
      include: {
        user: true
      }
    }
  }
}>
