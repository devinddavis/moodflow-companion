import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const fallbackByMood: Record<string, any[]> = {
  struggling: [
    { emoji: "🌿", category: "Self-Care", categoryColor: "#4BBDA0", cardBackground: "#EAE7FA", name: "Take a Gentle Walk", description: "5-10 minutes outside can shift your perspective." },
    { emoji: "☕", category: "Comfort", categoryColor: "#FF6B4A", cardBackground: "#D1F2EB", name: "Warm Drink & Rest", description: "Give yourself full permission to slow down today." },
    { emoji: "📔", category: "Reflection", categoryColor: "#8B7FCC", cardBackground: "#FFF4C2", name: "Journal 3 Gratitudes", description: "Even tiny ones rewire your focus." },
  ],
  low: [
    { emoji: "🌿", category: "Self-Care", categoryColor: "#4BBDA0", cardBackground: "#EAE7FA", name: "Take a Gentle Walk", description: "5-10 minutes outside can shift your perspective." },
    { emoji: "☕", category: "Comfort", categoryColor: "#FF6B4A", cardBackground: "#D1F2EB", name: "Warm Drink & Rest", description: "Slow down — that's a complete sentence." },
    { emoji: "📔", category: "Reflection", categoryColor: "#8B7FCC", cardBackground: "#FFF4C2", name: "Journal 3 Gratitudes", description: "Tiny ones count and rewire your focus." },
  ],
  neutral: [
    { emoji: "📋", category: "Organize", categoryColor: "#8B7FCC", cardBackground: "#EAE7FA", name: "Tidy Your Workspace", description: "A clear space creates a clearer mind." },
    { emoji: "✅", category: "Productivity", categoryColor: "#A07000", cardBackground: "#D1F2EB", name: "Pick One Priority Task", description: "One completed item builds momentum." },
    { emoji: "🧘", category: "Mindfulness", categoryColor: "#4BBDA0", cardBackground: "#FFF4C2", name: "5-Min Stretch Break", description: "Release tension and reset your body." },
  ],
  good: [
    { emoji: "🚀", category: "Focus", categoryColor: "#FF6B4A", cardBackground: "#EAE7FA", name: "Tackle a Priority Task", description: "Your energy is elevated — use it for something meaningful." },
    { emoji: "🎨", category: "Creative", categoryColor: "#8B7FCC", cardBackground: "#D1F2EB", name: "Start a Creative Project", description: "Harness your good mood into something lasting." },
    { emoji: "📅", category: "Planning", categoryColor: "#4BBDA0", cardBackground: "#FFF4C2", name: "Plan Tomorrow's Goals", description: "Ride this clarity to set yourself up for success." },
  ],
  great: [
    { emoji: "🚀", category: "Focus", categoryColor: "#FF6B4A", cardBackground: "#EAE7FA", name: "Tackle Your Top Goal", description: "This energy is rare — channel it into what matters." },
    { emoji: "🎨", category: "Creative", categoryColor: "#8B7FCC", cardBackground: "#D1F2EB", name: "Start Something New", description: "Begin a project that excites you." },
    { emoji: "🤝", category: "Connect", categoryColor: "#4BBDA0", cardBackground: "#FFF4C2", name: "Reach Out to Someone", description: "Share your great mood with someone you care about." },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userName, moodKey, moodLabel, energy, stress, focus, motivation, tone, showProductivity, showSelfCare, showInsights } = await req.json();
    const fallback = fallbackByMood[moodKey] || fallbackByMood.neutral;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ suggestions: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are a compassionate wellness and productivity companion for a mood tracking app called MoodFlow.

Generate exactly 3 personalized activity suggestions for a user based on their current emotional state. These must feel different every time — never repeat common suggestions like "drink water" or "go for a walk" unless mood truly calls for something gentle.

Rules:
- Exactly 3 suggestions.
- Cover different areas: one physical/environmental, one mental/creative, one social/relational.
- Make suggestions specific and actionable. Not "meditate" but "Try a 5-minute body scan focusing on releasing tension from your shoulders."
- Use slider data: low focus → low-mental-effort, high stress → calming, high energy → active or creative.
- If showProductivity is false: avoid work/task suggestions.
- If showSelfCare is false: avoid rest/wellness suggestions.
- Tone: warm = nurturing, playful = fun and light, calm = gentle and mindful.
- Return ONLY a valid JSON array of exactly 3 objects. No markdown. No explanation.
- Format: [{"emoji":"🎨","category":"Creative","categoryColor":"#8B7FCC","cardBackground":"#EAE7FA","name":"Short punchy name (max 5 words)","description":"One sentence."}]
- Rotate cardBackground across the 3 cards: "#EAE7FA" then "#D1F2EB" then "#FFF4C2"
- categoryColor options: "#8B7FCC" (lavender), "#4BBDA0" (mint), "#A07000" (amber), "#FF6B4A" (coral)

User: ${userName || "friend"}
Mood: ${moodLabel || moodKey}
Energy: ${energy ?? 50}/100, Stress: ${stress ?? 50}/100, Focus: ${focus ?? 50}/100, Motivation: ${motivation ?? 50}/100
Tone: ${tone || "warm"}
Preferences — Productivity: ${showProductivity ?? true}, Self-Care: ${showSelfCare ?? true}, Insights: ${showInsights ?? true}`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 800 } }),
      },
    );
    if (!r.ok) {
      console.error("ai-suggestions gemini error:", r.status, await r.text());
      return new Response(JSON.stringify({ suggestions: fallback, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    let suggestions: any[];
    try {
      suggestions = JSON.parse(cleaned);
      if (!Array.isArray(suggestions) || suggestions.length === 0) throw new Error("bad shape");
    } catch (err) {
      console.error("parse error:", err, raw);
      suggestions = fallback;
    }
    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-suggestions error:", e);
    return new Response(JSON.stringify({ suggestions: fallbackByMood.neutral, source: "fallback" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});