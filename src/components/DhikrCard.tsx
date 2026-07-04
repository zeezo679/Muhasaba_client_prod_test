import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sparkles, Plus, Minus, RotateCcw, Check, RefreshCw } from "lucide-react";

interface DhikrCardProps {
  currentCount: number;
  onMutation: () => void;
}

export default function DhikrCard({ currentCount, onMutation }: DhikrCardProps) {
  const [count, setCount] = useState<number>(currentCount);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDhikrIndex, setActiveDhikrIndex] = useState<number>(0);

  // Synced local state with prop updates from server
  useEffect(() => {
    setCount(currentCount);
  }, [currentCount]);

  const dhikrPhrases = [
    { text: "سُبْحَانَ اللَّهِ", target: 33, desc: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ" },
    { text: "الْحَمْدُ لِلَّهِ", target: 33, desc: "الْحَمْدُ لِلَّهِ كَثِيرًا" },
    { text: "اللَّهُ أَكْبَرُ", target: 33, desc: "اللَّهُ أَكْبَرُ كَبِيرًا" },
    { text: "لَا إِلٰهَ إِلَّا اللَّه", target: 100, desc: "وَحْدَهُ لَا شَرِيكَ لَهُ" },
    { text: "أَسْتَغْفِرُ اللَّه", target: 100, desc: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ" }
  ];

  // Synthesize a beautiful digital beep sound using Web Audio API for a physical feel
  const playBeep = (freq = 800, duration = 0.04) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio context errors
    }
  };

  const handleIncrement = (val: number) => {
    const next = Math.max(0, Math.min(10000, count + val));
    if (next === count) return;

    // Trigger sound and vibration outside of the state updater
    if (next > 0 && (next % 33 === 0 || next % 100 === 0)) {
      playBeep(1200, 0.12);
      if (navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
    } else {
      playBeep(800, 0.04);
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
    
    setCount(next);
  };

  const handleReset = () => {
    playBeep(400, 0.1);
    setCount(0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await axios.post("/api/spiritual/dhikr", { dhikrCount: count });
      playBeep(1000, 0.15);
      onMutation();
    } catch (err: any) {
      console.error("Failed to save dhikr count", err);
      setError("حدث خطأ أثناء حفظ الأذكار. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = count !== currentCount;

  return (
    <div className="bg-[#151515] border border-neutral-800 hover:border-[#C9A84C]/40 transition-all duration-200 rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
      
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-lg text-white">عداد الأذكار اليومي</h3>
              <p className="text-xs text-gray-500 font-normal">تابع وردك اليومي من الأذكار والتسبيح</p>
            </div>
          </div>
          {hasUnsavedChanges && (
            <span className="text-xs bg-[#151515] text-[#C9A84C] border border-[#C9A84C]/20 px-2.5 py-1 rounded-full animate-pulse">
              تعديل غير محفوظ
            </span>
          )}
        </div>

        {/* Traditional Dhikr Quick Selector */}
        <div className="mb-6">
          <label className="block text-xs text-gray-400 font-normal mb-2">اختر الذكر للتركيز عليه:</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {dhikrPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveDhikrIndex(idx);
                  playBeep(600, 0.03);
                }}
                className={`text-xs px-3.5 py-2 rounded-xl transition-all duration-200 shrink-0 border ${
                  activeDhikrIndex === idx
                    ? "bg-[#C9A84C] text-[#0A0A0A] border-none font-bold"
                    : "bg-[#0A0A0A] text-gray-400 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                {phrase.text} ({phrase.target})
              </button>
            ))}
          </div>
        </div>

        {/* Core Tasbih Display Counter */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative mb-2">
            <p className="text-[15px] font-bold text-[#C9A84C] h-6 text-center transition-all duration-300">
              {dhikrPhrases[activeDhikrIndex].desc}
            </p>
          </div>

          {/* Large tactile counting ring */}
          <button
            onClick={() => handleIncrement(1)}
            className="w-48 h-48 rounded-full bg-[#0A0A0A] border-2 border-neutral-800 hover:border-[#C9A84C] active:scale-95 transition-all duration-150 flex flex-col items-center justify-center relative cursor-pointer group/tasbih select-none"
            id="tasbih-main-button"
          >
            <div className="absolute inset-2 rounded-full border border-dashed border-neutral-800 group-hover/tasbih:border-[#C9A84C]/20 transition-colors" />
            <span className="text-5xl font-extrabold text-white tracking-wider font-mono">
              {count}
            </span>
            <span className="text-[11px] text-gray-500 mt-2 tracking-widest font-bold group-hover/tasbih:text-[#C9A84C] transition-colors">
              اضغط للتسبيح
            </span>
          </button>

          {/* Stepper controls & Quick Add buttons */}
          <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
            <button
              onClick={() => handleIncrement(-1)}
              disabled={count === 0}
              className="w-12 h-12 rounded-xl bg-[#0A0A0A] border border-neutral-800 hover:border-red-500/40 text-gray-400 hover:text-red-400 active:scale-90 transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
              title="تقليل 1"
            >
              <Minus className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <button
              onClick={() => handleIncrement(33)}
              className="flex-1 h-12 rounded-xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#C9A84C]/40 text-xs font-semibold text-gray-300 hover:text-[#C9A84C] active:scale-95 transition-all text-center flex items-center justify-center"
            >
              +٣٣
            </button>

            <button
              onClick={() => handleIncrement(100)}
              className="flex-1 h-12 rounded-xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#C9A84C]/40 text-xs font-semibold text-gray-300 hover:text-[#C9A84C] active:scale-95 transition-all text-center flex items-center justify-center"
            >
              +١٠٠
            </button>

            <button
              onClick={handleReset}
              disabled={count === 0}
              className="w-12 h-12 rounded-xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#C9A84C]/40 text-gray-400 hover:text-[#C9A84C] active:scale-90 transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
              title="إعادة ضبط العداد"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
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
              حفظ الورد الحالي ({count})
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              تم مزامنة الورد الحالي بنجاح
            </>
          )}
        </button>
      </div>
    </div>
  );
}
