import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONFIG_FILENAME } from "../../src/shared/constants.ts";

export interface TempCwd {
  dir: string;
  restore: () => Promise<void>;
  configPath: string;
  readConfigFile: () => Promise<string | null>;
  writeConfigFile: (content: string) => Promise<void>;
}

export async function withTempCwd(): Promise<TempCwd> {
  const previous = process.cwd();
  const dir = await mkdtemp(join(tmpdir(), "weather-cli-test-"));
  process.chdir(dir);

  const configPath = join(dir, CONFIG_FILENAME);

  const restore = async (): Promise<void> => {
    process.chdir(previous);
    await rm(dir, { recursive: true, force: true });
  };

  const readConfigFile = async (): Promise<string | null> => {
    try {
      return await readFile(configPath, "utf8");
    } catch {
      return null;
    }
  };

  const writeConfigFile = async (content: string): Promise<void> => {
    await writeFile(configPath, content, "utf8");
  };

  return { dir, restore, configPath, readConfigFile, writeConfigFile };
}
