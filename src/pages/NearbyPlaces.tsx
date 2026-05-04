import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTodayEntry, getPreferences, updateTodayEntry } from '@/lib/mood-store';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface PlaceCategory { type: string; label: string; emoji: string; reason: string; }
interface Place {
  name: string; vicinity: string; rating: number | null;
  user_ratings_total: number | null; place_id: string; mapsUrl: string;
}

const fallbackByMood: Record<string, PlaceCategory[]> = {
  struggling: [
    { type: 'park', label: 'Nature Park or Trail', emoji: '🌿', reason: 'Fresh air and greenery can gently lift your spirits when energy is low.' },
    { type: 'cafe', label: 'Cozy Café', emoji: '☕', reason: 'A warm drink in a calm space can help you feel grounded.' },
    { type: 'spa', label: 'Spa or Wellness Center', emoji: '🧖', reason: 'Gentle self-care can help reset your nervous system.' },
    { type: 'library', label: 'Library', emoji: '📚', reason: 'A quiet space can offer comfort when the world feels loud.' },
  ],
  low: [
    { type: 'park', label: 'Nature Park', emoji: '🌿', reason: 'Greenery softly lifts low energy.' },
    { type: 'cafe', label: 'Cozy Café', emoji: '☕', reason: 'A warm drink in a calm space helps you feel cared for.' },
    { type: 'bookstore', label: 'Bookstore', emoji: '📖', reason: 'Browsing books can spark gentle curiosity.' },
    { type: 'library', label: 'Library', emoji: '📚', reason: 'A quiet structured space when the world feels loud.' },
  ],
  neutral: [
    { type: 'cafe', label: 'Café', emoji: '☕', reason: 'A change of scenery turns neutral into productive.' },
    { type: 'library', label: 'Library', emoji: '📚', reason: 'Great for focused work or peaceful browsing.' },
    { type: 'bookstore', label: 'Bookstore', emoji: '📖', reason: 'Explore new ideas and let curiosity guide you.' },
    { type: 'museum', label: 'Museum', emoji: '🏛️', reason: 'Feed your mind something new.' },
  ],
  good: [
    { type: 'gym', label: 'Gym', emoji: '💪', reason: 'Channel your positive energy into movement.' },
    { type: 'park', label: 'Park', emoji: '🌿', reason: 'Nature amplifies good moods.' },
    { type: 'restaurant', label: 'Restaurant', emoji: '🍽️', reason: 'Celebrate with a meal you love.' },
    { type: 'bowling_alley', label: 'Bowling Alley', emoji: '🎳', reason: 'A fun, low-pressure social outing.' },
  ],
  great: [
    { type: 'gym', label: 'Fitness Center', emoji: '💪', reason: 'Your energy is peaking — make the most of it.' },
    { type: 'park', label: 'Adventure Trail', emoji: '🌿', reason: 'Take that energy outdoors.' },
    { type: 'restaurant', label: 'Vibrant Restaurant', emoji: '🍽️', reason: 'Share your great mood over a great meal.' },
    { type: 'movie_theater', label: 'Movie Theater', emoji: '🎬', reason: 'Ride the wave with friends.' },
  ],
};

const moodSubtitle: Record<string, string> = {
  struggling: 'Some gentle places nearby that might help 🌿',
  low: 'Some gentle places nearby that might help 🌿',
  neutral: 'Places to help you make the most of your day ☀️',
  good: 'Places to match your great energy today 🚀',
  great: 'Places to match your great energy today 🚀',
};

