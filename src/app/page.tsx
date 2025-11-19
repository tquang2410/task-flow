import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Note: This is the new public Landing Page for guests, located at /
export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-white font-bold text-4xl">T</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        TaskFlow - Quản lý công việc hiệu quả
      </h1>
      <p className="max-w-2xl text-lg text-gray-600 mb-8">
        Nền tảng giúp bạn tổ chức, phân công và theo dõi tiến độ công việc một cách trực quan và dễ dàng.
      </p>
      <Link href="/auth">
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          Join with us
        </Button>
      </Link>
    </div>
  )
}