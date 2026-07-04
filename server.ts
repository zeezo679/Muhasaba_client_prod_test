import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Setup express JSON parser
app.use(express.json());

// Database file setup
const DB_FILE = path.join(process.cwd(), "db.json");

interface DBState {
  users: Array<{ name: string; email: string; password; gender?: number | null }>;
  dailyLogs: Record<string, Record<string, any>>; // keyed by email, then date (YYYY-MM-DD)
  prayers: Record<string, Record<string, any[]>>;  // keyed by email, then date (YYYY-MM-DD)
}

let db: DBState = {
  users: [],
  dailyLogs: {},
  prayers: {}
};

function createDefaultDB(): DBState {
  return {
    users: [],
    dailyLogs: {},
    prayers: {}
  };
}

function normalizeDBState(value: Partial<DBState> | null | undefined): DBState {
  return {
    users: Array.isArray(value?.users) ? value.users : [],
    dailyLogs: value?.dailyLogs && typeof value.dailyLogs === "object" ? value.dailyLogs : {},
    prayers: value?.prayers && typeof value.prayers === "object" ? value.prayers : {}
  };
}

// Load database
function loadDB() {
  try {
    let parsedDB: Partial<DBState> | null = null;

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf8");
      if (data.trim()) {
        parsedDB = JSON.parse(data);
      }
    }

    db = normalizeDBState(parsedDB ?? createDefaultDB());
    
    // Ensure structure is correct
    if (!db.users) db.users = [];
    if (!db.dailyLogs) db.dailyLogs = {};
    if (!db.prayers) db.prayers = {};

    if (!fs.existsSync(DB_FILE) || !parsedDB) {
      saveDB();
    }
    
    // Seed default user if empty
    if (db.users.length === 0) {
      db.users.push({
        name: "عبد الله محمد",
        email: "demo@muhasabaa.com",
        password: "password123",
        gender: 1
      });
      saveDB();
    }

    // Ensure a fresh clean account is also available for Ziad
    const hasZiad = db.users.some(u => u.email === "ziad@muhasabaa.com");
    if (!hasZiad) {
      db.users.push({
        name: "زياد عبد الله",
        email: "ziad@muhasabaa.com",
        password: "password123",
        gender: 1
      });
      saveDB();
    }

    // Ensure another fresh account is available
    const hasAhmed = db.users.some(u => u.email === "ahmed@muhasabaa.com");
    if (!hasAhmed) {
      db.users.push({
        name: "أحمد علي",
        email: "ahmed@muhasabaa.com",
        password: "password123",
        gender: 1
      });
      saveDB();
    }
  } catch (err) {
    console.error("Error loading database:", err);
    db = createDefaultDB();
    saveDB();
  }
}

// Save database
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

// Initialize database
loadDB();

// Helper to get standard date string in YYYY-MM-DD format
function getTodayDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to generate base64url standard JWT tokens (header.payload.signature)
function generateTokens(email: string, name: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64url');
  
  const payloadAccess = Buffer.from(JSON.stringify({
    email,
    name,
    sub: email,
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  })).toString('base64url');
  
  const payloadRefresh = Buffer.from(JSON.stringify({
    email,
    name,
    sub: email,
    exp: Math.floor(Date.now() / 1000) + (3600 * 24 * 30) // 30 days
  })).toString('base64url');

  const accessToken = `${header}.${payloadAccess}.dummy_signature`;
  const refreshToken = `${header}.${payloadRefresh}.dummy_signature`;

  return { accessToken, refreshToken };
}

// JWT authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const payloadBase64 = parts[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({ error: "Token expired" });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Recalculates stats & scores to maintain consistent totals
function calculateDailyStats(email: string, dateStr: string) {
  if (!db.dailyLogs[email]) db.dailyLogs[email] = {};
  if (!db.dailyLogs[email][dateStr]) {
    db.dailyLogs[email][dateStr] = {
      dhikrCount: 0,
      quranPages: 0,
      gymMinutes: 0,
      screenTimeHours: 0,
      prayedQiyam: false,
      sleepHours: 0,
      deepWorkHours: 0,
      earnedScore: 0,
      maximumScore: 455,
      percentage: 0,
      calculatedAt: new Date().toISOString()
    };
  }

  if (!db.prayers[email]) db.prayers[email] = {};
  if (!db.prayers[email][dateStr]) {
    db.prayers[email][dateStr] = [
      { id: "fajr_id", prayerName: "Fajr", status: null, prayedSunnah: null, score: 0, maximumScore: 30, isLogged: false },
      { id: "dhuhr_id", prayerName: "Dhuhr", status: null, prayedSunnah: null, score: 0, maximumScore: 30, isLogged: false },
      { id: "asr_id", prayerName: "Asr", status: null, prayedSunnah: null, score: 0, maximumScore: 25, isLogged: false },
      { id: "maghrib_id", prayerName: "Maghrib", status: null, prayedSunnah: null, score: 0, maximumScore: 30, isLogged: false },
      { id: "isha_id", prayerName: "Isha", status: null, prayedSunnah: null, score: 0, maximumScore: 30, isLogged: false }
    ];
  }

  const log = db.dailyLogs[email][dateStr];
  const userPrayers = db.prayers[email][dateStr];

  let prayerEarned = 0;
  let prayerMax = 0;

  userPrayers.forEach((p: any) => {
    let pScore = 0;
    const isAsr = p.prayerName === "Asr";
    const pMax = isAsr ? 25 : 30;
    
    if (p.isLogged && p.status) {
      if (p.status === "InJamaah") {
        pScore += 25;
      } else if (p.status === "AtHome") {
        pScore += 15;
      } else if (p.status === "Missed") {
        pScore += 0;
      }
      
      if (!isAsr && p.prayedSunnah) {
        pScore += 5;
      }
    }
    
    p.score = pScore;
    p.maximumScore = pMax;
    prayerEarned += pScore;
    prayerMax += pMax;
  });

  const dhikrScore = Math.min(100, log.dhikrCount || 0);
  const quranScore = Math.min(100, (log.quranPages || 0) * 5);
  const gymScore = Math.min(100, (log.gymMinutes || 0) * 2);
  const qiyamScore = log.prayedQiyam ? 10 : 0;

  const totalEarned = prayerEarned + dhikrScore + quranScore + gymScore + qiyamScore;
  const totalMax = 455; // 145 + 100 + 100 + 100 + 10 = 455

  log.earnedScore = totalEarned;
  log.maximumScore = totalMax;
  log.percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
  log.calculatedAt = new Date().toISOString();

  saveDB();
}

