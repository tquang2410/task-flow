// @file: src/app/app/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Note: This is the new Dashboard page, located at /app
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Luôn chạy dù thành công hay thất bại
      router.replace("/auth");
      router.refresh();
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* User info */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{email}</p>
                    <p className="text-xs text-gray-500">Member</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {email.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Đang xuất..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Chào mừng đến với TaskFlow!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Dashboard đang được phát triển...
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-lg">
              <i className="bx bx-check-circle text-2xl text-green-500"></i>
              <span className="text-gray-700">Bạn đã đăng nhập thành công!</span>
            </div>
          </div>
        </main>
      </div>
  );
}
