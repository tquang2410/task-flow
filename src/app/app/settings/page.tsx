// @file: src/app/app/settings/page.tsx

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/settings/profile-form'

/**
 * Trang cài đặt tài khoản người dùng.
 * - Đây là một Server Component.
 * - Chức năng:
 *   1. Fetch thông tin người dùng hiện tại từ database.
 *   2. Nếu không có người dùng, chuyển hướng về trang đăng nhập.
 *   3. Render `ProfileForm` (Client Component) và truyền dữ liệu người dùng vào.
 */
export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const appUser = await db.user.findUnique({
    where: {
      supabaseId: user.id,
    },
  })

  if (!appUser) {
    // This case should ideally not happen if user records are synced on registration
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      <ProfileForm initialUser={appUser} />
    </div>
  )
}
