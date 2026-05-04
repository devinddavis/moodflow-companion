## Goals

1. Let users return to today's activity Suggestions after leaving the screen.
2. Make AI-generated Suggestions, Affirmations, and Insights feel fresh and varied — both on first generation and on demand.

## Changes

### 1. Persistent access to Suggestions

- **`src/components/layout/AppSidebar.tsx`** — Add a new nav item "Today's Suggestions" (`/suggestions`, emoji ✨ or 🌟) between Daily Check-In and Affirmations. Only visible/clickable when a today entry exists (otherwise route the user to `/checkin`). The page already reads cached `aiSuggestions` from `getTodayEntry()`, so revisiting will instantly restore the same suggestions.

- **`src/pages/Dashboard.tsx`** — Add a small "View today's suggestions →" link/card when a today entry exists, pointing to `/suggestions`. (Quick-access shortcut so users don't need the sidebar.)

### 2. Fresher, more unique AI output

Currently each page caches one result per day on the `todayEntry` and never asks the model again, and the prompts have no anti-repetition seeding — so users see the same items repeatedly.

#### A. Add a manual "Regenerate" action on each AI page

- **`src/pages/Suggestions.tsx`**, **`src/pages/Affirmations.tsx`**, **`src/pages/Insights.tsx`**
  - Add a small "🔄 Regenerate" button near the header.
  - On click: re-invoke the corresponding edge function with a new random `seed` and `avoid` list (recent items already shown today), update local state, and persist the new value to `todayEntry`.
  - Keep cached values on first load so repeat visits are instant; regeneration is opt-in.

#### B. Track recent items to avoid repeats

- **`src/lib/mood-data.ts`** — Extend `MoodEntry` with optional `aiSuggestionHistory?: any[]`, `aiAffirmationHistory?: string[]`, `aiInsightHistory?: any[]` (kept only for today's entry, capped to last ~12 items).
- **`src/lib/mood-store.ts`** — Add helper `appendAiHistory(field, items)` that merges into the today entry and trims length.
- When pages call edge functions, send `avoid: history` so the model is told what NOT to repeat.

#### C. Make prompts demand novelty

Update each edge function to:
- Accept new optional body fields: `seed` (random int), `avoid` (string[] of titles/text already used).
- Add an `avoid` block to the prompt: "Do NOT repeat or rephrase any of these recent items: …".
- Add a randomness instruction: "Surprise the user with a less obvious angle. Vary categories, verbs, and metaphors from anything common."
- Bump `temperature` to `1.1` and add `topP: 0.95` for more variety.
- Use the `seed` value in the prompt text ("Variation seed: 4827 — pick a creative direction this seed suggests") to nudge different outputs even with identical mood inputs.

Edge functions to update:
- `supabase/functions/ai-suggestions/index.ts`
- `supabase/functions/ai-affirmations/index.ts`
- `supabase/functions/ai-insight/index.ts`
- `supabase/functions/ai-quote/index.ts` (same treatment so the daily quote also varies on regenerate)

#### D. Frontend wiring

In each page's regenerate handler, build payload:
```ts
{ ...basePayload, seed: Math.floor(Math.random() * 100000), avoid: history }
```
On success, prepend new items to the history (capped) and save via `updateTodayEntry` + `appendAiHistory`.

## Out of scope

- No DB migration needed — all state stays in localStorage on `todayEntry`.
- No changes to Nearby Places, auth, or other flows.
