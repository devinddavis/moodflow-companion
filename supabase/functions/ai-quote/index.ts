import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const fallbackQuotes: Record<string, string> = {
  struggling: "Even the smallest step forward is a victory — you're stronger than you know right now.",
  low: "This moment is just a chapter, not your whole story. Gentleness with yourself today is wisdom.",
  neutral: "Steady ground is fertile ground. You have the calm clarity to plant something meaningful today.",
  good: "Your positive energy today is a gift — share it generously and it will multiply.",
  great: "You're radiating the kind of energy that makes everything possible. Channel it into what matters most.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userName, moodKey, moodLabel, energy, stress, focus, motivation, tone, avoid, seed } = await req.json();
    const fallback = fallbackQuotes[moodKey] || fallbackQuotes.neutral;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ quote: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const avoidList: string[] = Array.isArray(avoid) ? avoid.filter(Boolean) : [];
    const variationSeed: string = seed || crypto.randomUUID();

    const prompt = `You are a compassionate wellness companion for a mood tracking app called MoodFlow.

Generate a single personalized motivational quote for a user based on their emotional state right now.

Rules:
- Exactly 1 to 2 sentences. No more.
- Write in second person. Start with You or Your.
- Make it feel specific to where this person emotionally is — not generic.
- BANNED phrases: "Every day is a new beginning", "Believe in yourself", "You've got this", "One step at a time", "Keep going", "You are stronger than you think". Do not use these or anything similar.
- Do NOT repeat any of these previously-shown quotes: ${avoidList.length ? JSON.stringify(avoidList) : "(none yet)"}.
- Variation seed (use to pick a fresh angle, do not mention in output): ${variationSeed}
- If mood is struggling or low: be gentle, validating, soft. Do not push productivity.
- If mood is neutral: be encouraging and grounding.
- If mood is good or great: be energizing and affirming.
- Tone: warm = nurturing, playful = light/upbeat, calm = serene/grounding.
- Return ONLY the quote as plain text. No quotation marks. No labels. No explanation.

User: ${userName || "friend"}
Mood: ${moodLabel || moodKey}
Energy: ${energy ?? 50}/100
Stress: ${stress ?? 50}/100
Focus: ${focus ?? 50}/100
Motivation: ${motivation ?? 50}/100
Tone preference: ${tone || "warm"}`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 1.1, topP: 0.95, maxOutputTokens: 200 } }),
      },
    );
    if (!r.ok) {
      console.error("ai-quote gemini error:", r.status, await r.text());
      return new Response(JSON.stringify({ quote: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || fallback)
      .trim().replace(/^["']|["']$/g, "");
    return new Response(JSON.stringify({ quote: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-quote error:", e);
    return new Response(JSON.stringify({ quote: fallbackQuotes.neutral, source: "fallback" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});