// Status translation mappings
const intToPrayerName = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const intToStatus: Record<number, string> = {
  1: "InJamaah",
  2: "AtHome",
  4: "Missed"
};

// ==========================================
// REST API Routes
// ==========================================

// Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, gender } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "الرجاء إدخال الاسم والبريد الإلكتروني وكلمة المرور" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = db.users.find(u => u.email === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: "البريد الإلكتروني مسجل بالفعل" });
  }

  const newUser = { name: name.trim(), email: normalizedEmail, password, gender: gender || 1 };
  db.users.push(newUser);
  saveDB();

  const { accessToken, refreshToken } = generateTokens(newUser.email, newUser.name);
  res.json({ accessToken, refreshToken });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email === normalizedEmail && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  const { accessToken, refreshToken } = generateTokens(user.email, user.name);
  res.json({ accessToken, refreshToken });
});

// Refresh Token
app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const parts = refreshToken.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: "Invalid token format" });
    }
    
    const payloadBase64 = parts[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({ error: "Refresh token expired" });
    }

    const user = db.users.find(u => u.email === payload.email);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const tokens = generateTokens(user.email, user.name);
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.json({ status: "ok" });
});

// Get today's daily log
app.get("/api/daily-log/today", authenticateToken, (req: any, res) => {
  const email = req.user.email;
  const dateStr = getTodayDateString();
  calculateDailyStats(email, dateStr);
  res.json(db.dailyLogs[email][dateStr]);
});

// Get today's prayers
app.get("/api/prayers/today", authenticateToken, (req: any, res) => {
  const email = req.user.email;
  const dateStr = getTodayDateString();
  calculateDailyStats(email, dateStr);
  res.json(db.prayers[email][dateStr]);
});

// Save Dhikr
app.post("/api/spiritual/dhikr", authenticateToken, (req: any, res) => {
  const { dhikrCount } = req.body;
  const email = req.user.email;
  const dateStr = getTodayDateString();

  if (typeof dhikrCount !== "number" || dhikrCount < 0) {
    return res.status(400).json({ error: "Invalid count" });
  }

  if (!db.dailyLogs[email]) db.dailyLogs[email] = {};
  if (!db.dailyLogs[email][dateStr]) {
    calculateDailyStats(email, dateStr);
  }

  db.dailyLogs[email][dateStr].dhikrCount = dhikrCount;
  calculateDailyStats(email, dateStr);

  res.json({ success: true });
});

// Save Quran Pages
app.post("/api/spiritual/quran", authenticateToken, (req: any, res) => {
  const { pages } = req.body;
  const email = req.user.email;
  const dateStr = getTodayDateString();

  if (typeof pages !== "number" || pages < 0) {
    return res.status(400).json({ error: "Invalid pages count" });
  }

  if (!db.dailyLogs[email]) db.dailyLogs[email] = {};
  if (!db.dailyLogs[email][dateStr]) {
    calculateDailyStats(email, dateStr);
  }

  db.dailyLogs[email][dateStr].quranPages = pages;
  calculateDailyStats(email, dateStr);

  res.json({ success: true });
});

// Log Prayer
app.post("/api/prayers", authenticateToken, (req: any, res) => {
  const { prayerName, status, prayedSunnah } = req.body;
  const email = req.user.email;
  const dateStr = getTodayDateString();

  const nameStr = intToPrayerName[prayerName];
  const statusStr = intToStatus[status];

  if (!nameStr || !statusStr) {
    return res.status(400).json({ error: "Invalid prayer data" });
  }

  if (!db.prayers[email]) db.prayers[email] = {};
  if (!db.prayers[email][dateStr]) {
    calculateDailyStats(email, dateStr);
  }

  const userPrayers = db.prayers[email][dateStr];
  const p = userPrayers.find((item: any) => item.prayerName === nameStr);
  if (!p) {
    return res.status(404).json({ error: "Prayer not found" });
  }

  if (p.isLogged) {
    return res.status(409).json({ error: "هذه الصلاة مسجلة بالفعل اليوم." });
  }

  p.status = statusStr;
  p.prayedSunnah = nameStr === "Asr" ? null : !!prayedSunnah;
  p.isLogged = true;

  calculateDailyStats(email, dateStr);

  res.json({ success: true });
});

// Setup Vite Dev Server / Static Middleware
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap();
