import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { INSIGHT_CARDS } from '@/lib/mood-data';

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

export default function Insights() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold mb-4">
        ← Back
      </button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Wellness Insights</h1>
      <p className="text-muted-foreground mb-8">Psychology facts tailored to your mood 🧪</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
