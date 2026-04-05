import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { getEntries } from '@/lib/mood-store';
import { MOODS } from '@/lib/mood-data';

const moodScoreMap: Record<string, number> = { struggling: 10, low: 30, neutral: 50, good: 70, great: 90 };
const moodColorMap: Record<string, string> = { great: '#4BBDA0', good: '#B8B0E0', neutral: '#F5C842', low: '#FF9B82', struggling: '#FF9B82' };

const periods = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '3 Months', days: 90 },
];

export default function MoodHistory() {
  const navigate = useNavigate();
  const [periodIdx, setPeriodIdx] = useState(0);
  const entries = getEntries();
  const period = periods[periodIdx];

  const filteredEntries = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period.days);
    return entries.filter(e => new Date(e.createdAt) >= cutoff);
  }, [entries, period.days]);

  const chartData = useMemo(() => {
    return [...filteredEntries].reverse().map(e => ({
      date: new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: moodScoreMap[e.moodKey] || 50,
      emoji: e.moodEmoji,
      label: e.moodLabel,
    }));
  }, [filteredEntries]);

  const average = chartData.length
    ? Math.round(chartData.reduce((a, b) => a + b.score, 0) / chartData.length)
    : 0;

  // Stats
  const streak = (() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (entries.some(e => new Date(e.createdAt).toDateString() === d.toDateString())) s++;
      else break;
    }
    return s;
  })();

  const goodDays = filteredEntries.filter(e => e.moodKey === 'good' || e.moodKey === 'great').length;

  // Calendar dots for current month
  const calendarDots = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const dots: Array<{ day: number; moodKey: string | null }> = [];

    // Add empty slots for offset
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon=0

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toDateString();
      const entry = entries.find(e => new Date(e.createdAt).toDateString() === dateStr);
      dots.push({ day: d, moodKey: entry?.moodKey || null });
    }
    return { dots, offset };
  }, [entries]);

  const dotColor = (mk: string | null) => {
    if (!mk) return 'bg-muted';
    return {
      great: 'bg-mint',
      good: 'bg-lavender-soft',
      neutral: 'bg-yellow',
      low: 'bg-coral-soft',
      struggling: 'bg-coral-soft',
    }[mk] || 'bg-muted';
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold mb-4">
        ← Back
      </button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Mood Journey 📈</h1>

      {/* Period toggle */}
      <div className="flex gap-2 mb-8">
        {periods.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPeriodIdx(i)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              i === periodIdx ? 'gradient-coral text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-border'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {chartData.length > 0 ? (
        <>
          {/* Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-3xl p-6 card-shadow border border-border mb-6">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="coralGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B4A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B4A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card rounded-xl p-3 card-shadow border border-border text-sm">
                        <p className="font-semibold">{d.date}</p>
                        <p>{d.emoji} {d.label} — {d.score}%</p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={average} stroke="#8B7FCC" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="score" stroke="#FF6B4A" strokeWidth={3} fill="url(#coralGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-5 card-shadow border border-border text-center">
              <p className="text-2xl font-bold text-foreground">🔥 {streak}</p>
              <p className="text-xs text-muted-foreground mt-1">Current Streak</p>
            </div>
            <div className="bg-card rounded-2xl p-5 card-shadow border border-border text-center">
              <p className="text-2xl font-bold text-foreground">📈 {average}%</p>
              <p className="text-xs text-muted-foreground mt-1">Period Average</p>
            </div>
            <div className="bg-card rounded-2xl p-5 card-shadow border border-border text-center">
              <p className="text-2xl font-bold text-foreground">😄 {goodDays}/{filteredEntries.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Good Days</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-card rounded-3xl p-6 card-shadow border border-border mb-8">
            <h3 className="font-display font-bold text-foreground mb-4">This Month</h3>
            <div className="grid grid-cols-7 gap-2 text-xs text-center text-muted-foreground mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: calendarDots.offset }).map((_, i) => <div key={`empty-${i}`} />)}
              {calendarDots.dots.map((dot) => (
                <div key={dot.day} className="flex justify-center">
                  <div className={`w-4 h-4 rounded-full ${dotColor(dot.moodKey)}`} title={`Day ${dot.day}`} />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-mint" /> Great</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-lavender-soft" /> Good</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow" /> Neutral</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-coral-soft" /> Low/Struggling</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-muted" /> No entry</span>
            </div>
          </div>

          {/* Mood Log */}
          <div className="bg-card rounded-3xl p-6 card-shadow border border-border overflow-x-auto">
            <h3 className="font-display font-bold text-foreground mb-4">Mood Log</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Mood</th>
                  <th className="pb-3 pr-4">Energy</th>
                  <th className="pb-3 pr-4">Stress</th>
                  <th className="pb-3 pr-4">Focus</th>
                  <th className="pb-3">Motivation</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.slice(0, 10).map((e, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 text-foreground">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">{e.moodEmoji} {e.moodLabel}</td>
                    <td className="py-3 pr-4">{e.energy}%</td>
                    <td className="py-3 pr-4">{e.stress}%</td>
                    <td className="py-3 pr-4">{e.focus}%</td>
                    <td className="py-3">{e.motivation}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-card rounded-3xl p-12 card-shadow border border-border text-center">
          <span className="text-5xl block mb-4">🌱</span>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">No mood history yet</h3>
          <p className="text-muted-foreground mb-6">Start your first check-in to begin tracking your journey!</p>
          <button
            onClick={() => navigate('/checkin')}
            className="px-8 py-3 rounded-2xl gradient-coral text-primary-foreground font-bold card-shadow hover:-translate-y-0.5 transition-transform"
          >
            Start Check-In 🚀
          </button>
        </div>
      )}
    </div>
  );
}
