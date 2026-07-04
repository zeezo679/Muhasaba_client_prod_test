import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Compass, Mail, Lock, User, AlertCircle, RefreshCw } from "lucide-react";

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export default function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<number | null>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password, gender);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        "فشل إنشاء الحساب. يرجى محاولة استخدام بريد إلكتروني آخر."
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

        <h2 className="text-xl font-bold text-white mb-6 text-right">إنشاء حساب جديد</h2>

        {error && (
          <div className="mb-5 p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-3 text-red-300 text-xs font-normal">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-400" strokeWidth={1.5} />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name input */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 font-semibold pr-1">الاسم الكامل</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                <User className="w-4.5 h-4.5" strokeWidth={1.5} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="عبد الله محمد"
                className="w-full h-12 bg-[#0A0A0A] border border-neutral-800 rounded-xl pr-11 pl-4 text-sm text-white focus:outline-none focus:border-[#C9A84C] transition-all placeholder:text-gray-600 font-sans"
              />
            </div>
          </div>

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

          {/* Gender selection */}
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 font-semibold pr-1">الجنس</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender(1)}
                className={`h-12 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gender === 1
                    ? "bg-[#C9A84C] text-[#0A0A0A] border-none"
                    : "bg-[#0A0A0A] text-gray-400 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                ذكر
              </button>
              <button
                type="button"
                onClick={() => setGender(2)}
                className={`h-12 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gender === 2
                    ? "bg-[#C9A84C] text-[#0A0A0A] border-none"
                    : "bg-[#0A0A0A] text-gray-400 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                أنثى
              </button>
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
                جاري تسجيل الحساب الجديد...
              </>
            ) : (
              "إنشاء الحساب والمتابعة"
            )}
          </button>
        </form>

        {/* Footer info link */}
        <div className="mt-6 pt-6 border-t border-neutral-900 text-center text-xs">
          <span className="text-gray-500 ml-1 font-normal">لديك حساب بالفعل؟</span>
          <button
            onClick={onNavigateToLogin}
            className="text-[#C9A84C] font-semibold hover:underline cursor-pointer"
          >
            قم بتسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}
