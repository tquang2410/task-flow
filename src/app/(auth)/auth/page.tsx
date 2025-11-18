"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [isActive, setIsActive] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    // Register State
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirm, setRegisterConfirm] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [registerSuccess, setRegisterSuccess] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);

    // Load Boxicons
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (error) {
                setLoginError(error.message);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setLoginError("Đã có lỗi xảy ra");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterError("");
        setRegisterSuccess("");

        if (registerPassword !== registerConfirm) {
            setRegisterError("Mật khẩu không khớp");
            return;
        }

        setRegisterLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email: registerEmail,
                password: registerPassword,
            });

            if (error) {
                setRegisterError(error.message);
            } else {
                setRegisterSuccess("Đăng ký thành công! Kiểm tra email để xác thực.");
                setRegisterEmail("");
                setRegisterPassword("");
                setRegisterConfirm("");
            }
        } catch {
            setRegisterError("Đã có lỗi xảy ra");
        } finally {
            setRegisterLoading(false);
        }
    };

    return (
        <>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
        }

   .auth-page-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

        /* Animated Background Shapes */
        .bg-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 20s infinite ease-in-out;
        }

        .bg-shape-1 {
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.3);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .bg-shape-2 {
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.2);
          bottom: -50px;
          right: 10%;
          animation-delay: 5s;
        }

        .bg-shape-3 {
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.15);
          top: 50%;
          right: -150px;
          animation-delay: 10s;
        }

        .bg-shape-4 {
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.25);
          bottom: 20%;
          left: 15%;
          animation-delay: 7s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-30px) rotate(120deg);
          }
          66% {
            transform: translateY(30px) rotate(240deg);
          }
        }

        .container {
          position: relative;
          width: 850px;
          max-width: 100%;
          height: 550px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          z-index: 10;
        }

        .form-box {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          transition: all 0.6s ease-in-out;
          z-index: 10;
        }

        .form-box.login {
          right: 0;
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
          transition-delay: 1.2s;
        }

        .container.active .form-box.login {
          right: 50%;
          transform: translateX(0);
          opacity: 0;
          pointer-events: none;
          transition-delay: 0s;
        }

        .form-box.register {
          right: -50%;
          transform: translateX(0);
          opacity: 0;
          pointer-events: none;
          transition-delay: 0s;
        }

        .container.active .form-box.register {
          right: 50%;
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
          transition-delay: 1.2s;
        }
        .toggle-box {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .toggle-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: -250%;
          width: 300%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 150px;
          transition: 1.8s ease-in-out;
          z-index: 5;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
        }

        .container.active .toggle-box::before {
          left: 50%;
        }

        .toggle-panel {
          position: absolute;
          width: 50%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #fff;
          text-align: center;
          padding: 40px;
          pointer-events: auto;
          z-index: 20;
          transition: 0.6s ease-in-out;
        }

        .toggle-panel.toggle-left {
          left: 0;
          transition-delay: 1.2s;
        }

        .container.active .toggle-panel.toggle-left {
          left: -50%;
          transition-delay: 0.6s;
        }

        .toggle-panel.toggle-right {
          right: -50%;
          transition-delay: 0.6s;
        }

        .container.active .toggle-panel.toggle-right {
          right: 0;
          transition-delay: 1.2s;
        }

        @media (max-width: 768px) {
          .container {
            width: 100%;
            height: auto;
            min-height: 600px;
          }

          .form-box {
            width: 100%;
            height: 70%;
            bottom: 0;
            top: auto;
          }

         .container.active .form-box.login {
  right: 50%;
  opacity: 0;
  pointer-events: none;
  transition: right 0.6s ease-in-out 0s, opacity 0.3s ease-in-out 0s;
}

          .toggle-box::before {
            width: 100%;
            height: 300%;
            border-radius: 50%;
            top: -270%;
            left: 0;
          }

          .container.active .toggle-box::before {
            top: 70%;
            left: 0;
          }

          .toggle-panel {
            width: 100%;
            height: 30%;
          }

          .toggle-panel.toggle-left {
            top: 0;
            left: 0;
          }

          .container.active .toggle-panel.toggle-left {
            top: -30%;
            left: 0;
          }

          .toggle-panel.toggle-right {
            bottom: -30%;
            right: 0;
          }

          .container.active .toggle-panel.toggle-right {
            bottom: 0;
          }

          .bg-shape {
            display: none;
          }
        }
      `}</style>

            <div className="auth-page-wrapper">
                {/* Animated Background Shapes */}
                <div className="bg-shape bg-shape-1"></div>
                <div className="bg-shape bg-shape-2"></div>
                <div className="bg-shape bg-shape-3"></div>
                <div className="bg-shape bg-shape-4"></div>

                <div className={`container ${isActive ? 'active' : ''}`}>
                    {/* Login Form */}
                    <div className="form-box login">
                        <form onSubmit={handleLogin} className="w-full max-w-sm px-10">
                            <h1 className="text-4xl font-semibold text-gray-800 mb-8 text-center">
                                Đăng nhập
                            </h1>

                            {loginError && (
                                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {loginError}
                                </div>
                            )}

                            <div className="relative mb-7">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                    disabled={loginLoading}
                                    className="w-full px-5 py-3 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-700 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                                />
                                <i className="bx bxs-envelope absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>
                            </div>

                            <div className="relative mb-5">
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    disabled={loginLoading}
                                    className="w-full px-5 py-3 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-700 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                                />
                                <i className="bx bxs-lock-alt absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>
                            </div>

                            <div className="text-left mb-5">
                                <a href="#" className="text-sm text-gray-700 hover:text-purple-600 transition-colors">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loginLoading ? "Đang xử lý..." : "Đăng nhập"}
                            </button>

                            <p className="text-sm text-gray-600 my-5 text-center">
                                hoặc đăng nhập với
                            </p>

                            <div className="flex justify-center gap-3">
                                <a href="#" className="p-3 border-2 border-gray-300 rounded-lg text-2xl text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-all">
                                    <i className="bx bxl-google"></i>
                                </a>
                                <a href="#" className="p-3 border-2 border-gray-300 rounded-lg text-2xl text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-all">
                                    <i className="bx bxl-facebook"></i>
                                </a>
                                <a href="#" className="p-3 border-2 border-gray-300 rounded-lg text-2xl text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-all">
                                    <i className="bx bxl-github"></i>
                                </a>
                            </div>
                        </form>
                    </div>

                    {/* Register Form */}
                    <div className="form-box register">
                        <form onSubmit={handleRegister} className="w-full max-w-sm px-10">
                            <h1 className="text-4xl font-semibold text-gray-800 mb-8 text-center">
                                Đăng ký
                            </h1>

                            {registerError && (
                                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {registerError}
                                </div>
                            )}

                            {registerSuccess && (
                                <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {registerSuccess}
                                </div>
                            )}

                            <div className="relative mb-7">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    required
                                    disabled={registerLoading}
                                    className="w-full px-5 py-3 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-700 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                                />
                                <i className="bx bxs-envelope absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>
                            </div>

                            <div className="relative mb-7">
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={registerLoading}
                                    className="w-full px-5 py-3 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-700 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                                />
                                <i className="bx bxs-lock-alt absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>
                            </div>

                            <div className="relative mb-7">
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu"
                                    value={registerConfirm}
                                    onChange={(e) => setRegisterConfirm(e.target.value)}
                                    required
                                    disabled={registerLoading}
                                    className="w-full px-5 py-3 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-700 font-medium transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                                />
                                <i className="bx bxs-lock-alt absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>
                            </div>

                            <button
                                type="submit"
                                disabled={registerLoading}
                                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {registerLoading ? "Đang xử lý..." : "Đăng ký"}
                            </button>

                            <p className="text-sm text-gray-600 my-5 text-center">
                                hoặc đăng ký với
                            </p>

                            <div className="flex justify-center gap-3">
                                <a href="#" className="p-3 border-2 border-gray-300 rounded-lg text-2xl text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-all">
                                    <i className="bx bxl-google"></i>
                                </a>
                                <a href="#" className="p-3 border-2 border-gray-300 rounded-lg text-2xl text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-all">
                                    <i className="bx bxl-facebook"></i>
                                </a>
                                <a href="#" className="p-3 border-2 border-gray-300 rounded-lg text-2xl text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-all">
                                    <i className="bx bxl-github"></i>
                                </a>
                            </div>
                        </form>
                    </div>

                    {/* Toggle Background & Panels */}
                    <div className="toggle-box">
                        <div className="toggle-panel toggle-left">
                            <h1 className="text-5xl font-bold mb-3">Xin chào!</h1>
                            <p className="text-lg mb-8">Chưa có tài khoản?</p>
                            <button
                                onClick={() => setIsActive(true)}
                                className="w-40 h-12 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                            >
                                Đăng ký
                            </button>
                        </div>

                        <div className="toggle-panel toggle-right">
                            <h1 className="text-5xl font-bold mb-3">Chào mừng!</h1>
                            <p className="text-lg mb-8">Đã có tài khoản?</p>
                            <button
                                onClick={() => setIsActive(false)}
                                className="w-40 h-12 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}