## Why Nearby Places isn't working

The page makes **two backend calls**:

1. `ai-places` — picks 4 place categories from your mood. ✅ Works (returns 200).
2. `nearby-places` — supposed to call Google Places API to fetch real businesses. ❌ **This function was never actually created** in the project, so every call returns "Failed to fetch" — both for typed cities ("Long Beach, CA") and for geolocation (lat/long).

The `GOOGLE_PLACES_API_KEY` secret is set, but there's no edge function using it.

## The Fix

### 1. Create the missing `supabase/functions/nearby-places/index.ts` edge function

It needs to:
- Accept either `{ address, placeTypes, radius }` or `{ latitude, longitude, placeTypes, radius }` from the client.
- If given an `address`, call Google **Geocoding API** to convert it into lat/long.
- For each `placeType` (e.g. `gym`, `park`, `restaurant`), call Google **Places Nearby Search API** in parallel and collect up to ~3 results per type.
- Return a structured JSON response:
  ```json
  { "results": { "gym": [...], "park": [...], ... }, "source": "google" }
  ```
- Include proper CORS headers on every response (including errors).
- **Never throw a 500** — wrap all errors and return `{ error, fallback: true, results: {} }` with status 200 so the UI can show a graceful message instead of crashing.

### 2. Verify the frontend handles the response correctly

Quickly confirm `NearbyPlaces.tsx` reads `placesData.results` in the shape the new function returns. Adjust either side if needed so they line up.

### 3. Test end-to-end

After deploying, test with both:
- A typed city ("Long Beach, CA")
- Browser geolocation

Check the edge function logs to confirm Google Places is actually being hit and the API key is valid.

## What you'll see after the fix

- Real businesses (names, ratings, vicinity) grouped by category
- "Get Directions" links opening Google Maps
- A clear error message (not a silent failure) if the Google API key has issues
