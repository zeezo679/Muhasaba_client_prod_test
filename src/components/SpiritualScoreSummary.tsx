import React from "react";
import { Award, Compass, Heart, Star, Calendar } from "lucide-react";

interface SpiritualScoreSummaryProps {
  earnedScore: number;
  maximumScore: number;
  percentage: number;
  calculatedAt: string;
}

export default function SpiritualScoreSummary({
  earnedScore,
  maximumScore,
  percentage,
  calculatedAt
}: SpiritualScoreSummaryProps) {
  // SVG Ring calculation
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Ensure percentage stays between 0 and 100
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;

  // Format date helper to beautiful Arabic format
  const formatArabicDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    } catch (e) {
      return "اليوم";
    }
  };

  const getStatusMessage = (p: number) => {
    if (p === 0) {
      return "ابدأ يومك بالأذكار والتلاوة لتشحن طاقتك الإيمانية وروحك!";
    } else if (p < 30) {
      return "خطوة أولى ممتازة! استمر في ذكر الله وقراءة وريدك اليومي لرفع رصيدك.";
    } else if (p < 70) {
      return "جهد رائع! توازن إيماني متميز، استمر بالتقدم لتحقيق كامل الورد.";
    } else if (p < 100) {
      return "همّة عالية ترفع المقامات! أنت قريب جداً من إنهاء هدفك الإيماني لليوم.";
    } else {
      return "الحمد لله! لقد أتممت الورد المستهدف كاملاً اليوم بنجاح وامتياز! هنيئاً لك 🌟";
    }
  };

  return (
    <div className="bg-[#151515] border border-neutral-800 rounded-xl p-6 md:p-8 relative overflow-hidden group">
      
      {/* Pattern Lines overlay */}
      <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#C9A84C_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center gap-8 justify-between">
        {/* Core summary details */}
        <div className="flex-1 text-right w-full md:w-auto">
          <div className="flex items-center gap-2 text-[#C9A84C] text-xs font-semibold mb-3 bg-[#151515] w-fit px-3 py-1.5 rounded-full border border-[#C9A84C]/20">
            <Calendar className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
            <span>{formatArabicDate(calculatedAt)}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            المحاسبة اليومية الشاملة
          </h2>
          
          <p className="text-gray-400 text-sm font-normal leading-relaxed mb-6 max-w-lg">
            {getStatusMessage(percentage)}
          </p>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
              <Award className="w-5 h-5 text-[#C9A84C] shrink-0" strokeWidth={1.5} />
              <div>
                <span className="text-[11px] text-gray-500 block font-normal">النقاط المكتسبة</span>
                <span className="text-lg font-bold text-white font-mono">
                  {earnedScore} <span className="text-xs text-gray-500 font-normal">/ {maximumScore}</span>
                </span>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
              <Star className="w-5 h-5 text-[#C9A84C] shrink-0" strokeWidth={1.5} />
              <div>
                <span className="text-[11px] text-gray-500 block font-normal">النسبة المئوية</span>
                <span className="text-lg font-bold text-[#C9A84C] font-mono">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative flex items-center justify-center">
            
            <svg width="160" height="160" className="transform -rotate-90">
              {/* Outer Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#0A0A0A"
                strokeWidth={strokeWidth}
              />
              
              {/* Animated Inner Value Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#C9A84C"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content overlay */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-white tracking-tight font-mono">
                {percentage}%
              </span>
              <span className="text-[10px] font-bold text-[#C9A84C] mt-0.5 tracking-wider">
                رصيد التقدم
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#C9A84C] font-semibold bg-[#0A0A0A] px-3.5 py-1.5 rounded-full border border-neutral-800">
            <Heart className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
            <span>نورٌ على نور</span>
          </div>
        </div>
      </div>
    </div>
  );
}
