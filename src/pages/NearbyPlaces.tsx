import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTodayEntry, getPreferences } from '@/lib/mood-store';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface PlaceCategory {
  type: string;
  label: string;
  emoji: string;
  reason: string;
}

const fallbackByMood: Record<string, PlaceCategory[]> = {
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

function getCacheKey(moodKey: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `moodflow_places_${today}_${moodKey}`;
}

export default function NearbyPlaces() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const todayEntry = getTodayEntry();
  const prefs = getPreferences();

  const [locationGranted, setLocationGranted] = useState(false);
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const moodKey = todayEntry?.moodKey || 'neutral';

  // Load cached or fallback on mount
  useEffect(() => {
    const cached = localStorage.getItem(getCacheKey(moodKey));
    if (cached) {
      try { setCategories(JSON.parse(cached)); return; } catch {}
    }
    setCategories(fallbackByMood[moodKey] || fallbackByMood.neutral);
  }, [moodKey]);

  const fetchAIPlaces = useCallback(async (forceRefresh = false) => {
    const cacheKey = getCacheKey(moodKey);
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { try { setCategories(JSON.parse(cached)); return; } catch {} }
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-places', {
        body: {
          moodKey,
          moodLabel: todayEntry?.moodLabel || moodKey,
          energy: todayEntry?.energy ?? 50,
          stress: todayEntry?.stress ?? 50,
          motivation: todayEntry?.motivation ?? 50,
          city: city || undefined,
          tone: prefs.contentTone || 'warm',
        },
      });

      if (error) throw error;

      if (data?.places && Array.isArray(data.places) && data.places.length > 0) {
        setCategories(data.places);
        localStorage.setItem(cacheKey, JSON.stringify(data.places));
      } else {
        throw new Error('No places returned');
      }
    } catch (err: any) {
      console.error('AI places error:', err);
      toast({ title: 'Using default recommendations', description: 'AI suggestions unavailable right now — showing curated defaults.', variant: 'default' });
      setCategories(fallbackByMood[moodKey] || fallbackByMood.neutral);
    } finally {
      setLoading(false);
    }
  }, [moodKey, todayEntry, city, prefs.contentTone, toast]);

  // Fetch AI places when location is granted
  useEffect(() => {
    if (locationGranted) {
      fetchAIPlaces();
    }
  }, [locationGranted, fetchAIPlaces]);

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { setLocationGranted(true); setCity(prev => prev || 'Your area'); },
        () => { setLocationGranted(false); toast({ title: 'Location access denied', description: 'You can enter your city instead.', variant: 'destructive' }); }
      );
    }
  };

  const handleRefresh = () => {
    localStorage.removeItem(getCacheKey(moodKey));
    fetchAIPlaces(true);
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
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint-pale text-foreground text-sm font-semibold mb-2">
              📍 {city || 'Your area'}
            </span>
            <p className="text-sm text-muted-foreground">
              Feeling {todayEntry?.moodLabel || 'neutral'} today · AI-curated for you 🧭
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Refresh Places 🔄'}
          </button>
        </div>
      )}

      {/* Place categories */}
      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${i % 2 === 0 ? 'bg-mint-pale' : 'bg-lavender-pale'} rounded-3xl p-6 card-shadow`}>
              <div className="flex items-start gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          categories.map((cat, i) => (
            <motion.div
              key={cat.type + i}
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
                      Real nearby businesses coming soon ✨
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
