// @file: src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // 1. Tạo Supabase client cho middleware
  const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
              res.cookies.set(name, value, options)
            })
          },
        },
      }
  )

  // 2. Lấy thông tin session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 3. Logic bảo vệ:
  // Nếu chưa đăng nhập VÀ đang cố vào trang `/app`
  if (!session && req.nextUrl.pathname.startsWith('/app')) {
    // Redirect về trang /login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Nếu ĐÃ đăng nhập VÀ đang ở trang /login hoặc /register
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    // Redirect về trang dashboard chính
    return NextResponse.redirect(new URL('/app', req.url))
  }

  // Cho phép truy cập
  return res
}

// Cấu hình matcher để middleware chỉ chạy trên các trang cần thiết
export const config = {
  matcher: [
    '/app/:path*', // Tất cả các trang con của /app
    '/login',
    '/register',
  ],
}