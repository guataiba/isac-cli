import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

vi.mock("../pipeline/phase-0-screenshot.js", () => ({
  createPhase0EventHandler: () => () => {},
  runPhase0: vi.fn(async () => {
    throw new Error("phase0 boom");
  }),
}));

vi.mock("../ui/tui.js", () => ({
  setPhase: vi.fn(),
  succeedPhase: vi.fn(),
  failPhase: vi.fn(),
  renderEvent: vi.fn(),
  stopSpinner: vi.fn(),
  getTotalCost: vi.fn(() => 0),
}));

import { runPipeline } from "../pipeline/orchestrator.js";

describe("runPipeline MCP cleanup", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "isac-orchestrator-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("removes temporary chrome-devtools MCP config when phase 0 crashes", async () => {
    const adapter = {
      getRequiredDirs: () => [],
      getDesignSystemTemplates: () => [],
      getStubDataTemplate: () => ({ path: "app/design-system/data.ts", content: "export const data = {};\n" }),
      collectCreatedFiles: () => [],
      getVisualVerifierPrompt: () => "verify",
    };

    await expect(
      runPipeline({
        url: "https://example.com",
        dir: tempDir,
        maxRetries: 1,
        mode: "design-system",
        stopAfter: null,
        adapter: adapter as any,
      }),
    ).rejects.toThrow("phase0 boom");

    expect(existsSync(join(tempDir, ".mcp.json"))).toBe(false);
  });
});
