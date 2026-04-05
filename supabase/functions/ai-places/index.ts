import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moodKey, moodLabel, energy, stress, motivation, userName, city, tone } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const toneGuide = tone === "playful"
      ? "Use a playful, fun, lighthearted tone with humor."
      : tone === "calm"
      ? "Use a calm, mindful, serene tone."
      : "Use a warm, encouraging, supportive tone.";

    const systemPrompt = `You are a wellness-focused AI assistant for an app called MoodFlow. ${toneGuide} You recommend types of places (NOT specific businesses) that would benefit someone based on their current emotional state.`;

    const userPrompt = `The user${userName ? ` (${userName})` : ""} is feeling "${moodLabel || moodKey}" today.
Energy level: ${energy ?? 50}/100. Stress level: ${stress ?? 50}/100. Motivation: ${motivation ?? 50}/100.
${city ? `They are in or near: ${city}.` : ""}

Suggest exactly 4 types of places they should visit to support their wellbeing right now. For each, provide:
- type: a short snake_case category key (e.g. "nature_trail", "cozy_cafe")
- label: a friendly 2-5 word name for the place type
- emoji: a single relevant emoji
- reason: a warm, personalized 1-2 sentence explanation of why this place would help them right now, referencing their mood/energy/stress

Return ONLY a JSON array of 4 objects with those keys. No markdown, no extra text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "[]";

    // Strip markdown fences if present
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const places = JSON.parse(cleaned);

    return new Response(JSON.stringify({ places }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-places error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
