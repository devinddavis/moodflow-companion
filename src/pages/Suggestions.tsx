import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SUGGESTIONS } from '@/lib/mood-data';
import { getUser, getTodayEntry, updateTodayEntry, getPreferences } from '@/lib/mood-store';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const fallbackQuotes: Record<string, string> = {
  struggling: "Even the smallest step forward is a victory — you're stronger than you know right now.",
  low: "This moment is just a chapter, not your whole story. Gentleness with yourself today is wisdom.",
  neutral: "Steady ground is fertile ground. You have the calm clarity to plant something meaningful today.",
  good: "Your positive energy today is a gift — share it generously and it will multiply.",
  great: "You're radiating the kind of energy that makes everything possible.",
};

export default function Suggestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const todayEntry = getTodayEntry();
  const prefs = getPreferences();
  const state = location.state as { moodKey?: string; moodLabel?: string; moodEmoji?: string; energy?: number; stress?: number; focus?: number; motivation?: number } | null;

  const moodKey = state?.moodKey || todayEntry?.moodKey;
  if (!user || !moodKey) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const moodLabel = state?.moodLabel || todayEntry?.moodLabel;
  const moodEmoji = state?.moodEmoji || todayEntry?.moodEmoji;
  const energy = state?.energy ?? todayEntry?.energy ?? 50;
  const stress = state?.stress ?? todayEntry?.stress ?? 50;
  const focus = state?.focus ?? todayEntry?.focus ?? 50;
  const motivation = state?.motivation ?? todayEntry?.motivation ?? 50;

  const [quote, setQuote] = useState<string | null>(todayEntry?.aiQuote ?? null);
  const [suggestions, setSuggestions] = useState<any[] | null>(todayEntry?.aiSuggestions ?? null);
  const [loadingQuote, setLoadingQuote] = useState(!todayEntry?.aiQuote);
  const [loadingSugs, setLoadingSugs] = useState(!todayEntry?.aiSuggestions);

  useEffect(() => {
    const payload = {
      userName: user.name, moodKey, moodLabel, energy, stress, focus, motivation,
      tone: prefs.contentTone || 'warm',
    };

    if (!todayEntry?.aiQuote) {
      supabase.functions.invoke('ai-quote', { body: payload }).then(({ data }) => {
        const q = (data as any)?.quote || fallbackQuotes[moodKey] || fallbackQuotes.neutral;
        setQuote(q);
        updateTodayEntry({ aiQuote: q });
      }).catch(() => setQuote(fallbackQuotes[moodKey] || fallbackQuotes.neutral))
        .finally(() => setLoadingQuote(false));
    }

    if (!todayEntry?.aiSuggestions) {
      supabase.functions.invoke('ai-suggestions', {
        body: { ...payload, showProductivity: prefs.showProductivity, showSelfCare: prefs.showSelfCare, showInsights: prefs.showInsights },
      }).then(({ data }) => {
        const s = (data as any)?.suggestions;
        if (Array.isArray(s) && s.length > 0) {
          setSuggestions(s);
          updateTodayEntry({ aiSuggestions: s });
        } else {
          setSuggestions(null);
        }
      }).catch(() => setSuggestions(null))
        .finally(() => setLoadingSugs(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fallbackSuggestions = SUGGESTIONS[moodKey] || SUGGESTIONS.neutral;
  const renderSuggestions = suggestions && suggestions.length > 0
    ? suggestions
    : fallbackSuggestions.map((s, i) => ({
        emoji: s.emoji, category: s.category, name: s.title, description: s.description,
        categoryColor: ['#8B7FCC', '#4BBDA0', '#FF6B4A'][i % 3],
        cardBackground: ['#EAE7FA', '#D1F2EB', '#FFF4C2'][i % 3],
      }));

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold">
          ← Back
        </button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral-pale text-foreground text-sm font-semibold">
          {moodEmoji} {moodLabel}
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mt-4 mb-1">
          Here's your day, {user.name} ✨
        </h1>
        <p className="text-muted-foreground mb-8">Personalized to how you're feeling right now</p>
      </motion.div>

      <div className="space-y-4 mb-8">
        {loadingSugs
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-5 card-shadow border border-border flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          : renderSuggestions.map((s, i) => (
              <motion.div
                key={s.name + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="rounded-2xl p-5 card-shadow border border-border flex items-center gap-4 hover:-translate-y-0.5 transition-transform"
                style={{ backgroundColor: s.cardBackground || 'hsl(var(--card))' }}
              >
                <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-2xl flex-shrink-0 card-shadow">
                  {s.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: s.categoryColor }}>{s.category}</p>
                  <p className="font-display font-bold text-foreground mt-0.5">{s.name}</p>
                  <p className="text-sm text-text-mid mt-0.5">{s.description}</p>
                </div>
              </motion.div>
            ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="rounded-3xl gradient-lavender p-8 card-shadow-float mb-6"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/60 mb-3">✨ Your Personalized Quote</p>
        {loadingQuote ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full bg-primary-foreground/20" />
            <Skeleton className="h-6 w-3/4 bg-primary-foreground/20" />
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="font-display text-xl italic text-primary-foreground leading-relaxed"
          >
            {quote || fallbackQuotes[moodKey] || fallbackQuotes.neutral}
          </motion.p>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/affirmations')}
        className="w-full rounded-2xl bg-lavender-pale p-6 card-shadow text-left hover:-translate-y-0.5 transition-transform"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">Today's Affirmation</p>
        <p className="font-display italic text-foreground">"You have the strength to navigate this moment with grace..."</p>
        <p className="text-sm text-primary mt-2 font-semibold">Tap to see more →</p>
      </motion.button>
    </div>
  );
}
