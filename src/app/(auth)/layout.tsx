// @file: src/app/(auth)/layout.tsx
import React from "react";

// Đây là layout dành riêng cho các trang
// đăng nhập, đăng ký...
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      {children}
    </div>
  );
};

export default AuthLayout;
