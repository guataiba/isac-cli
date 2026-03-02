import chalk from "chalk";
import type { FrameworkAdapter } from "@guataiba/isac-core";
import { nextjsAdapter } from "@guataiba/isac-nextjs";

export const ADAPTERS: Record<string, FrameworkAdapter> = {
  nextjs: nextjsAdapter,
};

export function resolveAdapter(name: string): FrameworkAdapter {
  const adapter = ADAPTERS[name];
  if (!adapter) {
    const available = Object.keys(ADAPTERS).join(", ");
    console.error(
      chalk.red(`  Error: Unknown framework "${name}". Available: ${available}`),
    );
    process.exit(1);
  }
  return adapter;
}
