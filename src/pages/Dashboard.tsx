import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUser, getTodayEntry, getYesterdayEntry, getStreak, getWeeklyAverage } from '@/lib/mood-store';
import { getGreeting, formatDate } from '@/lib/mood-data';

const exploreCards = [
  { emoji: '✨', title: 'Affirmations', desc: 'Daily words of encouragement', path: '/affirmations', bg: 'bg-lavender-pale' },
  { emoji: '🧠', title: 'Insights', desc: 'Psychology facts & tips', path: '/insights', bg: 'bg-mint-pale' },
  { emoji: '📊', title: 'Mood History', desc: 'Track your journey', path: '/history', bg: 'bg-yellow-pale' },
  { emoji: '📍', title: 'Nearby Places', desc: 'Spots for your mood', path: '/places', bg: 'bg-coral-pale' },
];

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const todayEntry = getTodayEntry();
  const yesterdayEntry = getYesterdayEntry();
  const streak = getStreak();
  const weekAvg = getWeeklyAverage();

  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Good {getGreeting()}, {user.name} 👋
        </h1>
        <p className="text-muted-foreground mt-1">{formatDate(new Date())}</p>
      </motion.div>

      {/* Badges */}
      <div className="flex flex-wrap gap-3 mt-6">
        {streak > 0 && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow-pale text-foreground text-sm font-semibold">
            🔥 {streak}-day streak
          </span>
        )}
        {weekAvg !== null && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-lavender-pale text-foreground text-sm font-semibold">
            📊 Week avg: {weekAvg}%
          </span>
        )}
      </div>

      {/* Check-in or Today's mood */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8">
        {todayEntry ? (
          <div className="rounded-3xl gradient-dark p-8 card-shadow-float">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/50">Today's Mood</span>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{todayEntry.moodEmoji}</span>
              <div>
                <h3 className="font-display text-2xl font-bold text-primary-foreground">{todayEntry.moodLabel}</h3>
                <p className="text-primary-foreground/50 text-sm">Logged today</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Energy', value: todayEntry.energy, color: 'bg-yellow' },
                { label: 'Stress', value: todayEntry.stress, color: 'bg-rose' },
                { label: 'Focus', value: todayEntry.focus, color: 'bg-mint' },
                { label: 'Motivation', value: todayEntry.motivation, color: 'bg-secondary' },
              ].map((s) => (
                <div key={s.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-primary-foreground/60">
                    <span>{s.label}</span>
                    <span>{s.value}%</span>
                  </div>
                  <MiniBar value={s.value} color={s.color} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl gradient-dark p-8 card-shadow-float">
            <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">How are you feeling today?</h3>
            <p className="text-primary-foreground/50 mb-6">Your daily check-in takes under a minute</p>
            <button
              onClick={() => navigate('/checkin')}
              className="px-8 py-4 rounded-2xl gradient-coral text-primary-foreground font-bold card-shadow hover:-translate-y-0.5 transition-transform"
            >
              Start Check-In →
            </button>
          </div>
        )}
      </motion.div>

      {/* Yesterday */}
      {yesterdayEntry && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-3">Yesterday</h2>
          <div className="rounded-2xl bg-card border border-border p-6 card-shadow">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{yesterdayEntry.moodEmoji}</span>
              <div>
                <p className="font-bold text-foreground">{yesterdayEntry.moodLabel}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: '⚡', value: yesterdayEntry.energy, color: 'bg-yellow' },
                { label: '🌡️', value: yesterdayEntry.stress, color: 'bg-rose' },
                { label: '🎯', value: yesterdayEntry.focus, color: 'bg-mint' },
                { label: '🚀', value: yesterdayEntry.motivation, color: 'bg-secondary' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span className="text-lg">{s.label}</span>
                  <MiniBar value={s.value} color={s.color} />
                  <span className="text-xs text-muted-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Explore */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Explore</h2>
        <div className="grid grid-cols-2 gap-4">
          {exploreCards.map((card) => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className={`${card.bg} rounded-2xl p-5 text-left hover:-translate-y-1 transition-transform card-shadow`}
            >
              <span className="text-3xl">{card.emoji}</span>
              <h3 className="font-display font-bold text-foreground mt-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{card.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
