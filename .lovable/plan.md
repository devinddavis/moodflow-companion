

## Plan: AI-Powered Nearby Places (No Google API Key Required)

### What We're Building
Upgrade the Nearby Places page so that instead of showing static hardcoded categories, it calls an AI model to generate **personalized place-type recommendations** based on the user's current mood, energy, and stress levels. No Google API key needed — the AI suggests *types* of places with warm explanations of why they'd help. The page is architected so a Google Places integration can be added later without restructuring.

### How It Works for You
1. Complete a daily check-in
2. Visit Nearby Places — the AI generates 4 tailored place categories (e.g., "Visit a cozy café," "Try a nature trail") with personalized reasons
3. Share your location or enter a city to get location-aware recommendations
4. Results are cached for the day so the AI isn't called repeatedly

### Technical Steps

**1. Create an edge function `ai-places`**
- Accepts mood data (moodKey, energy, stress, motivation), user name, city/location, and tone preference
- Sends the exact AI prompt from the spec to generate 4 place-type recommendations as JSON
- Returns the JSON array of `{type, label, reason, emoji}` objects

**2. Update `NearbyPlaces.tsx`**
- After location is granted (or city entered), call the `ai-places` edge function with today's mood data
- Show pulsing skeleton cards while the AI generates recommendations
- Display the AI-generated categories (replacing the current hardcoded mapping)
- Cache results in localStorage keyed by date + moodKey so repeat visits don't re-call the AI
- Remove the "Connect a Google Places API key" message — replace with a subtle note: "Real nearby businesses coming soon ✨"
- Add a "Refresh Places 🔄" button that clears cache and re-generates

**3. Keep the hardcoded categories as fallback**
- If the AI call fails or the user hasn't done a check-in, fall back to the existing static `placeCategoriesByMood` mapping
- This ensures the page always shows something useful

