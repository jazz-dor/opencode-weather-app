import type { Config } from "../types/Config.ts";
import { printSuccess, unitSymbol } from "../presentation/output.ts";
import { saveConfig } from "../storage/settingsStorage.ts";

export async function toggleUnit(config: Config): Promise<void> {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveConfig(config);
  printSuccess(`Unidad: ${unitSymbol(config.unit)}`);
}
