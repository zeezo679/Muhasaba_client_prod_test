import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Compass, Mail, Lock, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

export default function LoginPage({ onNavigateToRegister }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        "حدث خطأ أثناء تسجيل الدخول. يرجى التحقق من صحة البيانات والمحاولة مجدداً."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-center min-h-[85vh]" dir="rtl">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-16 h-16 bg-[#C9A84C] rounded-xl flex items-center justify-center mb-4">
          <span className="text-black font-extrabold text-3xl">م</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide">مُحَاسَبَة</h1>
        <p className="text-sm text-[#C9A84C] mt-2 font-normal">الجانب الروحي • رفيقك الإيماني واليومي</p>
      </div>

      {/* Main Card Form */}
      <div className="bg-[#151515] border border-neutral-800 rounded-xl p-6 md:p-8 relative overflow-hidden">

        <h2 className="text-xl font-bold text-white mb-6 text-right">تسجيل الدخول</h2>

        {error && (
          <div className="mb-5 p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-3 text-red-300 text-xs font-normal">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-400" strokeWidth={1.5} />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 font-semibold pr-1">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4.5 h-4.5" strokeWidth={1.5} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@muhasabaa.com"
                className="w-full h-12 bg-[#0A0A0A] border border-neutral-800 rounded-xl pr-11 pl-4 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-all placeholder:text-gray-600 font-sans"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 font-semibold pr-1">كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-4.5 h-4.5" strokeWidth={1.5} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 bg-[#0A0A0A] border border-neutral-800 rounded-xl pr-11 pl-4 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-all placeholder:text-gray-600 font-sans"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mt-4 bg-[#C9A84C] text-[#0A0A0A] font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" strokeWidth={1.5} />
                جاري التحقق والمزامنة...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        {/* Footer info link */}
        <div className="mt-6 pt-6 border-t border-neutral-900 text-center text-xs">
          <span className="text-gray-500 ml-1 font-normal">ليس لديك حساب بعد؟</span>
          <button
            onClick={onNavigateToRegister}
            className="text-[#C9A84C] font-semibold hover:underline cursor-pointer"
          >
            أنشئ حساباً جديداً
          </button>
        </div>
      </div>
    </div>
  );
}
