## Problem

- **Suggestions** are cached after the first check-in and never regenerate. The frontend never sends an `avoid` history or `seed` to the edge function, so the model gravitates to the same 3 ideas regardless of slider values.
- **Insights** are cached the same way and only send `moodKey`, `moodLabel`, `energy`, `stress` — no focus/motivation, no avoid list, no seed. Once generated, the user sees the same card forever.

## Fix

### 1. `supabase/functions/ai-suggestions/index.ts`
- Accept new body fields: `avoid: string[]`, `seed: string`.
- Inject into the prompt: a "Do NOT suggest any of these (already used recently): ..." line, plus a "Variation seed: <seed>" line to push the model off its default attractors.
- Bump `temperature` to `1.1`, add `topP: 0.95`.
- Strengthen prompt: explicitly require suggestions to reflect the combined slider profile (e.g. "energy 80 + stress 20 + focus 70 → energetic, focused activity"; "energy 20 + stress 80 → grounding/calming"). Forbid generic items like "drink water", "go for a walk", "meditate" unless the slider profile truly demands it.

### 2. `supabase/functions/ai-insight/index.ts`
- Accept `focus`, `motivation`, `avoid: string[]`, `seed: string`.
- Include all four sliders in prompt and require the insight to be specifically relevant to that combined profile, not just the mood label.
- Add "Avoid these previous insight titles: ..." line and a "Variation seed: <seed>" line.
- Bump `temperature` to `1.1`, `topP: 0.95`.

### 3. `src/pages/Suggestions.tsx`
- Pass `avoid: todayEntry?.aiSuggestionHistory ?? []` and a fresh `seed: crypto.randomUUID()` in the invoke body for `ai-suggestions` (and `ai-quote`).
- After a successful response, call `appendAiHistory('aiSuggestionHistory', suggestions.map(s => s.name))` and `appendAiHistory('aiQuoteHistory', [quote])` so future generations avoid them.
- Use latest sliders from `state` (just-completed check-in) when present, otherwise from `todayEntry`, so a fresh check-in immediately influences generation.

### 4. `src/pages/Insights.tsx`
- Pass `focus`, `motivation`, `avoid: todayEntry?.aiInsightHistory ?? []`, `seed: crypto.randomUUID()`.
- After response, `appendAiHistory('aiInsightHistory', [insight.title])`.

### 5. Caching behavior
Keep the existing daily cache rule (per memory): once today's suggestions/insight are stored, the page reuses them on revisit. The avoid history accumulates across days so the next day's generation won't repeat recent items.

### 6. No DB / migration changes
History fields already exist on `MoodEntry` and `appendAiHistory` is already implemented in `mood-store.ts`.

## Out of scope
Refresh buttons; affirmations uniqueness (already handled in prior pass).
