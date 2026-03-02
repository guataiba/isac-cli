import { join } from "node:path";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

export function enableMcp(cwd: string): void {
  const mcpConfigPath = join(cwd, ".mcp.json");
  let mcpConfig: Record<string, unknown> = {};

  if (existsSync(mcpConfigPath)) {
    try {
      mcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
    } catch {
      mcpConfig = {};
    }
  }

  const servers = (mcpConfig.mcpServers as Record<string, unknown>) ?? {};
  if (servers["chrome-devtools"]) return;

  servers["chrome-devtools"] = {
    command: "npx",
    args: [
      "-y",
      "chrome-devtools-mcp@latest",
      "--headless",
      "--isolated",
    ],
  };

  mcpConfig.mcpServers = servers;
  writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2) + "\n", "utf-8");
}

export function disableMcp(cwd: string): void {
  const mcpConfigPath = join(cwd, ".mcp.json");
  if (!existsSync(mcpConfigPath)) return;

  try {
    const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8")) as Record<string, unknown>;
    const servers = mcpConfig.mcpServers as Record<string, unknown> | undefined;
    if (!servers?.["chrome-devtools"]) return;

    delete servers["chrome-devtools"];
    if (Object.keys(servers).length === 0) {
      unlinkSync(mcpConfigPath);
      return;
    }

    mcpConfig.mcpServers = servers;
    writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2) + "\n", "utf-8");
  } catch {
    // Ignore malformed content and leave file untouched.
  }
}
