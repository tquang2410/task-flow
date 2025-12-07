import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard,
  CheckCircle,
  Inbox,
  Users,
  Settings, // <--- Thêm cái này
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/components/dashboard/user-profile'
import { Toaster } from 'sonner'
import { SmoothScroll } from '@/components/providers/smooth-scroll'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth')
  }

  return (
    <SmoothScroll>
      {/* Container chính: Min-height screen để background phủ kín, KHÔNG khóa overflow */}
      <div className="flex min-h-screen w-full bg-dashboard-background text-white">
        <Toaster theme="dark" position="top-right" />
        
        {/* Sidebar - Fixed Position (Đứng yên khi cuộn) */}
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col items-center border-r border-white/10 bg-black/30 py-6 backdrop-blur-md">
          <div className="mb-10">
            <Link href="/app">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("[https://lh3.googleusercontent.com/aida-public/AB6AXuAoqPnbygc_xatYZmyjqNXuvQsK7srJw2mZteO820bStpfNNhdKAF1uFfLaMP--NYM7ELGELPqnBymq00gu5tlNvgWNC62Ndn_7BG7oTwgyKSl59EUUzRGA0a8PgV9RvTPQsX1wmIA7HotvBa2b6JCEkFDeqr7nXlFf3lXUA-ETmnWsx4wr6mT1RsfXAyZ7IO5Z6OAT2_acNkZfHkEW1xbLcRkeUuwKojkJ3bmfmtE5Qm8cHTbkKxiczvTGex5ZkcJ8l1U-A2eA_9k](https://lh3.googleusercontent.com/aida-public/AB6AXuAoqPnbygc_xatYZmyjqNXuvQsK7srJw2mZteO820bStpfNNhdKAF1uFfLaMP--NYM7ELGELPqnBymq00gu5tlNvgWNC62Ndn_7BG7oTwgyKSl59EUUzRGA0a8PgV9RvTPQsX1wmIA7HotvBa2b6JCEkFDeqr7nXlFf3lXUA-ETmnWsx4wr6mT1RsfXAyZ7IO5Z6OAT2_acNkZfHkEW1xbLcRkeUuwKojkJ3bmfmtE5Qm8cHTbkKxiczvTGex5ZkcJ8l1U-A2eA_9k)")' }}></div>
            </Link>
          </div>
          
          {/* Navigation Links - Đầy đủ 4 icon */}
          <nav className="flex flex-col items-center gap-4">
            <Link
              href="/app"
              className="group relative flex items-center justify-center rounded-lg p-3 text-white transition-colors hover:bg-white/10"
              title="Dashboard"
            >
              <LayoutDashboard className="h-6 w-6" />
            </Link>
            <Link
              href="#"
              className="group relative flex items-center justify-center rounded-lg p-3 text-slate-400 hover:text-white transition-colors hover:bg-white/10"
              title="My Tasks"
            >
              <CheckCircle className="h-6 w-6" />
            </Link>
            <Link
              href="#"
              className="group relative flex items-center justify-center rounded-lg p-3 text-slate-400 hover:text-white transition-colors hover:bg-white/10"
              title="Inbox"
            >
              <Inbox className="h-6 w-6" />
            </Link>
            <Link
              href="#"
              className="group relative flex items-center justify-center rounded-lg p-3 text-slate-400 hover:text-white transition-colors hover:bg-white/10"
              title="Team"
            >
              <Users className="h-6 w-6" />
            </Link>
            <Link
              href="/app/settings"
              className="group relative flex items-center justify-center rounded-lg p-3 text-slate-400 hover:text-white transition-colors hover:bg-white/10"
              title="Settings"
            >
              <Settings className="h-6 w-6" />
            </Link>
          </nav>

          <div className="mt-auto">
            <UserProfile user={user} />
          </div>
        </aside>

        {/* Main Content - Tự do dãn nở */}
        {/* Padding-left 20 (80px) để tránh Sidebar che mất nội dung */}
        <main className="flex-1 pl-20 flex flex-col relative pb-10">
          {children}
        </main>
      </div>
    </SmoothScroll>
  )
}