# Plan: Real Nearby Places + Gemini-Powered AI Features

## Heads-up before we start

You already have **Lovable AI** wired into the Nearby Places feature, which doesn't need any API key from you. Your prompt asks me to switch everything over to **Google Gemini directly** using your own `VITE_GEMINI_API_KEY`. I'll do exactly that, but two things to know:

1. You'll need to provide **two** API keys after I set this up: one for Gemini and one for Google Places. I'll prompt you for both.
2. Even though the variables start with `VITE_`, I will **not** expose them to the browser. All Google calls happen inside secure backend functions. I'll store them as backend secrets named `GEMINI_API_KEY` and `GOOGLE_PLACES_API_KEY` (the `VITE_` prefix is only used for browser-exposed vars in Vite, so keeping them server-side is the safe choice). If you'd rather keep the literal `VITE_` names, let me know.

If you'd prefer to keep using Lovable AI (no key required, already working) for the AI features and only add Google Places for real locations, just say the word and I'll do that instead.

---

## What gets built

### 1. Backend (Edge Functions)
Six secure backend functions, each with caching, validation, and fallbacks:

- `ai-quote` — generates the personalized quote after check-in
- `ai-suggestions` — generates the 3 activity cards
- `ai-affirmations` — generates the 4 daily affirmations
- `ai-insight` — generates the wellness insight card
- `ai-places` — picks 4 Google Places type keywords for the user's mood (replaces the existing one)
- `nearby-places` — calls Google Places Nearby Search + Geocoding, returns real businesses

All Gemini calls use `gemini-2.0-flash` via `https://generativelanguage.googleapis.com/v1beta/...`. All functions return graceful static fallbacks on any error (rate limit, missing key, parse failure).

### 2. Database
A new `mood_entries` table to persist check-ins and cache AI content per day:
- `id, user_id, created_at, mood_key, mood_label, energy, stress, focus, motivation`
- `ai_quote` (text), `ai_suggestions` (jsonb), `ai_affirmations` (jsonb), `ai_insight` (jsonb)
- RLS policies so users only see their own entries

A `profiles` table for `display_name` and a `user_roles` table for admin access (proper, secure pattern).

Authentication will be added (email + password, with Google sign-in) so entries can be tied to a user. Right now everything lives in `localStorage`, which means caching across devices isn't possible.

### 3. Frontend changes

**Check-in flow (`CheckIn.tsx` → `Suggestions.tsx`)**
- On submit: save the entry to the database, then fire `ai-quote` and `ai-suggestions` in parallel
- Suggestions page reads cached AI content from the DB if it already exists for today
- Pulsing skeleton cards while generating; 0.3s opacity fade-in when ready
- AI quote card sits between suggestion cards and the affirmation teaser (per spec)
- Static rule-based suggestions as fallback

**Affirmations (`Affirmations.tsx`)**
- Check DB for today's `ai_affirmations`; if present, render those as cycling cards with 🌸 ✨ 🌿 💫
- Otherwise call `ai-affirmations`, save, render
- Static fallback per mood key

**Insights (`Insights.tsx`)**
- Insert AI insight card at top of grid with subtle "✨ AI Insight" pill, themed lavender/mint/yellow
- Cached in DB; hidden entirely on failure

**Nearby Places (`NearbyPlaces.tsx`)**
- Gate behind today's check-in with friendly prompt + "Start Check-In →" button
- Replace silent geolocation with permission card → "Share My Location" button
- City/zip fallback input → calls `nearby-places` with `address` parameter (function does Geocoding server-side)
- Calls `ai-places` to get 4 type strings, then `nearby-places` for real businesses
- Renders grouped category sections with alternating mint-pale / lavender-pale cards (24px radius, soft shadow)
- Each place card: name, address, ⭐ rating + review count (or "No rating yet"), "Get Directions →" link
- Dynamic subtitle keyed off mood (struggling/low → gentle copy, etc.)
- Refresh 🔄 button bypasses cache and re-runs both AI + Places
- Skeletons during load, error state with retry, per-category empty state
- If `GOOGLE_PLACES_API_KEY` missing: show AI category cards + "⚠️ Add your Google Places API key…" placeholder

### 4. Caching rules
- AI content saved to the mood entry on first generation
- Subsequent same-day page loads read from DB
- New check-in overwrites previous day's AI content
- Nearby Places' Refresh button is the one exception that re-calls Gemini

---

## What I'll need from you (after the build)

1. A **Google Gemini API key** — get one free at https://aistudio.google.com/app/apikey
2. A **Google Places API key** — from Google Cloud Console with "Places API" and "Geocoding API" enabled, plus billing enabled (Google requires billing on, but gives generous free monthly credit)

I'll prompt you to paste both after the code is in place. The app will work with graceful fallbacks even if you delay adding them.

---

## Build order
1. Set up auth + database tables (mood entries, profiles, roles) with RLS
2. Migrate `mood-store` from localStorage to Supabase queries
3. Create the 6 edge functions with fallback logic
4. Update CheckIn → Suggestions flow with parallel AI + caching
5. Update Affirmations + Insights with DB-cached AI
6. Rebuild Nearby Places page with permission card, city fallback, real Places results
7. Prompt you for the two API keys

Approve this and I'll start building.
