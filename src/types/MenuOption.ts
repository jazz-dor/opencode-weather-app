import type { Unit } from "./City.ts";

export interface MenuState {
  cityCount: number;
  defaultCity: string | null;
  unit: Unit;
  highlight?: string;
}
