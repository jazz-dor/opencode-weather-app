import type { Config } from "./types.ts";
import { printSuccess, unitSymbol } from "../cli/output.ts";
import { saveConfig } from "./storage.ts";

export async function toggleUnit(config: Config): Promise<void> {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveConfig(config);
  printSuccess(`Unidad: ${unitSymbol(config.unit)}`);
}
