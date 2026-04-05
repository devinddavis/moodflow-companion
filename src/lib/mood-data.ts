export const MOODS = [
  { key: 'struggling', emoji: '😔', label: 'Struggling', score: 10 },
  { key: 'low', emoji: '😟', label: 'Low', score: 30 },
  { key: 'neutral', emoji: '😐', label: 'Neutral', score: 50 },
  { key: 'good', emoji: '🙂', label: 'Good', score: 70 },
  { key: 'great', emoji: '😄', label: 'Great', score: 90 },
] as const;

export type MoodKey = typeof MOODS[number]['key'];

export interface MoodEntry {
  id?: string;
  userId?: string;
  createdAt: string;
  moodKey: MoodKey;
  moodEmoji: string;
  moodLabel: string;
  energy: number;
  stress: number;
  focus: number;
  motivation: number;
  aiQuote?: string;
  aiAffirmations?: string[];
}

export interface UserPreferences {
  contentTone: 'warm' | 'playful' | 'calm';
  notificationsEnabled: boolean;
  reminderTime: string;
  eveningAffirmations: boolean;
  showProductivity: boolean;
  showSelfCare: boolean;
  showInsights: boolean;
  saveHistory: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  contentTone: 'warm',
  notificationsEnabled: true,
  reminderTime: '09:00',
  eveningAffirmations: false,
  showProductivity: true,
  showSelfCare: true,
  showInsights: true,
  saveHistory: true,
};

export const SUGGESTIONS: Record<string, Array<{ emoji: string; category: string; title: string; description: string }>> = {
  struggling: [
    { emoji: '🌿', category: 'Self-Care', title: 'Take a Gentle Walk', description: '5–10 minutes outside can shift your perspective.' },
    { emoji: '☕', category: 'Comfort', title: 'Warm Drink & Rest', description: 'Give yourself full permission to slow down today.' },
    { emoji: '📔', category: 'Reflection', title: 'Journal 3 Gratitudes', description: 'Even tiny ones count — this rewires your focus.' },
  ],
  low: [
    { emoji: '🌿', category: 'Self-Care', title: 'Take a Gentle Walk', description: '5–10 minutes outside can shift your perspective.' },
    { emoji: '☕', category: 'Comfort', title: 'Warm Drink & Rest', description: 'Give yourself full permission to slow down today.' },
    { emoji: '📔', category: 'Reflection', title: 'Journal 3 Gratitudes', description: 'Even tiny ones count — this rewires your focus.' },
  ],
  neutral: [
    { emoji: '📋', category: 'Organize', title: 'Tidy Your Workspace', description: 'A clear space creates a clearer mind.' },
    { emoji: '✅', category: 'Productivity', title: 'Pick One Priority Task', description: 'One completed item builds momentum for the day.' },
    { emoji: '🧘', category: 'Mindfulness', title: '5-Min Stretch Break', description: 'Release tension and reset your body.' },
  ],
  good: [
    { emoji: '🚀', category: 'Focus', title: 'Tackle a Priority Task', description: 'Your energy is elevated — use it for something meaningful.' },
    { emoji: '🎨', category: 'Creative', title: 'Start a Creative Project', description: 'Harness your good mood into something lasting.' },
    { emoji: '📅', category: 'Planning', title: "Plan Tomorrow's Goals", description: 'Ride this clarity to set yourself up for success.' },
  ],
  great: [
    { emoji: '🚀', category: 'Focus', title: 'Tackle a Priority Task', description: 'Your energy is elevated — use it for something meaningful.' },
    { emoji: '🎨', category: 'Creative', title: 'Start a Creative Project', description: 'Harness your good mood into something lasting.' },
    { emoji: '📅', category: 'Planning', title: "Plan Tomorrow's Goals", description: 'Ride this clarity to set yourself up for success.' },
  ],
};

export const INSIGHT_CARDS = [
  {
    category: 'Psychology',
    emoji: '🧠',
    title: 'The Mood-Memory Connection',
    body: "Your brain stores memories differently depending on your emotional state. When you're in a positive mood, you're more likely to recall positive past experiences — a phenomenon called mood-congruent memory.",
    tag: 'Cognitive Science',
    colorClass: 'lavender-pale',
  },
  {
    category: 'Wellness Tip',
    emoji: '🌿',
    title: 'Box Breathing Resets Your Nervous System',
    body: 'Inhale 4 seconds, hold 4, exhale 4, hold 4. This technique is used by Navy SEALs to stay calm under pressure. Just 4 rounds can measurably lower your heart rate and stress hormones.',
    tag: 'Try It Now',
    colorClass: 'mint-pale',
  },
  {
    category: 'Fun Fact',
    emoji: '☀️',
    title: 'Sunlight Boosts Serotonin in 15 Minutes',
    body: "Even on a cloudy day, spending 15 minutes outside can increase your brain's serotonin production — your natural mood stabilizer.",
    tag: 'Science-Backed',
    colorClass: 'yellow-pale',
  },
  {
    category: 'Psychology',
    emoji: '🧠',
    title: 'The 90-Second Rule for Emotions',
    body: "Neuroscientist Dr. Jill Bolte Taylor discovered that the physiological response to any emotion lasts just 90 seconds. After that, it's thoughts — not chemistry — keeping the feeling alive.",
    tag: 'Neuroscience',
    colorClass: 'lavender-pale',
  },
  {
    category: 'Wellness Tip',
    emoji: '🌿',
    title: 'Cold Water on Your Face Triggers the Dive Reflex',
    body: 'Splashing cold water on your face activates your mammalian dive reflex, which immediately slows your heart rate. A fast, free way to reduce acute anxiety.',
    tag: 'Quick Reset',
    colorClass: 'mint-pale',
  },
  {
    category: 'Fun Fact',
    emoji: '☀️',
    title: 'Smiling Tricks Your Brain into Feeling Happier',
    body: 'The facial feedback hypothesis shows that the physical act of smiling — even a forced one — can slightly improve your mood by triggering associated neural pathways.',
    tag: 'Mind-Body',
    colorClass: 'yellow-pale',
  },
];

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
