'use client'

import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface UserProfileProps {
  user: User
}

export function UserProfile({ user }: UserProfileProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      router.replace('/auth')
      router.refresh()
    }
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="mt-auto flex flex-col items-center gap-4">
      <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
        <LogOut className="h-6 w-6" />
      </button>
      <Avatar className="h-10 w-10 border-2 border-white/20">
        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
        <AvatarFallback>{getInitials(user.user_metadata?.name || user.email)}</AvatarFallback>
      </Avatar>
    </div>
  )
}
