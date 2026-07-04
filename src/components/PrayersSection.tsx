import React, { useState } from "react";
import axios from "axios";
import { Check, Compass, AlertCircle, RefreshCw, Star, Info } from "lucide-react";
import { Prayer } from "../types";

interface PrayersSectionProps {
  prayers: Prayer[];
  onMutation: () => void;
}

const prayerNameToInt: Record<string, number> = {
  Fajr: 0,
  Dhuhr: 1,
  Asr: 2,
  Maghrib: 3,
  Isha: 4,
};

const statusToInt: Record<string, number> = {
  InJamaah: 1,
  AtHome: 2,
  Missed: 4,
};

const prayerArabicNames: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const statusArabicNames: Record<string, string> = {
  InJamaah: "في جماعة",
  AtHome: "منفرداً / في البيت",
  Missed: "لم تُصلَّ في وقتها",
};

export default function PrayersSection({ prayers, onMutation }: PrayersSectionProps) {
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [prayedSunnah, setPrayedSunnah] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleExpand = (prayerName: string, isLogged: boolean) => {
    if (isLogged) return; // Disallow further edits on already logged prayers
    if (expandedPrayer === prayerName) {
      setExpandedPrayer(null);
    } else {
      setExpandedPrayer(prayerName);
      setSelectedStatus("InJamaah"); // Default selected status
      setPrayedSunnah(false);
      setError(null);
    }
  };

  const handleSubmitLog = async (prayerName: string) => {
    if (!selectedStatus) {
      setError("الرجاء اختيار حالة الصلاة أولاً.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const prayerInt = prayerNameToInt[prayerName];
    const statusIntVal = statusToInt[selectedStatus];

    if (prayerInt === undefined || statusIntVal === undefined) {
      setError("حدث خطأ في قراءة بيانات الصلاة.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("/api/prayers", {
        prayerName: prayerInt,
        status: statusIntVal,
        prayedSunnah,
      });

      // Clear expanded state
      setExpandedPrayer(null);
      // Refetch parent state
      onMutation();
    } catch (err: any) {
      console.error("Failed to log prayer", err);
      if (err.response && err.response.status === 409) {
        setError("هذه الصلاة مسجلة بالفعل اليوم.");
      } else {
        setError(err.response?.data?.error || "فشل تسجيل الصلاة. الرجاء المحاولة لاحقاً.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#151515] border border-neutral-800 rounded-xl p-6 md:p-8 relative overflow-hidden" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Compass className="w-5 h-5 text-[#C9A84C]" strokeWidth={1.5} />
        <div>
          <h3 className="font-bold text-lg text-white">سجل الصلوات الخمس اليومي</h3>
          <p className="text-xs text-gray-500 font-normal">حافظ على صلاتك في وقتها وسننها الراتبة</p>
        </div>
      </div>

      {/* Prayer Cards Container */}
      <div className="space-y-3">
        {prayers.map((prayer) => {
          const isExpanded = expandedPrayer === prayer.prayerName;
          const arabicName = prayerArabicNames[prayer.prayerName] || prayer.prayerName;
          
          return (
            <div
              key={prayer.prayerName}
              className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                prayer.isLogged
                  ? "bg-[#0c0c0c] border-neutral-800/60 opacity-85"
                  : isExpanded
                  ? "bg-[#181818] border-[#C9A84C]/50"
                  : "bg-[#0A0A0A] border-neutral-800 hover:border-neutral-700 cursor-pointer"
              }`}
              onClick={() => handleToggleExpand(prayer.prayerName, prayer.isLogged)}
            >
              {/* Row content */}
              <div className="p-4 flex items-center justify-between min-h-[4.5rem]">
                <div className="flex items-center gap-3">
                  {/* Status Indicator circle */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      prayer.isLogged
                        ? "bg-[#C9A84C] border-none text-black"
                        : "border-neutral-700 group-hover:border-neutral-600"
                    }`}
                  >
                    {prayer.isLogged && <Check className="w-3.5 h-3.5 text-[#0A0A0A]" strokeWidth={2.5} />}
                  </div>

                  <div>
                    <h4 className="font-semibold text-base text-white">{arabicName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 font-normal">
                      {prayer.isLogged ? (
                        <span className="text-[#C9A84C] font-semibold">
                          {statusArabicNames[prayer.status || ""] || prayer.status}
                          {prayer.prayedSunnah && " • مع السُنّة الراتبة"}
                        </span>
                      ) : (
                        <span>اضغط لتسجيل الصلاة</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Left actions or scores */}
                <div className="flex items-center gap-3">
                  {prayer.isLogged ? (
                    <div className="flex items-center gap-1 bg-[#151515] border border-[#C9A84C]/20 px-2.5 py-1 rounded-full text-xs text-[#C9A84C] font-mono font-bold">
                      <Star className="w-3.5 h-3.5 text-[#C9A84C]" strokeWidth={1.5} />
                      <span>+{prayer.score} <span className="text-[10px] text-gray-500 font-normal">/ {prayer.maximumScore}</span></span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#C9A84C] font-bold bg-[#151515] border border-[#C9A84C]/20 px-2.5 py-1 rounded-full font-mono">
                      مفتوح ({prayer.maximumScore}ن)
                    </span>
                  )}
                </div>
              </div>

              {/* Expandable panel for logging */}
              {isExpanded && (
                <div 
                  className="px-5 pb-5 pt-2 border-t border-neutral-800 space-y-4"
                  onClick={(e) => e.stopPropagation()} // Prevent collapse on container click
                >
                  {error && (
                    <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-2.5 text-red-300 text-xs font-normal">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" strokeWidth={1.5} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Status buttons with minimum 44px touch targets */}
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-400 font-semibold mb-1">مكان / طريقة صلاة الفريضة:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStatus("InJamaah")}
                        className={`h-12 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          selectedStatus === "InJamaah"
                            ? "bg-[#C9A84C] text-[#0A0A0A] border-none"
                            : "bg-[#0A0A0A] text-gray-400 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        في جماعة (أعلى أجر)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStatus("AtHome")}
                        className={`h-12 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          selectedStatus === "AtHome"
                            ? "bg-[#C9A84C] text-[#0A0A0A] border-none"
                            : "bg-[#0A0A0A] text-gray-400 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        منفرداً / في البيت
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStatus("Missed")}
                        className={`h-12 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          selectedStatus === "Missed"
                            ? "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20"
                            : "bg-[#0A0A0A] text-gray-400 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        فاتتني / لم تُصلَّ
                      </button>
                    </div>
                  </div>

                  {/* Sunnah toggle with minimum 44px touch target */}
                  <div className="flex items-center justify-between bg-[#0A0A0A] border border-neutral-800 rounded-xl p-3">
                    <div>
                      <h5 className="text-xs font-semibold text-white">صلاة السنّة الراتبة</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-normal">هل صليت السنن المؤكدة التابعة لهذه الفريضة؟</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPrayedSunnah(prev => !prev)}
                      className={`h-11 px-5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                        prayedSunnah
                          ? "bg-[#C9A84C] text-[#0A0A0A]"
                          : "bg-neutral-900 border border-neutral-800 text-gray-500 hover:text-gray-400"
                      }`}
                    >
                      {prayedSunnah ? "نعم، صليت السُنّة" : "لا، لم أُصلِّها"}
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSubmitLog(prayer.prayerName)}
                      disabled={isSubmitting}
                      className="flex-1 h-12 bg-[#C9A84C] text-[#0A0A0A] font-bold rounded-xl hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border-none"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                          جاري التسجيل...
                        </>
                      ) : (
                        "تسجيل الصلاة"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedPrayer(null)}
                      className="h-12 px-5 bg-neutral-900 border border-neutral-800 text-gray-400 font-bold rounded-xl hover:text-gray-300 transition-all text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