export default function NearbyPlaces() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const todayEntry = getTodayEntry();
  const prefs = getPreferences();

  const moodKey = todayEntry?.moodKey || 'neutral';

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [placesByType, setPlacesByType] = useState<Record<string, Place[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingPlacesKey, setMissingPlacesKey] = useState(false);

  // Gate: require check-in
  if (!todayEntry) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold mb-4">
          ← Back
        </button>
        <div className="bg-card rounded-3xl p-10 card-shadow border border-border text-center mt-12">
          <span className="text-5xl block mb-4">😊</span>
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">First, how are you feeling?</h2>
          <p className="text-muted-foreground mb-6">
            Complete today's mood check-in first so we can find places that match how you feel.
          </p>
          <button
            onClick={() => navigate('/check-in')}
            className="px-8 py-3 rounded-2xl gradient-coral text-primary-foreground font-bold card-shadow hover:-translate-y-0.5 transition-transform"
          >
            Start Check-In →
          </button>
        </div>
      </div>
    );
  }

  const runFetch = useCallback(async (opts: {
    lat?: number; lng?: number; address?: string; force?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    setMissingPlacesKey(false);

    try {
      // Step 1: AI place categories
      let cats: PlaceCategory[] | null = null;
      if (!opts.force && todayEntry.aiPlaceCategories) {
        cats = todayEntry.aiPlaceCategories;
      } else {
        const { data: aiData } = await supabase.functions.invoke('ai-places', {
          body: {
            moodKey: todayEntry.moodKey,
            moodLabel: todayEntry.moodLabel,
            energy: todayEntry.energy,
            stress: todayEntry.stress,
            motivation: todayEntry.motivation,
            city: opts.address || city || undefined,
            tone: prefs.contentTone || 'warm',
          },
        });
        cats = (aiData as any)?.places ?? fallbackByMood[moodKey];
        updateTodayEntry({ aiPlaceCategories: cats });
      }
      if (!cats || cats.length === 0) cats = fallbackByMood[moodKey];
      setCategories(cats);

      // Step 2: real places
      const placeTypes = cats.map(c => c.type);
      const { data: placesData, error: placesErr } = await supabase.functions.invoke('nearby-places', {
        body: {
          latitude: opts.lat, longitude: opts.lng, address: opts.address,
          placeTypes, radius: 5000,
        },
      });
      if (placesErr) throw placesErr;
      const pd = placesData as any;
      if (pd?.error === 'missing_key') {
        setMissingPlacesKey(true);
        setPlacesByType({});
        return;
      }
      if (pd?.error === 'geocode_failed') {
        setError("Couldn't find that location. Try a different city or zip code.");
        return;
      }
      if (pd?.error) {
        setError("We couldn't load nearby places right now. Check your connection and try again. 🔄");
        return;
      }
      setPlacesByType(pd?.results || {});
      if (pd?.city) setCity(pd.city);
      if (pd?.latitude && pd?.longitude) setCoords({ lat: pd.latitude, lng: pd.longitude });
    } catch (e) {
      console.error(e);
      setError("We couldn't load nearby places right now. Check your connection and try again. 🔄");
      setCategories(fallbackByMood[moodKey]);
    } finally {
      setLoading(false);
    }
  }, [todayEntry, prefs.contentTone, moodKey, city]);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Location not supported', description: 'Try entering a city instead.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setCity('Your area');
        runFetch({ lat: c.lat, lng: c.lng });
      },
      () => { toast({ title: 'Location access denied', description: 'You can enter your city instead.', variant: 'destructive' }); },
    );
  };

  const handleCitySearch = () => {
    const q = cityInput.trim();
    if (!q) return;
    runFetch({ address: q });
  };

  const handleRefresh = () => {
    if (coords) runFetch({ lat: coords.lat, lng: coords.lng, force: true });
    else if (city && city !== 'Your area') runFetch({ address: city, force: true });
    else if (cityInput) runFetch({ address: cityInput, force: true });
  };

  const hasLocation = coords || (city && city !== '');

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold mb-4">
        ← Back
      </button>

      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Places For Your Mood 📍</h1>
          <p className="text-muted-foreground">{moodSubtitle[moodKey] || moodSubtitle.neutral}</p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral-pale text-foreground text-sm font-semibold mt-3">
            {todayEntry.moodEmoji} {todayEntry.moodLabel}
          </span>
        </div>
        {hasLocation && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh 🔄'}
          </button>
        )}
      </div>

      {!hasLocation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl p-8 card-shadow border border-border text-center my-8">
          <span className="text-4xl block mb-4">📍</span>
          <p className="text-foreground font-semibold mb-2">To find places near you, MoodFlow needs your location</p>
          <p className="text-sm text-muted-foreground mb-6">We never store or share it.</p>
          <button
            onClick={handleShareLocation}
            className="px-8 py-3 rounded-2xl gradient-coral text-primary-foreground font-bold card-shadow hover:-translate-y-0.5 transition-transform mb-6"
          >
            📍 Share My Location
          </button>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Or enter your city or zip code</p>
            <div className="flex gap-2 justify-center max-w-sm mx-auto">
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground"
                placeholder="e.g. Fontana, CA"
              />
              <button
                onClick={handleCitySearch}
                disabled={!cityInput.trim() || loading}
                className="px-5 py-3 rounded-xl gradient-lavender text-primary-foreground font-bold disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {hasLocation && (
        <p className="text-sm text-muted-foreground mt-4 mb-6">
          📍 {city || `${coords?.lat.toFixed(2)}, ${coords?.lng.toFixed(2)}`}
        </p>
      )}

      {error && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center my-6">
          <p className="text-foreground mb-3">{error}</p>
          <button onClick={handleRefresh} className="px-5 py-2 rounded-xl gradient-coral text-primary-foreground font-bold">
            Try Again 🔄
          </button>
        </div>
      )}

      <div className="space-y-6 mt-6">
        {loading && categories.length === 0 && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${i % 2 === 0 ? 'bg-mint-pale' : 'bg-lavender-pale'} rounded-3xl p-6 card-shadow space-y-4`}>
            <div className="flex items-start gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ))}

        {hasLocation && categories.map((cat, i) => {
          const places = placesByType[cat.type] || [];
          const bg = i % 2 === 0 ? 'bg-mint-pale' : 'bg-lavender-pale';
          return (
            <motion.div
              key={cat.type + i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.3 }}
              className={`${bg} rounded-3xl p-6 card-shadow`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center text-2xl flex-shrink-0 card-shadow">
                  {cat.emoji}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">{cat.emoji} {cat.label}</h3>
                  <p className="text-sm text-text-mid mt-1">{cat.reason}</p>
                </div>
              </div>

              {missingPlacesKey ? (
                <div className="rounded-2xl bg-card/70 p-4 text-sm text-foreground">
                  ⚠️ Add your Google Places API key to see real nearby locations.
                </div>
              ) : loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : places.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No {cat.label.toLowerCase()} found nearby — try expanding your search area.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {places.map((p) => (
                    <div key={p.place_id} className="bg-card rounded-2xl p-4 card-shadow">
                      <p className="font-bold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.vicinity}</p>
                      <p className="text-sm mt-2">
                        {p.rating != null
                          ? <>⭐ {p.rating} <span className="text-muted-foreground">({p.user_ratings_total ?? 0} reviews)</span></>
                          : <span className="text-muted-foreground">No rating yet</span>}
                      </p>
                      <a
                        href={p.mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm font-semibold text-primary hover:underline"
                      >
                        Get Directions →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}