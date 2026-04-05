import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getUser } from '@/lib/mood-store';

const features = [
  { emoji: '😊', title: 'Daily Check-In', desc: 'Log your mood in seconds with emojis and sliders' },
  { emoji: '✨', title: 'Personalized Suggestions', desc: 'AI-powered recommendations tailored to how you feel' },
  { emoji: '📍', title: 'Places For Your Mood', desc: 'Discover real nearby spots that match your vibe' },
  { emoji: '📊', title: 'Track Your Journey', desc: 'Visualize trends and celebrate your growth over time' },
];

const emojis = ['😔', '😟', '😐', '🙂', '😄'];

export default function Landing() {
  const navigate = useNavigate();
  const user = getUser();

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-dark">
        {/* Floating blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-coral/20 blur-[120px] animate-float" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[140px] animate-float-delayed" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-accent/15 blur-[100px] animate-float-slow" />

        <div className="relative z-10 text-center px-6 max-w-3xl">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-8 rounded-2xl gradient-coral flex items-center justify-center text-4xl card-shadow-float"
          >
            🌊
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-6xl md:text-7xl font-bold gradient-text-coral mb-4"
          >
            MoodFlow
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-primary-foreground/60 font-body mb-10"
          >
            Your emotional compass ✦
          </motion.p>

          {/* Emoji row */}
          <div className="flex justify-center gap-3 mb-12">
            {emojis.map((emoji, i) => (
              <motion.div
                key={emoji}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-2xl border border-primary-foreground/10"
              >
                {emoji}
              </motion.div>
            ))}
          </div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-2xl gradient-coral text-primary-foreground font-bold text-lg card-shadow-float hover:-translate-y-1 transition-transform"
            >
              Get Started 🚀
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-2xl border-2 border-primary-foreground/20 text-primary-foreground/80 font-bold text-lg hover:bg-primary-foreground/5 transition-all"
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Everything you need to <em className="font-display italic text-primary">feel your best</em>
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            MoodFlow combines daily check-ins, AI insights, and local recommendations to support your emotional wellbeing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card rounded-3xl p-6 card-shadow hover:-translate-y-1 transition-transform border border-border"
              >
                <div className="w-14 h-14 rounded-2xl bg-coral-pale flex items-center justify-center text-2xl mb-4">
                  {f.emoji}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-muted text-center">
        <p className="text-sm text-muted-foreground">© 2026 MoodFlow — Your emotional compass ✦</p>
      </footer>
    </div>
  );
}
