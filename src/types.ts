export interface DailyLog {
  dhikrCount: number;
  quranPages: number;
  gymMinutes: number;
  screenTimeHours: number;
  prayedQiyam: boolean;
  sleepHours: number;
  deepWorkHours: number;
  earnedScore: number;
  maximumScore: number;
  percentage: number;
  calculatedAt: string;
}

export interface Prayer {
  id: string | null;
  prayerName: string;       // "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"
  status: string | null;    // "InJamaah" | "AtHome" | "Missed" | null if not logged
  prayedSunnah: boolean | null;
  score: number | null;
  maximumScore: number | null;
  isLogged: boolean;
}
