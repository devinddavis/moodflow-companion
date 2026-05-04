import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { moodKey, moodLabel, energy, stress, focus, motivation, tone, avoid, seed } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ insight: null, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const avoidList: string[] = Array.isArray(avoid) ? avoid.filter(Boolean) : [];
    const variationSeed: string = seed || crypto.randomUUID();

    const prompt = `You are a wellness educator for a mood tracking app called MoodFlow.

Generate one short educational insight personalized to a user's current emotional state. It can be a psychology fact, wellness tip, or interesting science fact related to mood and wellbeing.

Rules:
- Write for a general audience. No medical jargon.
- Make it genuinely interesting and specific — something the user probably has not heard before.
- It MUST be directly relevant to the combined slider profile, not just the mood label. For example: high stress + low energy calls for a different fact than high energy + high focus.
- Do NOT repeat any of these previously-shown insight titles: ${avoidList.length ? JSON.stringify(avoidList) : "(none yet)"}.
- Variation seed (use to pick a fresh angle, do not mention in output): ${variationSeed}
- Tone: warm = friendly/caring, playful = surprising/fun, calm = serene/thoughtful.
- Return ONLY a valid JSON object. No markdown. No explanation.
- Format: {"emoji":"🧠","category":"Psychology","theme":"lavender","title":"Max 8 words","body":"2 to 3 sentences."}
- theme must be one of: "lavender", "mint", "yellow"

Mood: ${moodLabel || moodKey}
Energy: ${energy ?? 50}/100, Stress: ${stress ?? 50}/100, Focus: ${focus ?? 50}/100, Motivation: ${motivation ?? 50}/100
Tone: ${tone || "warm"}`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 1.1, topP: 0.95, maxOutputTokens: 400 } }),
      },
    );
    if (!r.ok) {
      console.error("ai-insight gemini error:", r.status, await r.text());
      return new Response(JSON.stringify({ insight: null, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    let insight: any = null;
    try {
      insight = JSON.parse(cleaned);
      if (!insight?.title || !insight?.body) throw new Error("bad shape");
    } catch (err) {
      console.error("parse error:", err, raw);
      insight = null;
    }
    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insight error:", e);
    return new Response(JSON.stringify({ insight: null, source: "fallback" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});