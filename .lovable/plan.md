## Goal

Make the Insights page show different cards based on the user's mood, even when the AI falls back (which is happening constantly due to Gemini quota limits). Do this by expanding `INSIGHT_CARDS` into a mood-keyed library and selecting from it based on today's check-in.

## Why

The `ai-insight` edge function is currently returning `null` on every call because Gemini's free-tier quota is exhausted (HTTP 429 in the logs). The frontend then renders only the static `INSIGHT_CARDS` from `src/lib/mood-data.ts` — and those are the same 4 cards regardless of mood. Expanding the static library and picking by mood means insights feel personalized even with zero AI calls.

## Changes

### 1. `src/lib/mood-data.ts` — Expand insights into a mood-keyed bank

Replace the flat `INSIGHT_CARDS` array with a `INSIGHT_BANK` object keyed by `moodKey` (the same keys used by check-in: e.g. `happy`, `calm`, `sad`, `anxious`, `angry`, `tired`, `excited`, `neutral` — match whatever keys `mood-store` already uses).

For each mood, write **5–6 unique insight cards** with:
- Mood-relevant `category` (e.g. "Stress Science" for anxious, "Energy & Sleep" for tired, "Joy Research" for happy)
- Distinct `emoji`, `title`, `body`, `tag`, and `colorClass` (cycling lavender-pale / mint-pale / yellow-pale)
- Real psychology / wellness facts tailored to that emotional state

Also keep a `DEFAULT_INSIGHTS` array as a safety net for unknown mood keys.

Export a helper:
```ts
export function getInsightsForMood(moodKey: string, count = 4, seed?: string): InsightCard[]
```
This deterministically (or pseudo-randomly via seed) picks `count` cards from the mood's bank so the same day shows the same cards but different days/moods show different ones.

### 2. `src/pages/Insights.tsx` — Use mood-aware selection

- Import `getInsightsForMood` instead of `INSIGHT_CARDS`.
- Compute `const cards = getInsightsForMood(todayEntry?.moodKey ?? 'neutral', 4, todayEntry?.date)`.
- Render `cards.map(...)` instead of `INSIGHT_CARDS.map(...)`.
- Keep the existing AI insight card on top — when AI succeeds, user sees 1 AI + 4 mood-matched static cards; when AI fails (current state), they still see 4 mood-matched static cards.

### 3. Leave edge function & AI flow untouched

No changes to `ai-insight/index.ts`. The avoid-list / seed logic from the prior change stays. When Gemini quota recovers, AI insights will naturally start appearing again on top of the now-personalized fallback cards.

## Out of scope

- Refresh button (per earlier decision).
- Switching AI providers / models to dodge the Gemini quota.
- Changes to suggestions or affirmations (only insights this round, per your message).