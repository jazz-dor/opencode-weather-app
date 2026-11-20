import type { City, Unit } from "./City.ts";

export interface Config {
  cities: City[];
  defaultCity: string | null;
  unit: Unit;
}
