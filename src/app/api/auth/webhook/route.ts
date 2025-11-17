// @file: src/app/api/auth/webhook/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db' // Import Prisma client ta vừa tạo

// Đây là kiểu dữ liệu (type) của payload mà Supabase webhook sẽ gửi
// Chúng ta chỉ quan tâm đến bản ghi (record) mới
type SupabaseAuthPayload = {
  type: 'INSERT'
  table: string
  record: {
    id: string // Đây là supabaseId
    email: string
    //... các trường khác
  }
}

export async function POST(req: Request) {
  // 1. Bảo vệ Webhook
  // Kiểm tra xem request có gửi kèm secret đúng không
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.AUTH_WEBHOOK_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // 2. Lấy dữ liệu
  const payload = (await req.json()) as SupabaseAuthPayload

  // 3. Chỉ xử lý khi có user mới được "INSERT"
  if (payload.type === 'INSERT') {
    const { id: supabaseId, email } = payload.record

    if (!supabaseId || !email) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    try {
      // 4. Đồng bộ vào CSDL MongoDB
      // Dùng CSDL `db` và model `User` từ schema
      await db.user.create({
        data: {
          supabaseId: supabaseId,
          email: email,
        },
      })

      return new NextResponse('User synced', { status: 200 })
    } catch (error: any) {
      // Xử lý lỗi nếu user đã tồn tại (trùng email hoặc supabaseId)
      if (error.code === 'P2002') {
        // P2002 của Prisma là lỗi "Unique constraint failed"
        return new NextResponse('User already exists', { status: 200 })
      }
      return new NextResponse(`Error syncing user: ${error.message}`, {
        status: 500,
      })
    }
  }

  return new NextResponse('Payload type not handled', { status: 200 })
}
