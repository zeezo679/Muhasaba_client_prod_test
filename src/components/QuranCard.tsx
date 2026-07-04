import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpenText, Plus, Minus, Check, RefreshCw } from "lucide-react";

interface QuranCardProps {
  currentPages: number;
  onMutation: () => void;
}

export default function QuranCard({ currentPages, onMutation }: QuranCardProps) {
  const [pages, setPages] = useState<number>(currentPages);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with updated prop from parent/backend
  useEffect(() => {
    setPages(currentPages);
  }, [currentPages]);

  // Synthesize digital sound
  const playPageSound = (freq = 600, duration = 0.05) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const handleAdjust = (amount: number) => {
    const next = Math.max(0, Math.min(604, pages + amount)); // Quran has 604 pages total
    if (next === pages) return;

    playPageSound(amount > 0 ? 700 : 500, 0.05);
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
    
    setPages(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 604) {
      setPages(val);
    } else if (e.target.value === "") {
      setPages(0);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await axios.post("/api/spiritual/quran", { pages });
      playPageSound(900, 0.15);
      onMutation();
    } catch (err: any) {
      console.error("Failed to save Quran pages count", err);
      setError("حدث خطأ أثناء حفظ صفحات القرآن. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = pages !== currentPages;

  return (
    <div className="bg-[#151515] border border-neutral-800 hover:border-[#C9A84C]/40 transition-all duration-200 rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
      
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BookOpenText className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-lg text-white">تلاوة القرآن الكريم</h3>
              <p className="text-xs text-gray-500 font-normal">سجل عدد الصفحات التي قرأتها اليوم</p>
            </div>
          </div>
          {hasUnsavedChanges && (
            <span className="text-xs bg-[#151515] text-[#C9A84C] border border-[#C9A84C]/20 px-2.5 py-1 rounded-full animate-pulse">
              تعديل غير محفوظ
            </span>
          )}
        </div>

        {/* Tactile display block */}
        <div className="bg-[#0A0A0A] border border-neutral-800/80 rounded-xl p-6 mb-6 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500 mb-3 block font-normal">عدد الصفحات المقروءة</span>
          
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            {/* Decrement by 5 */}
            <button
              onClick={() => handleAdjust(-5)}
              disabled={pages < 5}
              className="w-12 h-12 rounded-xl bg-[#141414] hover:bg-red-500/10 border border-neutral-800 hover:border-red-500/20 text-gray-400 hover:text-red-400 active:scale-90 transition-all flex items-center justify-center disabled:opacity-35 shrink-0"
              title="تقليل 5 صفحات"
            >
              <span className="text-xs font-bold">-٥</span>
            </button>

            {/* Decrement by 1 */}
            <button
              onClick={() => handleAdjust(-1)}
              disabled={pages < 1}
              className="w-12 h-12 rounded-xl bg-[#141414] hover:bg-red-500/15 border border-neutral-800 hover:border-red-500/30 text-gray-300 hover:text-red-400 active:scale-90 transition-all flex items-center justify-center disabled:opacity-35 shrink-0"
              title="تقليل صفحة"
            >
              <Minus className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Core Numeric Input Field */}
            <div className="relative flex flex-col items-center shrink-0">
              <input
                type="number"
                value={pages === 0 ? "" : pages}
                placeholder="٠"
                onChange={handleInputChange}
                min="0"
                max="604"
                className="w-20 h-14 sm:w-24 sm:h-16 text-center text-3xl sm:text-4xl font-extrabold bg-[#050505] border-2 border-neutral-800 focus:border-[#C9A84C] text-white rounded-xl focus:outline-none transition-all duration-200 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] text-[#C9A84C]/60 font-semibold mt-1">صفحة</span>
            </div>

            {/* Increment by 1 */}
            <button
              onClick={() => handleAdjust(1)}
              disabled={pages >= 604}
              className="w-12 h-12 rounded-xl bg-[#141414] hover:bg-[#C9A84C]/15 border border-neutral-800 hover:border-[#C9A84C]/30 text-gray-300 hover:text-[#C9A84C] active:scale-90 transition-all flex items-center justify-center disabled:opacity-35 shrink-0"
              title="زيادة صفحة"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Increment by 5 */}
            <button
              onClick={() => handleAdjust(5)}
              disabled={pages >= 600}
              className="w-12 h-12 rounded-xl bg-[#141414] hover:bg-[#C9A84C]/10 border border-neutral-800 hover:border-[#C9A84C]/20 text-gray-400 hover:text-[#C9A84C] active:scale-90 transition-all flex items-center justify-center disabled:opacity-35 shrink-0"
              title="زيادة 5 صفحات"
            >
              <span className="text-xs font-bold">+٥</span>
            </button>
          </div>

          {/* Inspirational / Progress Tip */}
          <p className="text-[11px] text-gray-500 mt-4 text-center leading-relaxed font-normal">
            {pages === 0 
              ? "ابتدئ تلاوتك اليوم، صفحة واحدة فقط تصنع الفارق!"
              : pages < 4 
              ? "جميل! استمر في وردك، قليل دائم خير من كثير منقطع."
              : pages < 10 
              ? "ممتاز! تقريباً نصف جزء، بارك الله في وقتك وجهدك."
              : "رائع جداً! جزء كامل أو أكثر، تقبل الله منك ومن المسلمين."}
          </p>
        </div>
      </div>

      {/* Sync / Save Section */}
      <div className="mt-4 pt-4 border-t border-neutral-800">
        {error && (
          <p className="text-red-400 text-xs text-center mb-3 font-medium bg-red-950/20 py-2 px-3 rounded-lg border border-red-900/30">
            {error}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            hasUnsavedChanges
              ? "bg-[#C9A84C] text-[#0A0A0A] hover:opacity-90 active:scale-98 cursor-pointer border-none"
              : "bg-[#0A0A0A] text-gray-400 border border-neutral-800 hover:border-neutral-700"
          }`}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              جاري الحفظ والتحميل...
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Check className="w-4 h-4" strokeWidth={1.5} />
              حفظ الورد الجديد ({pages} صفحات)
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              تم مزامنة ورد التلاوة بنجاح
            </>
          )}
        </button>
      </div>
    </div>
  );
}
