import type { City, Unit } from "../cities/types.ts";

export interface Config {
  cities: City[];
  defaultCity: string | null;
  unit: Unit;
}
