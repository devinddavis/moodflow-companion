import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { INSIGHT_CARDS } from '@/lib/mood-data';
import { getTodayEntry, getPreferences, updateTodayEntry, appendAiHistory } from '@/lib/mood-store';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const bgColors: Record<string, string> = {
  'lavender-pale': 'bg-lavender-pale',
  'mint-pale': 'bg-mint-pale',
  'yellow-pale': 'bg-yellow-pale',
};

const tagColors: Record<string, string> = {
  'lavender-pale': 'bg-secondary/20 text-secondary',
  'mint-pale': 'bg-accent/20 text-accent',
  'yellow-pale': 'bg-yellow/20 text-foreground',
};

const themeBg: Record<string, string> = {
  lavender: 'bg-lavender-pale', mint: 'bg-mint-pale', yellow: 'bg-yellow-pale',
};
const themeText: Record<string, string> = {
  lavender: 'text-secondary', mint: 'text-accent', yellow: 'text-foreground',
};

export default function Insights() {
  const navigate = useNavigate();
  const todayEntry = getTodayEntry();
  const prefs = getPreferences();
  const [aiInsight, setAiInsight] = useState<any>(todayEntry?.aiInsight ?? null);
  const [loadingAi, setLoadingAi] = useState(!!todayEntry && todayEntry.aiInsight === undefined);

  useEffect(() => {
    if (!todayEntry || todayEntry.aiInsight !== undefined) { setLoadingAi(false); return; }
    setLoadingAi(true);
    supabase.functions.invoke('ai-insight', {
      body: {
        moodKey: todayEntry.moodKey, moodLabel: todayEntry.moodLabel,
        energy: todayEntry.energy, stress: todayEntry.stress,
        focus: todayEntry.focus, motivation: todayEntry.motivation,
        tone: prefs.contentTone || 'warm',
        avoid: todayEntry.aiInsightHistory ?? [],
        seed: crypto.randomUUID(),
      },
    }).then(({ data }) => {
      const ins = (data as any)?.insight ?? null;
      setAiInsight(ins);
      updateTodayEntry({ aiInsight: ins });
      if (ins?.title) appendAiHistory('aiInsightHistory', [ins.title]);
    }).catch(() => {
      setAiInsight(null);
      updateTodayEntry({ aiInsight: null });
    }).finally(() => setLoadingAi(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold mb-4">
        ← Back
      </button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Wellness Insights</h1>
      <p className="text-muted-foreground mb-8">Psychology facts tailored to your mood 🧪</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loadingAi && (
          <div className="bg-lavender-pale rounded-3xl p-6 card-shadow space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {!loadingAi && aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className={`${themeBg[aiInsight.theme] || 'bg-lavender-pale'} rounded-3xl p-6 card-shadow relative`}
          >
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-card/70 text-[10px] font-bold text-foreground">
              ✨ AI Insight
            </span>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${themeText[aiInsight.theme] || 'text-secondary'}`}>
              {aiInsight.category}
            </p>
            <span className="text-4xl block mb-3">{aiInsight.emoji}</span>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">{aiInsight.title}</h3>
            <p className="text-sm text-text-mid leading-relaxed">{aiInsight.body}</p>
          </motion.div>
        )}
        {INSIGHT_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${bgColors[card.colorClass]} rounded-3xl p-6 card-shadow`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{card.category}</p>
            <span className="text-4xl block mb-3">{card.emoji}</span>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">{card.title}</h3>
            <p className="text-sm text-text-mid leading-relaxed mb-4">{card.body}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${tagColors[card.colorClass]}`}>
              {card.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
