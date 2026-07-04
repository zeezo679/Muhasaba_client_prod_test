import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { RefreshCw, Info, AlertCircle, LogOut, Sparkles, Dumbbell, Briefcase } from "lucide-react";
import { DailyLog, Prayer } from "./types";
import DhikrCard from "./components/DhikrCard";
import QuranCard from "./components/QuranCard";
import SpiritualScoreSummary from "./components/SpiritualScoreSummary";
import PrayersSection from "./components/PrayersSection";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import { useAuth } from "./context/AuthContext";
import CelebrationOverlay from "./components/CelebrationOverlay";

function ComingSoonPlaceholder({ tabName, Icon }: { tabName: string; Icon: React.ComponentType<any> }) {
  return (
    <div className="bg-[#151515] border border-neutral-800 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden" dir="rtl">
      
      <Icon className="w-8 h-8 text-[#C9A84C] mb-4" strokeWidth={1.5} />
      
      <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold bg-[#151515] px-3 py-1 rounded-full border border-[#C9A84C]/20 mb-3 font-mono">
        قريباً جداً
      </span>
      
      <h3 className="text-2xl font-bold text-white mb-2">{tabName}</h3>
      <p className="text-sm text-gray-500 font-normal max-w-sm leading-relaxed">
        هذا القسم قيد التطوير والتحضير لخدمتك وتوفير أدوات متكاملة قريباً إن شاء الله لمساعدتك على تنظيم يومك بإنتاجية.
      </p>
    </div>
  );
}

export default function App() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [activeAuthPage, setActiveAuthPage] = useState<"login" | "register">("login");
  const [data, setData] = useState<DailyLog | null>(null);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"spiritual" | "physical" | "work">("spiritual");

  // Ref to track the previous percentage to detect crossing of 50%
  const prevPercentageRef = useRef<number | null>(null);
  // State to manage overlay visibility
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  // State to persist the celebration-shown status for the current active session
  const [shownCelebrationDate, setShownCelebrationDate] = useState<string | null>(null);

  // Helper to format today's date in local time zone
  const getTodayDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Watch for percentage changes and trigger celebration when crossing 50% from below
  useEffect(() => {
    if (data) {
      const currentPct = data.percentage;
      const prevPct = prevPercentageRef.current;
      
      const dateStr = getTodayDateString();
      const shownToday = shownCelebrationDate === dateStr;

      // Detect if it strictly crossed 50% upward (was less than 50, now >= 50)
      if (prevPct !== null && prevPct < 50 && currentPct >= 50 && !shownToday) {
        setShownCelebrationDate(dateStr);
        setShowCelebration(true);
      }
      
      // Update the previous percentage reference
      prevPercentageRef.current = currentPct;
    } else {
      // Clear reference if user logs out or data becomes null
      prevPercentageRef.current = null;
    }
  }, [data, shownCelebrationDate]);

  // Function to load all today's data (daily log + prayers status)
  const fetchAllTodayData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [logResponse, prayersResponse] = await Promise.all([
        axios.get("/api/daily-log/today"),
        axios.get("/api/prayers/today")
      ]);
      setData(logResponse.data);
      setPrayers(prayersResponse.data || []);
    } catch (err: any) {
      console.error("Error fetching daily data:", err);
      setError("فشل الاتصال بالخادم جراء مشكلة في الشبكة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch only when user changes / authenticates
  useEffect(() => {
    if (user) {
      fetchAllTodayData();
    } else {
      setData(null);
      setPrayers([]);
      setShownCelebrationDate(null);
      prevPercentageRef.current = null;
    }
  }, [user]);

  // Loading state when silent session recovery is active
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center gap-4" dir="rtl">
        <div className="w-12 h-12 rounded-full border-4 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
        <p className="text-sm text-[#C9A84C] font-bold animate-pulse">جاري استعادة جلسة العمل الآمنة...</p>
      </div>
    );
  }

  // Auth gate
  if (!user) {
    if (activeAuthPage === "register") {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between">
          <RegisterPage onNavigateToLogin={() => setActiveAuthPage("login")} />
          <footer className="w-full max-w-5xl mx-auto py-6 border-t border-neutral-900 text-center text-xs text-gray-500">
            <p>تطبيق مُحَاسَبَة — متابعة الورد الشرعي والعبادات اليومية بنجاح.</p>
          </footer>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between">
        <LoginPage onNavigateToRegister={() => setActiveAuthPage("register")} />
        <footer className="w-full max-w-5xl mx-auto py-6 border-t border-neutral-900 text-center text-xs text-gray-500">
          <p>تطبيق مُحَاسَبَة — متابعة الورد الشرعي والعبادات اليومية بنجاح.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-6 pb-28 px-4 sm:px-6 lg:px-8 flex flex-col justify-between selection:bg-[#C9A84C] selection:text-black" dir="rtl">
      {/* Container max-w-5xl centered */}
      <div className="w-full max-w-5xl mx-auto flex-1">
        
        {/* Elegant Top Navigation Header */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8 border-b border-neutral-900 pb-6">
          <div className="flex items-center gap-4">
            {/* Logo Icon */}
            <div className="w-12 h-12 bg-[#C9A84C] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-black font-extrabold text-2xl">م</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#C9A84C] tracking-wide">مُحَاسَبَة</h1>
                <span className="text-[10px] font-semibold bg-[#151515] text-[#C9A84C] border border-[#C9A84C]/20 px-2 py-0.5 rounded-md">
                  الورد اليومي
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-normal">
                مرحباً بك، <span className="text-white font-semibold">{user.name}</span> • مُرَاقَبَة الْعِبَادَات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Refresh button */}
            <button
              onClick={fetchAllTodayData}
              disabled={isLoading}
              className="w-11 h-11 rounded-xl bg-[#151515] border border-neutral-800 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] active:scale-95 transition-all text-gray-400 disabled:opacity-50 flex items-center justify-center cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin text-[#C9A84C]" : ""}`} strokeWidth={1.5} />
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="h-11 px-4 rounded-xl bg-[#151515] border border-neutral-800 hover:border-red-500/30 hover:text-red-400 active:scale-95 transition-all text-gray-400 flex items-center gap-2 font-semibold text-xs cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Error State Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-950/25 border border-red-900/30 rounded-xl flex items-start gap-3.5 text-red-300 font-normal">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">عذراً، فشل جلب البيانات الحالية</h4>
              <p className="text-xs text-red-400/90 mt-1 leading-relaxed">{error}</p>
              <button 
                onClick={fetchAllTodayData}
                className="mt-3 text-xs bg-red-900/30 hover:bg-red-900/50 border border-red-800 px-3.5 py-2 rounded-lg font-semibold transition-all h-10 flex items-center justify-center cursor-pointer"
              >
                إعادة المحاولة الآن
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay State */}
        {isLoading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
            <p className="text-sm text-[#C9A84C]/80 font-bold animate-pulse">جاري تحميل الورد والتقدم الروحي...</p>
          </div>
        ) : data ? (
          <main className="space-y-8">
            {/* 1. Score Summary Header Card - Persistent across all tabs */}
            <section className="transition-all duration-300">
              <SpiritualScoreSummary
                earnedScore={data.earnedScore}
                maximumScore={data.maximumScore}
                percentage={data.percentage}
                calculatedAt={data.calculatedAt}
              />
            </section>

            {/* Swappable content section */}
            {activeTab === "spiritual" && (
              <>
                {/* 2. Prayers Tracking Section */}
                <section className="transition-all duration-300">
                  <PrayersSection
                    prayers={prayers}
                    onMutation={fetchAllTodayData}
                  />
                </section>

                {/* 3. Stepper Cards Grid - fully responsive single column or 2 columns on medium+ viewports */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Dhikr Stepper Card */}
                  <DhikrCard
                    currentCount={data.dhikrCount}
                    onMutation={fetchAllTodayData}
                  />

                  {/* Quran Stepper Card */}
                  <QuranCard
                    currentPages={data.quranPages}
                    onMutation={fetchAllTodayData}
                  />
                </section>

                {/* 4. Islamic Wisdom Quote Block (Tactile Polish) */}
                <section className="bg-[#151515] border border-neutral-800 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 text-right">
                  <Info className="w-5 h-5 text-[#C9A84C] shrink-0" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-xs font-bold text-[#C9A84C] mb-1">فائدة وتوجيه إيماني</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      قال رسول الله صلى الله عليه وسلم: «أحبّ الأعمال إلى الله أدومها وإن قلّ». سجل وردك اليومي وثابر عليه، فإن القليل الدائم يبارك الله فيه، ويبني عادات روحية راسخة تدوم مدى الحياة.
                    </p>
                  </div>
                </section>
              </>
            )}

            {activeTab === "physical" && (
              <ComingSoonPlaceholder tabName="القسم البدني والرياضي" Icon={Dumbbell} />
            )}

            {activeTab === "work" && (
              <ComingSoonPlaceholder tabName="قسم العمل والإنتاجية" Icon={Briefcase} />
            )}
          </main>
        ) : null}
      </div>

      {/* Aesthetic Footer */}
      <footer className="w-full max-w-5xl mx-auto mt-16 pt-6 border-t border-neutral-900 text-center flex flex-col sm:flex-row sm:justify-between items-center gap-4 text-xs text-gray-500">
        <p>تطبيق مُحَاسَبَة — متابعة الورد الشرعي والعبادات اليومية بنجاح.</p>
        <div className="flex items-center gap-3">
          <span>{new Date().getFullYear()} م</span>
          <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full" />
          <span>برمجة متميزة باللغة العربية</span>
        </div>
      </footer>

      {/* Fixed Floating Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0A0A0A]/90 backdrop-blur-md">
        <div className="max-w-md mx-auto bg-[#151515] border border-neutral-800 rounded-xl flex items-center justify-around py-3 px-2">
          {/* Spiritual (الروحي) */}
          <button
            onClick={() => setActiveTab("spiritual")}
            className={`flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
              activeTab === "spiritual"
                ? "text-[#C9A84C]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">الروحي</span>
            {activeTab === "spiritual" && (
              <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#C9A84C] rounded-full" />
            )}
          </button>

          {/* Physical (البدني) */}
          <button
            onClick={() => setActiveTab("physical")}
            className={`flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
              activeTab === "physical"
                ? "text-[#C9A84C]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Dumbbell className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">البدني</span>
            {activeTab === "physical" && (
              <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#C9A84C] rounded-full" />
            )}
          </button>

          {/* Work (العمل) */}
          <button
            onClick={() => setActiveTab("work")}
            className={`flex-1 flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
              activeTab === "work"
                ? "text-[#C9A84C]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Briefcase className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">العمل</span>
            {activeTab === "work" && (
              <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#C9A84C] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Daily Progress 50% Threshold Crossing Celebration Overlay */}
      <CelebrationOverlay
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        percentage={data?.percentage || 0}
      />
    </div>
  );
}
