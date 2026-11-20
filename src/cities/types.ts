export type Unit = "celsius" | "fahrenheit";

export interface City {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}
