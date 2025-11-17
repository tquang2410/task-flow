// @file: src/app/api/auth/webhook/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  console.log("🔴 [WEBHOOK] Bắt đầu nhận request...") // Log 1: Đánh dấu bắt đầu

  // 1. Kiểm tra Header
  const authHeader = req.headers.get('Authorization')
  console.log("🟡 [WEBHOOK] Header nhận được:", authHeader) // Log 2: Xem Header là gì

  // HARD-CODE CHECK (Để test)
  if (authHeader !== 'Bearer Hiruscar172427') {
    console.error("❌ [WEBHOOK] Sai mật khẩu! Server nhận được: " + authHeader)
    return new NextResponse('Unauthorized', { status: 401 })
  }
  console.log("✅ [WEBHOOK] Mật khẩu đúng!")

  // 2. Đọc dữ liệu
  try {
    const bodyText = await req.text() // Đọc text trước để log
    console.log("🔵 [WEBHOOK] Body nhận được:", bodyText) // Log 3: Xem Supabase gửi gì

    const payload = JSON.parse(bodyText)

    // 3. Xử lý
    if (payload.type === 'INSERT') {
      console.log("🟢 [WEBHOOK] Loại sự kiện là INSERT. Đang xử lý...")
      const { id: supabaseId, email } = payload.record
      console.log(`🔸 [WEBHOOK] Thông tin user: ID=${supabaseId}, Email=${email}`)

      // 4. Ghi vào DB
      console.log("🚀 [WEBHOOK] Đang gọi Prisma create...")
      const newUser = await db.user.create({
        data: {
          supabaseId: supabaseId,
          email: email,
        },
      })
      console.log("🎉 [WEBHOOK] Tạo thành công! User ID Mongo:", newUser.id)

      return new NextResponse('User synced', { status: 200 })
    } else {
      console.log("⚠️ [WEBHOOK] Bỏ qua sự kiện loại:", payload.type)
      return new NextResponse('Payload type not handled', { status: 200 })
    }

  } catch (error: any) {
    console.error("🔥 [WEBHOOK] LỖI CHẾT NGƯỜI:", error) // Log 4: Lỗi DB hoặc Code
    return new NextResponse(`Error: ${error.message}`, { status: 500 })
  }
}