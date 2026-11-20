import type { City } from "./types.ts";

export function cityLabel(city: City): string {
  const parts = [city.admin1, city.country].filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  return parts.length > 0 ? `${city.name} (${parts.join(", ")})` : city.name;
}
