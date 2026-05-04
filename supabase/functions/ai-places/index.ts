import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const fallbackByMood: Record<string, any[]> = {
  struggling: [
    { type: "park", label: "Nature Park or Trail", emoji: "🌿", reason: "Fresh air and greenery can gently lift your spirits when energy is low." },
    { type: "cafe", label: "Cozy Café", emoji: "☕", reason: "A warm drink in a calm space can help you feel grounded." },
    { type: "spa", label: "Spa or Wellness Center", emoji: "🧖", reason: "Gentle self-care can help reset your nervous system." },
    { type: "library", label: "Library", emoji: "📚", reason: "A quiet, structured environment can offer comfort." },
  ],
  low: [
    { type: "park", label: "Nature Park", emoji: "🌿", reason: "Greenery can softly lift low energy." },
    { type: "cafe", label: "Cozy Café", emoji: "☕", reason: "A warm drink in a calm space helps you feel cared for." },
    { type: "bookstore", label: "Bookstore", emoji: "📖", reason: "Browsing books sparks gentle curiosity." },
    { type: "library", label: "Library", emoji: "📚", reason: "A quiet structured space when the world feels loud." },
  ],
  neutral: [
    { type: "cafe", label: "Café with Good Vibes", emoji: "☕", reason: "A change of scenery turns neutral into productive." },
    { type: "library", label: "Library", emoji: "📚", reason: "Great for focused work or peaceful browsing." },
    { type: "bookstore", label: "Bookstore", emoji: "📖", reason: "Explore new ideas and let curiosity guide you." },
    { type: "museum", label: "Museum", emoji: "🏛️", reason: "Feed your mind something new." },
  ],
  good: [
    { type: "gym", label: "Gym or Fitness Studio", emoji: "💪", reason: "Channel your positive energy into movement." },
    { type: "park", label: "Park or Trail", emoji: "🌿", reason: "Nature amplifies good moods — go enjoy the outdoors." },
    { type: "restaurant", label: "Great Restaurant", emoji: "🍽️", reason: "Celebrate your good mood with a meal you love." },
    { type: "bowling_alley", label: "Bowling Alley", emoji: "🎳", reason: "A fun, low-pressure social outing." },
  ],
  great: [
    { type: "gym", label: "Fitness Center", emoji: "💪", reason: "Your energy is peaking — make the most of it." },
    { type: "park", label: "Adventure Trail", emoji: "🌿", reason: "Take that amazing energy outdoors." },
    { type: "restaurant", label: "Vibrant Restaurant", emoji: "🍽️", reason: "Share your great mood over a great meal." },
    { type: "movie_theater", label: "Movie Theater", emoji: "🎬", reason: "Ride the wave with friends." },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moodKey, moodLabel, energy, stress, motivation, city, tone } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const fallback = fallbackByMood[moodKey] || fallbackByMood.neutral;

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ places: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toneGuide = tone === "playful" ? "playful, joyful, light"
      : tone === "calm" ? "calm, mindful, serene"
      : "warm, nurturing, supportive";

    const prompt = `You are a compassionate wellness companion for a mood tracking app called MoodFlow.

Based on a user's current emotional state, suggest exactly 4 types of real-world places they could visit nearby to support their wellbeing.

Rules:
- Use real Google Places API type keywords only.
- Valid keywords: park, cafe, gym, spa, library, bookstore, art_gallery, movie_theater, restaurant, shopping_mall, museum, bowling_alley, yoga_studio, beauty_salon, night_club, bar, amusement_park, aquarium, zoo, stadium, hair_care, pharmacy, supermarket, convenience_store.
- For each, write a warm 1-sentence explanation of why this type of place would benefit someone in this state.
- Logic guide:
  - Low energy (<40) or high stress (>60): calm restorative places — park, cafe, spa, library, beauty_salon
  - Neutral (energy 40-65, stress 30-60): gentle productive or social — library, cafe, bookstore, museum, restaurant
  - Good or great (energy >65, stress <40): active, social, fun — gym, park, restaurant, bowling_alley, movie_theater
- Return ONLY a valid JSON array of exactly 4 objects. No markdown. No extra text.
- Format: [{"type":"park","label":"Nature Park or Trail","reason":"...","emoji":"🌿"}]

Mood: ${moodLabel || moodKey}
Energy: ${energy ?? 50}/100, Stress: ${stress ?? 50}/100, Motivation: ${motivation ?? 50}/100
City: ${city || "unknown"}
Tone: ${toneGuide}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 800 },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini error:", response.status, await response.text());
      return new Response(JSON.stringify({ places: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    let places: any[];
    try {
      places = JSON.parse(cleaned);
      if (!Array.isArray(places) || places.length === 0) throw new Error("bad shape");
    } catch (e) {
      console.error("parse error:", e, raw);
      places = fallback;
    }

    return new Response(JSON.stringify({ places }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-places error:", e);
    return new Response(JSON.stringify({ places: fallbackByMood.neutral, source: "fallback" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
