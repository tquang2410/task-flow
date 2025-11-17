// @file: src/lib/db.ts
import { PrismaClient } from '@prisma/client'

// Khai báo một biến global để lưu trữ instance của PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Kiểm tra xem đã có instance nào trong global chưa
// Nếu chưa, tạo một instance mới
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // (Tùy chọn) log lại các query ra console khi ở môi trường dev
    log:
      process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Ở môi trường dev, gán instance vào global
// để nó không bị tạo lại sau mỗi lần hot-reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
