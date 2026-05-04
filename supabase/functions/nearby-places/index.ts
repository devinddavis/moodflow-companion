import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface Body {
  address?: string;
  latitude?: number;
  longitude?: number;
  placeTypes?: string[];
  radius?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) return json({ error: "missing_key", results: {} });

    let body: Body = {};
    try { body = await req.json(); } catch { /* ignore */ }

    const placeTypes = Array.isArray(body.placeTypes) ? body.placeTypes.filter(Boolean).slice(0, 8) : [];
    const radius = Math.min(Math.max(body.radius ?? 5000, 500), 50000);

    if (placeTypes.length === 0) {
      return json({ error: "no_place_types", results: {} });
    }

    let lat = typeof body.latitude === "number" ? body.latitude : undefined;
    let lng = typeof body.longitude === "number" ? body.longitude : undefined;
    let resolvedCity: string | undefined;

    // Geocode if no coords
    if ((lat === undefined || lng === undefined) && body.address) {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(body.address)}&key=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (!geoRes.ok || geoData.status !== "OK" || !geoData.results?.length) {
        console.error("Geocode failed:", geoData.status, geoData.error_message);
        return json({ error: "geocode_failed", results: {}, googleStatus: geoData.status });
      }
      const loc = geoData.results[0].geometry.location;
      lat = loc.lat;
      lng = loc.lng;
      resolvedCity = geoData.results[0].formatted_address;
    }

    if (lat === undefined || lng === undefined) {
      return json({ error: "missing_location", results: {} });
    }

    // Nearby Search per type, in parallel
    const results: Record<string, any[]> = {};
    await Promise.all(
      placeTypes.map(async (type) => {
        try {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${encodeURIComponent(type)}&key=${apiKey}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            console.error(`Places ${type} failed:`, data.status, data.error_message);
            results[type] = [];
            return;
          }
          const items = (data.results || []).slice(0, 5).map((p: any) => ({
            place_id: p.place_id,
            name: p.name,
            rating: p.rating ?? null,
            user_ratings_total: p.user_ratings_total ?? null,
            vicinity: p.vicinity ?? p.formatted_address ?? null,
            open_now: p.opening_hours?.open_now ?? null,
            location: p.geometry?.location ?? null,
          }));
          results[type] = items;
        } catch (err) {
          console.error(`Error fetching ${type}:`, err);
          results[type] = [];
        }
      })
    );

    return json({
      results,
      latitude: lat,
      longitude: lng,
      city: resolvedCity,
      source: "google",
    });
  } catch (err) {
    console.error("nearby-places fatal error:", err);
    return json({ error: "internal_error", results: {}, fallback: true });
  }
});
