import { MoodEntry, UserPreferences, DEFAULT_PREFERENCES } from './mood-data';

// Local storage-based store for now (will migrate to Supabase later)
const ENTRIES_KEY = 'moodflow_entries';
const PREFS_KEY = 'moodflow_preferences';
const USER_KEY = 'moodflow_user';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export function getUser(): AppUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: AppUser | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function getEntries(): MoodEntry[] {
  const raw = localStorage.getItem(ENTRIES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addEntry(entry: MoodEntry) {
  const entries = getEntries();
  entries.unshift({ ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getTodayEntry(): MoodEntry | null {
  const today = new Date().toDateString();
  return getEntries().find(e => new Date(e.createdAt).toDateString() === today) || null;
}

export function getYesterdayEntry(): MoodEntry | null {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toDateString();
  return getEntries().find(e => new Date(e.createdAt).toDateString() === yStr) || null;
}

export function getStreak(): number {
  const entries = getEntries();
  if (!entries.length) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    if (entries.some(e => new Date(e.createdAt).toDateString() === ds)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getWeeklyAverage(): number | null {
  const entries = getEntries();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEntries = entries.filter(e => new Date(e.createdAt) >= weekAgo);
  if (!weekEntries.length) return null;
  const scores = weekEntries.map(e => {
    const moodScores: Record<string, number> = { struggling: 10, low: 30, neutral: 50, good: 70, great: 90 };
    return moodScores[e.moodKey] || 50;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function getPreferences(): UserPreferences {
  const raw = localStorage.getItem(PREFS_KEY);
  return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: UserPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function clearAllData() {
  localStorage.removeItem(ENTRIES_KEY);
  localStorage.removeItem(PREFS_KEY);
}

export function updateTodayEntry(patch: Partial<MoodEntry>) {
  const entries = getEntries();
  const today = new Date().toDateString();
  const idx = entries.findIndex(e => new Date(e.createdAt).toDateString() === today);
  if (idx === -1) return;
  entries[idx] = { ...entries[idx], ...patch };
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}
