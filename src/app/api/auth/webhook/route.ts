// @file: src/app/api/auth/webhook/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra Authorization
    const authHeader = req.headers.get('Authorization')
    const expectedAuth = `Bearer ${process.env.AUTH_WEBHOOK_SECRET || 'Hiruscar172427'}`

    if (authHeader !== expectedAuth) {
      console.error('[WEBHOOK] Unauthorized access attempt')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Parse payload
    const payload = await req.json()

    // 3. Validate payload
    if (payload.type !== 'INSERT' || payload.table !== 'users') {
      return NextResponse.json({
        message: 'Event not handled'
      }, { status: 200 })
    }

    // 4. Extract user data
    const { id: supabaseId, email } = payload.record

    if (!supabaseId || !email) {
      return NextResponse.json({
        error: 'Missing id or email'
      }, { status: 400 })
    }

    // 5. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { supabaseId }
    })

    if (existingUser) {
      console.log('[WEBHOOK] User already exists:', supabaseId)
      return NextResponse.json({
        message: 'User already exists',
        mongoId: existingUser.id
      }, { status: 200 })
    }

    // 6. Create user in MongoDB
    const newUser = await db.user.create({
      data: {
        supabaseId,
        email,
      },
    })

    console.log('[WEBHOOK] User synced successfully:', newUser.id)

    return NextResponse.json({
      success: true,
      mongoId: newUser.id,
      supabaseId: newUser.supabaseId
    }, { status: 200 })

  } catch (error: unknown) {
    console.error('[WEBHOOK] Error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : typeof error
    }, { status: 500 })
  }
}