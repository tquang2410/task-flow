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

  // 3. Logic bảo vệ & điều hướng:
  const { user } = session?.user ? { user: session.user } : { user: null }

  // A. User đã đăng nhập
  if (user) {
    // A.1. Nếu vào trang /auth, redirect sang /app
    if (req.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/app', req.url))
    }
    // A.2. Nếu vào trang chủ (`/`), redirect sang /app
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/app', req.url))
    }
  }
  // B. User chưa đăng nhập
  else {
    // B.1. Nếu cố vào /app, đá về /auth
    if (req.nextUrl.pathname.startsWith('/app')) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
  }


  // Cho phép truy cập
  return res
}

// Cấu hình matcher để middleware chỉ chạy trên các trang cần thiết
export const config = {
  matcher: [
    '/', // Chạy trên cả trang chủ
    '/app/:path*', // Tất cả các trang con của /app
    '/auth',
  ],
}