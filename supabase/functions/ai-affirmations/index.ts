import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const fallbackByMood: Record<string, string[]> = {
  struggling: [
    "You are worthy of rest, kindness, and every good thing coming your way.",
    "Your feelings are valid, and you have the inner wisdom to navigate this moment.",
    "Peace is something you carry within you, even on the hardest days.",
    "You are moving forward, even when it feels like standing still — every breath is progress.",
  ],
  low: [
    "You are enough, exactly as you are right now.",
    "Your sensitivity is a gift; gentleness toward yourself is strength.",
    "It's safe to slow down and let yourself just be.",
    "Each small step you take today matters more than you realize.",
  ],
  neutral: [
    "You have everything you need within you to make today meaningful.",
    "Your steady energy is a foundation for something beautiful.",
    "You are exactly where you need to be in this moment.",
    "Small intentional actions today create the life you want tomorrow.",
  ],
  good: [
    "Your light is real, and the world is brighter because of you.",
    "You are capable of extraordinary things — trust your instincts today.",
    "Joy lives in you, and you have every right to share it freely.",
    "Today is full of possibility, and you are ready to meet it.",
  ],
  great: [
    "You are radiant, capable, and fully alive in this moment.",
    "Your energy lifts others — never doubt the impact you have.",
    "You are exactly the person you needed to become.",
    "Today, anything you focus on with this energy becomes possible.",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userName, moodKey, moodLabel, energy, stress, tone } = await req.json();
    const fallback = fallbackByMood[moodKey] || fallbackByMood.neutral;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ affirmations: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are a compassionate wellness companion for a mood tracking app called MoodFlow.

Generate exactly 4 short original affirmations for a user based on their current mood.

Rules:
- Each affirmation is 1 to 2 sentences max.
- Write in second person: You are, Your, You have.
- Cover these 4 emotional angles, one each: self-worth, personal capability, inner peace, forward momentum.
- Make each feel genuinely tailored to this state — not generic or interchangeable.
- Tone: warm = nurturing/caring, playful = joyful/upbeat, calm = serene/mindful.
- Return ONLY a valid JSON array of exactly 4 strings. No markdown. No explanation.
- Format: ["First.", "Second.", "Third.", "Fourth."]

User: ${userName || "friend"}
Mood: ${moodLabel || moodKey}
Energy: ${energy ?? 50}/100, Stress: ${stress ?? 50}/100
Tone: ${tone || "warm"}`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 600 } }),
      },
    );
    if (!r.ok) {
      console.error("ai-affirmations gemini error:", r.status, await r.text());
      return new Response(JSON.stringify({ affirmations: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    let affirmations: string[];
    try {
      affirmations = JSON.parse(cleaned);
      if (!Array.isArray(affirmations) || affirmations.length < 4) throw new Error("bad shape");
      affirmations = affirmations.slice(0, 4);
    } catch (err) {
      console.error("parse error:", err, raw);
      affirmations = fallback;
    }
    return new Response(JSON.stringify({ affirmations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-affirmations error:", e);
    return new Response(JSON.stringify({ affirmations: fallbackByMood.neutral, source: "fallback" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});