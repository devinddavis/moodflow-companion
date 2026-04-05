import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTodayEntry } from '@/lib/mood-store';

const placeCategoriesByMood: Record<string, Array<{ type: string; label: string; emoji: string; reason: string }>> = {
  struggling: [
    { type: 'park', label: 'Nature Park or Trail', emoji: '🌿', reason: 'Fresh air and greenery can gently lift your spirits when energy is low.' },
    { type: 'cafe', label: 'Cozy Café', emoji: '☕', reason: 'A warm drink in a calm space can help you feel grounded and cared for.' },
    { type: 'spa', label: 'Spa or Wellness Center', emoji: '🧖', reason: 'Gentle self-care can help reset your nervous system.' },
    { type: 'library', label: 'Library', emoji: '📚', reason: 'A quiet, structured environment can provide comfort when the world feels overwhelming.' },
  ],
  low: [
    { type: 'park', label: 'Nature Park or Trail', emoji: '🌿', reason: 'Fresh air and greenery can gently lift your spirits when energy is low.' },
    { type: 'cafe', label: 'Cozy Café', emoji: '☕', reason: 'A warm drink in a calm space can help you feel grounded and cared for.' },
    { type: 'bookstore', label: 'Bookstore', emoji: '📖', reason: 'Browsing books can spark curiosity and shift your emotional state.' },
    { type: 'art_gallery', label: 'Art Gallery', emoji: '🎨', reason: 'Art can evoke new feelings and give your mind a gentle redirect.' },
  ],
  neutral: [
    { type: 'cafe', label: 'Café with Good Vibes', emoji: '☕', reason: 'A change of scenery can help turn neutral into productive.' },
    { type: 'library', label: 'Library', emoji: '📚', reason: 'Great for focused work or peaceful browsing.' },
    { type: 'bookstore', label: 'Bookstore', emoji: '📖', reason: 'Explore new ideas and let curiosity guide you.' },
    { type: 'park', label: 'Local Park', emoji: '🌿', reason: 'A short walk can elevate your mood from neutral to good.' },
  ],
  good: [
    { type: 'gym', label: 'Gym or Fitness Studio', emoji: '💪', reason: 'Channel your positive energy into physical movement.' },
    { type: 'park', label: 'Park or Trail', emoji: '🌿', reason: 'Nature amplifies good moods — go enjoy the outdoors!' },
    { type: 'restaurant', label: 'Great Restaurant', emoji: '🍽️', reason: 'Celebrate your good mood with a meal you love.' },
    { type: 'museum', label: 'Museum', emoji: '🏛️', reason: 'Feed your curiosity and soak in something inspiring.' },
  ],
  great: [
    { type: 'gym', label: 'Gym or Fitness Center', emoji: '💪', reason: 'Your energy is peaking — make the most of it with movement!' },
    { type: 'park', label: 'Adventure Trail', emoji: '🌿', reason: 'Take your amazing energy outdoors and explore.' },
    { type: 'movie_theater', label: 'Movie Theater', emoji: '🎬', reason: 'Share your great mood with friends at a fun outing.' },
    { type: 'shopping_mall', label: 'Shopping District', emoji: '🛍️', reason: 'Ride the wave of positivity with a social outing.' },
  ],
};

export default function NearbyPlaces() {
  const navigate = useNavigate();
  const todayEntry = getTodayEntry();
  const [locationGranted, setLocationGranted] = useState(false);
  const [city, setCity] = useState('');

  const moodKey = todayEntry?.moodKey || 'neutral';
  const categories = placeCategoriesByMood[moodKey] || placeCategoriesByMood.neutral;

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationGranted(true);
          setCity('Your area');
        },
        () => {
          setLocationGranted(false);
        }
      );
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold mb-4">
        ← Back
      </button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Places For Your Mood 📍</h1>
      <p className="text-muted-foreground mb-8">
        Based on how you're feeling today, here are some places that might help 🌿
      </p>

      {!locationGranted ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl p-8 card-shadow border border-border text-center mb-8">
          <span className="text-4xl block mb-4">📍</span>
          <p className="text-foreground font-semibold mb-2">To find places near you, MoodFlow needs your location</p>
          <p className="text-sm text-muted-foreground mb-6">We never store or share it.</p>
          <button
            onClick={handleShareLocation}
            className="px-8 py-3 rounded-2xl gradient-coral text-primary-foreground font-bold card-shadow hover:-translate-y-0.5 transition-transform mb-4"
          >
            📍 Share My Location
          </button>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Or enter your city or zip code</p>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && city && setLocationGranted(true)}
              className="px-4 py-3 rounded-xl border border-border bg-background text-foreground text-center w-full max-w-xs"
              placeholder="e.g. New York"
            />
          </div>
        </motion.div>
      ) : (
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint-pale text-foreground text-sm font-semibold mb-4">
            📍 {city || 'Your area'}
          </span>
          <p className="text-sm text-muted-foreground">
            Feeling {todayEntry?.moodLabel || 'neutral'} today · Places chosen for you 🧭
          </p>
        </div>
      )}

      {/* Place categories */}
      <div className="space-y-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${i % 2 === 0 ? 'bg-mint-pale' : 'bg-lavender-pale'} rounded-3xl p-6 card-shadow`}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-2xl flex-shrink-0 card-shadow">
                {cat.emoji}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">{cat.label}</h3>
                <p className="text-sm text-text-mid mt-1">{cat.reason}</p>
                {locationGranted && (
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Connect a Google Places API key in settings to see real nearby locations.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
