// @file: src/app/api/auth/webhook/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  console.log("🔴 [WEBHOOK] ==================== BẮT ĐẦU ====================")
  console.log("🔴 [WEBHOOK] Timestamp:", new Date().toISOString())
  console.log("🔴 [WEBHOOK] URL:", req.url)
  console.log("🔴 [WEBHOOK] Method:", req.method)

  try {
    // 1. Log tất cả headers
    console.log("📋 [WEBHOOK] All Headers:")
    req.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`)
    })

    // 2. Kiểm tra Authorization
    const authHeader = req.headers.get('Authorization')
    const expectedAuth = 'Bearer Hiruscar172427'

    console.log("🔑 [WEBHOOK] Auth Check:")
    console.log("   Expected:", expectedAuth)
    console.log("   Received:", authHeader)
    console.log("   Match:", authHeader === expectedAuth)

    if (authHeader !== expectedAuth) {
      console.error("❌ [WEBHOOK] UNAUTHORIZED!")
      return new NextResponse('Unauthorized', { status: 401 })
    }
    console.log("✅ [WEBHOOK] Auth OK!")

    // 3. Đọc và log body
    const bodyText = await req.text()
    console.log("📦 [WEBHOOK] Raw Body Length:", bodyText.length)
    console.log("📦 [WEBHOOK] Raw Body:", bodyText)

    const payload = JSON.parse(bodyText)
    console.log("📦 [WEBHOOK] Parsed Payload:", JSON.stringify(payload, null, 2))

    // 4. Validate payload structure
    console.log("🔍 [WEBHOOK] Payload Validation:")
    console.log("   payload.type:", payload.type)
    console.log("   payload.table:", payload.table)
    console.log("   payload.record:", payload.record ? "exists" : "missing")

    if (payload.type !== 'INSERT') {
      console.log("⚠️ [WEBHOOK] Not INSERT event, skipping")
      return NextResponse.json({ message: 'Event type not INSERT' }, { status: 200 })
    }

    if (payload.table !== 'users') {
      console.log("⚠️ [WEBHOOK] Not users table, skipping")
      return NextResponse.json({ message: 'Table not users' }, { status: 200 })
    }

    // 5. Extract user data
    const { id: supabaseId, email } = payload.record
    console.log("👤 [WEBHOOK] Extracted User Data:")
    console.log("   supabaseId:", supabaseId)
    console.log("   email:", email)

    if (!supabaseId || !email) {
      console.error("❌ [WEBHOOK] Missing supabaseId or email!")
      return NextResponse.json({ error: 'Missing id or email' }, { status: 400 })
    }

    // 6. Check DATABASE_URL
    console.log("💾 [WEBHOOK] Database Check:")
    console.log("   DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("   DATABASE_URL preview:", process.env.DATABASE_URL?.substring(0, 30) + "...")

    // 7. Check existing user
    console.log("🔍 [WEBHOOK] Checking if user exists...")
    const existingUser = await db.user.findUnique({
      where: { supabaseId }
    })
    console.log("🔍 [WEBHOOK] Existing user:", existingUser ? "FOUND" : "NOT FOUND")

    if (existingUser) {
      console.log("⚠️ [WEBHOOK] User already exists, skipping creation")
      return NextResponse.json({
        message: 'User already exists',
        mongoId: existingUser.id
      }, { status: 200 })
    }

    // 8. Create user
    console.log("🚀 [WEBHOOK] Creating user in MongoDB...")
    const newUser = await db.user.create({
      data: {
        supabaseId: supabaseId,
        email: email,
      },
    })
    console.log("🎉 [WEBHOOK] User created successfully!")
    console.log("🎉 [WEBHOOK] MongoDB ID:", newUser.id)
    console.log("🎉 [WEBHOOK] Supabase ID:", newUser.supabaseId)
    console.log("🎉 [WEBHOOK] Email:", newUser.email)

    return NextResponse.json({
      success: true,
      mongoId: newUser.id,
      supabaseId: newUser.supabaseId
    }, { status: 200 })

  } catch (error: unknown) {
    console.error("🔥 [WEBHOOK] ==================== ERROR ====================")
    console.error("🔥 [WEBHOOK] Error Type:", typeof error)

    if (error instanceof Error) {
      console.error("🔥 [WEBHOOK] Error Name:", error.name)
      console.error("🔥 [WEBHOOK] Error Message:", error.message)
      console.error("🔥 [WEBHOOK] Error Stack:", error.stack)
    } else {
      console.error("🔥 [WEBHOOK] Unknown Error:", error)
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : typeof error
    }, { status: 500 })
  } finally {
    console.log("🔴 [WEBHOOK] ==================== KẾT THÚC ====================")
  }
}