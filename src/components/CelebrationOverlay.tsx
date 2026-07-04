import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Award } from "lucide-react";

// Arabic celebratory titles
const CELEBRATION_TITLES = [
  "تجاوزت المنتصف!",
  "رائع جداً! نصف يومك امتلأ بالإنجاز والخير.",
  "إنجاز متميز! لقد اجتزت عتبة الـ 50٪ بنجاح.",
  "خطوة بخطوة! ها قد تجاوزت نصف اليوم بإنتاجية عالية.",
  "عمل رائع! تجاوزت منتصف الطريق اليوم."
];

// Arabic non-religious proverbs on consistency/effort
const MOTIVATIONAL_PHRASES = [
  "الاستمرار خير من الكمال، والخطوة الصغيرة المستمرة تصنع المعجزات.",
  "الإنتاجية ليست بالسرعة، بل بالاتجاه الصحيح والثبات اليومي.",
  "النجاح هو مجموع الجهود الصغيرة المتكررة يوماً بعد يوم.",
  "قيمة عملك تكمن في التزامك به، فالمداومة على العادات تصنع المستقبل.",
  "كل مجهود تبذله اليوم هو استثمار في غدٍ أكثر تنظيماً ونجاحاً.",
  "العادات اليومية هي اللبنات الأساسية لبناء شخصيتك ومستقبلك.",
  "لا تستهن بالخطوات البسيطة، فالنهر العظيم يتكون من قطرات متتابعة.",
  "الانضباط الذاتي هو الجسر بين وضع الأهداف وتحقيق الإنجازات.",
  "تركيزك اليوم وسعيك الهادئ سيؤتي ثماره غداً بكل تأكيد.",
  "تحدي الأمس والانتصار عليه هو أعظم إنجاز يمكنك تحقيقه اليوم."
];

interface CelebrationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  percentage: number;
}

export default function CelebrationOverlay({ isOpen, onClose, percentage }: CelebrationOverlayProps) {
  // Select title and quote once per mount/trigger
  const title = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * CELEBRATION_TITLES.length);
    return CELEBRATION_TITLES[randomIndex];
  }, [isOpen]);

  const quote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    return MOTIVATIONAL_PHRASES[randomIndex];
  }, [isOpen]);

  // Generate lightweight particles config
  const particles = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = 80 + Math.random() * 180;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = 6 + Math.random() * 8;
      const colors = ["#C9A84C", "#D4AF37", "#F2F1E8", "#9F802D", "#FFFFFF"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.3;
      const duration = 1.2 + Math.random() * 1.5;
      const rotate = Math.random() * 360 + (Math.random() > 0.5 ? 360 : -360);
      return { id: i, x, y, size, color, delay, duration, rotate };
    });
  }, [isOpen]);

  // Play celebration sound effect upon open and do not auto-dismiss
  useEffect(() => {
    if (isOpen) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const now = ctx.currentTime;
          // Uplifting, sparkling golden arpeggio: F5 (698.46 Hz), A5 (880.00 Hz), C6 (1046.50 Hz), E6 (1318.51 Hz)
          const notes = [698.46, 880.00, 1046.50, 1318.51];
          
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.62);
          });
        }
      } catch (e) {
        // Silently catch audio block errors
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Ambient Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Particle Burst Container */}
          <div className="absolute pointer-events-none w-1 h-1 flex items-center justify-center z-10">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.3, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: [1, 1, 0],
                  scale: [0.3, 1.2, 0.5],
                  rotate: p.rotate,
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.1, 0.8, 0.3, 1], // Custom decel cubic-bezier
                }}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: p.color === "#C9A84C" || p.color === "#D4AF37" ? "0 0 10px rgba(201,168,76,0.5)" : "none",
                }}
              />
            ))}
          </div>

          {/* Centered Celebration Dialog with Spring Physics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="relative w-full max-w-md bg-[#121212] border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl overflow-hidden z-20"
            dir="rtl"
          >
            {/* Elegant Top Decorative Border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 text-gray-500 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Decorative Ambient Light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Icon Shield */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C] mb-6 relative shadow-[0_0_20px_rgba(201,168,76,0.15)]">
              <Sparkles className="w-8 h-8 animate-pulse" strokeWidth={1.5} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] font-bold text-black border border-black animate-bounce">
                ★
              </div>
            </div>

            {/* Congratulations Header */}
            <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold bg-[#C9A84C]/10 px-3 py-1 rounded-full border border-[#C9A84C]/20 font-mono inline-block mb-3">
              إنجاز يومي
            </span>

            <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
              {title}
            </h3>

            {/* Percentage Display Ring and Stat */}
            <div className="bg-[#181818] border border-neutral-800/80 rounded-xl p-4 mb-6 relative">
              <div className="flex items-center justify-center gap-3">
                <div className="text-3xl font-extrabold text-[#C9A84C] tracking-tight">
                  {percentage}%
                </div>
                <div className="h-6 w-px bg-neutral-800" />
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">النسبة الحالية</div>
                  <div className="text-xs text-gray-300 font-medium mt-0.5">لقد تمكنت من ملء نصف ميزان العادات اليوم!</div>
                </div>
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="text-sm text-gray-400 font-normal leading-relaxed max-w-sm mx-auto mb-6 bg-neutral-900/40 p-4 rounded-xl border border-neutral-800/40 relative">
              <span className="absolute -top-3 right-4 bg-[#121212] px-2 text-[10px] text-gray-500 font-medium">
                حكمة اليوم
              </span>
              "{quote}"
            </div>

            {/* Dismiss Button */}
            <button
              onClick={onClose}
              className="w-full h-11 bg-gradient-to-r from-[#C9A84C] to-[#E3C268] text-black font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#C9A84C]/10 text-sm"
            >
              <Award className="w-4 h-4 text-black" strokeWidth={1.5} />
              <span>متابعة السعي</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
