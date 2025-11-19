import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard,
  CheckCircle,
  Inbox,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/components/dashboard/user-profile'

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

  // The main layout for the authenticated part of the app, based on the HTML template.
  return (
    // Using the new 'dashboard-background' color from tailwind.config.ts
    <div className="relative flex min-h-screen w-full bg-dashboard-background text-white">
      {/* Glassmorphism Sidebar from template */}
      <aside className="fixed left-0 top-0 z-20 flex h-full w-20 flex-col items-center border-r border-white/10 bg-black/30 py-6 backdrop-blur-md">
        <div className="mb-10">
          <Link href="/app">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAoqPnbygc_xatYZmyjqNXuvQsK7srJw2mZteO820bStpfNNhdKAF1uFfLaMP--NYM7ELGELPqnBymq00gu5tlNvgWNC62Ndn_7BG7oTwgyKSl59EUUzRGA0a8PgV9RvTPQsX1wmIA7HotvBa2b6JCEkFDeqr7nXlFf3lXUA-ETmnWsx4wr6mT1RsfXAyZ7IO5Z6OAT2_acNkZfHkEW1xbLcRkeUuwKojkJ3bmfmtE5Qm8cHTbkKxiczvTGex5ZkcJ8l1U-A2eA_9k")' }}></div>
          </Link>
        </div>
        <nav className="flex flex-col items-center gap-4">
          {/* Active Link */}
          <Link
            href="/app"
            className="group relative flex items-center justify-center rounded-lg p-3 text-white"
          >
            <div className="absolute left-0 h-8 w-1 rounded-r-full bg-dashboard-primary transition-all"></div>
            <LayoutDashboard className="h-6 w-6" />
          </Link>
          {/* Other Links */}
          <Link
            href="#"
            className="group relative flex items-center justify-center rounded-lg p-3 text-slate-400 hover:text-white transition-colors"
          >
            <div className="absolute left-0 h-0 w-1 rounded-r-full bg-dashboard-primary transition-all group-hover:h-6"></div>
            <CheckCircle className="h-6 w-6" />
          </Link>
          <Link
            href="#"
            className="group relative flex items-center justify-center rounded-lg p-3 text-slate-400 hover:text-white transition-colors"
          >
            <div className="absolute left-0 h-0 w-1 rounded-r-full bg-dashboard-primary transition-all group-hover:h-6"></div>
            <Inbox className="h-6 w-6" />
          </Link>
          <Link
            href="#"
            className="group relative flex items-center justify-center rounded-lg p-3 text-slate-400 hover:text-white transition-colors"
          >
            <div className="absolute left-0 h-0 w-1 rounded-r-full bg-dashboard-primary transition-all group-hover:h-6"></div>
            <Users className="h-6 w-6" />
          </Link>
        </nav>
        {/* User Profile client component */}
        <UserProfile user={user} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pl-20">
        {children}
      </main>
    </div>
  )
}
