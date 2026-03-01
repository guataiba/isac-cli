import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CONFIG_FILENAME = "isac.config.json";

export interface IsacConfig {
  projectName: string;
  framework: "nextjs";
  css: "tailwind" | "css-modules" | "vanilla";
  componentLibrary: "shadcn" | "radix" | "headless" | "none";
  iconLibrary: "lucide" | "heroicons" | "phosphor" | "radix-icons" | "none";
  fonts: "google" | "system" | "custom";
  colorScheme: "both" | "light" | "dark";
}

export function readConfig(dir: string): IsacConfig | null {
  const configPath = join(dir, CONFIG_FILENAME);
  if (!existsSync(configPath)) return null;
  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as IsacConfig;
  } catch {
    return null;
  }
}

export function writeConfig(dir: string, config: IsacConfig): void {
  const configPath = join(dir, CONFIG_FILENAME);
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}
