import type { City } from "../types/City.ts";
import { GEOCODE_URL } from "../utils/constants.ts";

interface GeocodingResult {
  name?: string;
  country?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

export async function geocodeCity(name: string): Promise<City | null> {
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding falló con estado ${res.status}`);
  }

  const data = (await res.json()) as GeocodingResponse;
  const hit = data.results?.[0];
  if (!hit || hit.latitude === undefined || hit.longitude === undefined) {
    return null;
  }

  return {
    name: hit.name ?? name,
    country: hit.country,
    admin1: hit.admin1,
    latitude: hit.latitude,
    longitude: hit.longitude,
  };
}
