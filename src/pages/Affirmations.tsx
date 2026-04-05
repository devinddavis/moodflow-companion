import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayEntry } from '@/lib/mood-store';

const defaultAffirmations = [
  { emoji: '🌸', text: 'You are worthy of rest, kindness, and every good thing coming your way today.' },
  { emoji: '✨', text: 'Your feelings are valid, and you have the inner wisdom to navigate whatever arises.' },
  { emoji: '🌿', text: 'Peace is not something you find — it is something you carry within you, always.' },
  { emoji: '💫', text: 'You are moving forward, even when it feels like standing still. Every breath is progress.' },
];

export default function Affirmations() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const todayEntry = getTodayEntry();

  // Use mood-based affirmations if available
  const affirmations = todayEntry?.aiAffirmations
    ? todayEntry.aiAffirmations.map((text, i) => ({ emoji: ['🌸', '✨', '🌿', '💫'][i], text }))
    : defaultAffirmations;

  const next = () => setCurrent((c) => (c + 1) % affirmations.length);

  return (
    <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[120px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] rounded-full bg-coral/15 blur-[100px] animate-float-delayed" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate('/dashboard')} className="text-primary-foreground/50 hover:text-primary-foreground transition-colors font-semibold">
            ← Back
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">Daily Affirmation</h1>
          <div className="w-12" />
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-3xl p-10 text-center"
          >
            <span className="text-5xl block mb-6">{affirmations[current].emoji}</span>
            <p className="font-display italic text-xl md:text-2xl text-primary-foreground leading-relaxed mb-6">
              "{affirmations[current].text}"
            </p>
            <p className="text-xs text-primary-foreground/40">MoodFlow · Daily Wellness</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {affirmations.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? 'w-8 h-3 bg-primary-foreground' : 'w-3 h-3 bg-primary-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="mt-8 mx-auto block px-8 py-3 rounded-2xl border border-primary-foreground/20 text-primary-foreground/80 font-semibold hover:bg-primary-foreground/5 transition-all"
        >
          Next Affirmation →
        </button>
      </div>
    </div>
  );
}
