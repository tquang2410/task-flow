// @file: src/app/api/auth/webhook/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  console.log("🔴 [WEBHOOK] Bắt đầu nhận request...")

  // 1. Kiểm tra Header
  const authHeader = req.headers.get('Authorization')
  console.log("🟡 [WEBHOOK] Header nhận được:", authHeader)

  // HARD-CODE CHECK (Để test)
  if (authHeader !== 'Bearer Hiruscar172427') {
    console.error("❌ [WEBHOOK] Sai mật khẩu! Server nhận được: " + authHeader)
    return new NextResponse('Unauthorized', { status: 401 })
  }
  console.log("✅ [WEBHOOK] Mật khẩu đúng!")

  // 2. Đọc dữ liệu
  try {
    const bodyText = await req.text()
    console.log("🔵 [WEBHOOK] Body nhận được:", bodyText)

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

  } catch (error: unknown) { // <--- ĐÃ SỬA: Dùng 'unknown' thay vì 'any'
    console.error("🔥 [WEBHOOK] LỖI CHẾT NGƯỜI:", error)

    // Xử lý message an toàn hơn cho TypeScript
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }

    return new NextResponse(`Error: ${errorMessage}`, { status: 500 })
  }
}