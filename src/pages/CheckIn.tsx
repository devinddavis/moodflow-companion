import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOODS } from '@/lib/mood-data';
import { addEntry, getUser } from '@/lib/mood-store';
import { toast } from '@/hooks/use-toast';

export default function CheckIn() {
  const navigate = useNavigate();
  const user = getUser();
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState(50);
  const [stress, setStress] = useState(50);
  const [focus, setFocus] = useState(50);
  const [motivation, setMotivation] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  if (!user) { navigate('/'); return null; }

  const mood = selectedMood !== null ? MOODS[selectedMood] : null;

  const handleSubmit = () => {
    if (!mood) return;
    setSubmitting(true);
    setTimeout(() => {
      addEntry({
        createdAt: new Date().toISOString(),
        moodKey: mood.key,
        moodEmoji: mood.emoji,
        moodLabel: mood.label,
        energy, stress, focus, motivation,
      });
      toast({ title: 'Check-in saved! ✨', description: 'Your personalized suggestions are ready.' });
      navigate('/suggestions', { state: { moodKey: mood.key, moodLabel: mood.label, moodEmoji: mood.emoji, energy, stress, focus, motivation } });
    }, 1200);
  };

  const sliders = [
    { key: 'energy', label: '⚡ Energy', value: energy, setter: setEnergy, left: '💤 Drained', right: '⚡ Energized', color: 'accent-yellow' },
    { key: 'stress', label: '🌡️ Stress', value: stress, setter: setStress, left: '😌 Calm', right: '😤 Stressed', color: 'accent-rose' },
    { key: 'focus', label: '🎯 Focus', value: focus, setter: setFocus, left: '🌫️ Foggy', right: '🎯 Focused', color: 'accent-mint' },
    { key: 'motivation', label: '🚀 Motivation', value: motivation, setter: setMotivation, left: '💤 Low', right: '🔥 Driven', color: 'accent-lavender' },
  ];

  const sliderColors: Record<string, string> = {
    'accent-yellow': '#F5C842',
    'accent-rose': '#E87070',
    'accent-mint': '#4BBDA0',
    'accent-lavender': '#8B7FCC',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => step === 1 ? navigate('/dashboard') : setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors font-semibold">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Step {step} of 2</span>
            <div className="flex gap-1.5">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? (step === 1 ? 'bg-primary' : 'bg-mint') : 'bg-muted'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <h1 className="font-display text-3xl font-bold text-foreground text-center mb-2">
                How are you <em className="text-primary">feeling right now</em>?
              </h1>
              <p className="text-center text-muted-foreground mb-8">Tap the emoji that best matches your mood</p>

              <div className="grid grid-cols-5 gap-3">
                {MOODS.map((m, i) => (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMood(i)}
                    className={`
                      flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200
                      ${selectedMood === i
                        ? 'border-primary bg-coral-pale -translate-y-1 card-shadow'
                        : 'border-border bg-card hover:border-primary/30 hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <span className="text-3xl mb-2">{m.emoji}</span>
                    <span className="text-xs font-semibold text-foreground">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Gradient bar */}
              <div className="mt-6 rounded-full h-3 bg-gradient-to-r from-rose via-yellow to-mint" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Struggling</span>
                <span>Great</span>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={selectedMood === null}
                className={`
                  w-full mt-8 py-4 rounded-2xl font-bold text-lg transition-all
                  ${selectedMood !== null
                    ? 'gradient-coral text-primary-foreground card-shadow hover:-translate-y-0.5'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  }
                `}
              >
                Continue →
              </button>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {/* Mood badge */}
              {mood && (
                <div className="flex justify-center mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-pale text-foreground text-sm font-semibold">
                    {mood.emoji} {mood.label}
                  </span>
                </div>
              )}

              <h1 className="font-display text-3xl font-bold text-foreground text-center mb-8">
                Tell us a <em className="text-secondary">little more</em>
              </h1>

              <div className="space-y-8">
                {sliders.map((s) => (
                  <div key={s.key}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-foreground">{s.label}</span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full text-primary-foreground"
                        style={{ backgroundColor: sliderColors[s.color] }}
                      >
                        {s.value}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={s.value}
                      onChange={(e) => s.setter(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${sliderColors[s.color]} ${s.value}%, hsl(var(--muted)) ${s.value}%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{s.left}</span>
                      <span>{s.right}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-10 py-4 rounded-2xl gradient-lavender text-primary-foreground font-bold text-lg card-shadow hover:-translate-y-0.5 transition-transform disabled:opacity-60"
              >
                {submitting ? 'Generating your personalized day... ✨' : '✨ Generate My Day'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
