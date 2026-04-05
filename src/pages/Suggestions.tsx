import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SUGGESTIONS } from '@/lib/mood-data';
import { getUser } from '@/lib/mood-store';

export default function Suggestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const state = location.state as { moodKey?: string; moodLabel?: string; moodEmoji?: string; energy?: number; stress?: number; focus?: number; motivation?: number } | null;

  if (!user || !state?.moodKey) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const suggestions = SUGGESTIONS[state.moodKey] || SUGGESTIONS.neutral;

  // Simple rule-based quote generation (fallback without AI)
  const quotes: Record<string, string> = {
    struggling: "Even the smallest step forward is a victory — you're stronger than you know right now.",
    low: "This moment is just a chapter, not your whole story. Gentleness with yourself today is not weakness — it's wisdom.",
    neutral: "Steady ground is fertile ground. You have the calm clarity right now to plant something meaningful.",
    good: "Your positive energy today is a gift — share it generously and it will multiply in ways you can't imagine.",
    great: "You're radiating the kind of energy that makes everything possible. Channel it into what matters most to you.",
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold">
          ← Back
        </button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral-pale text-foreground text-sm font-semibold">
          {state.moodEmoji} {state.moodLabel}
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mt-4 mb-1">
          Here's your day, {user.name} ✨
        </h1>
        <p className="text-muted-foreground mb-8">Personalized to how you're feeling right now</p>
      </motion.div>

      {/* Suggestion cards */}
      <div className="space-y-4 mb-8">
        {suggestions.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-5 card-shadow border border-border flex items-center gap-4 hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-coral-pale flex items-center justify-center text-2xl flex-shrink-0">
              {s.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.category}</p>
              <p className="font-display font-bold text-foreground mt-0.5">{s.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
            </div>
            <span className="text-muted-foreground text-lg">›</span>
          </motion.div>
        ))}
      </div>

      {/* AI Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl gradient-lavender p-8 card-shadow-float mb-6"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/60 mb-3">✨ Your Personalized Quote</p>
        <p className="font-display text-xl italic text-primary-foreground leading-relaxed">
          {quotes[state.moodKey] || quotes.neutral}
        </p>
      </motion.div>

      {/* Affirmation teaser */}
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
