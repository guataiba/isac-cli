import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runClaudePhase } from "./claude-runner.js";
import { PHASE_0_TOOLS } from "./tools.js";
import { getScreenshotPrompt } from "../prompts/screenshot-capturer.js";
import { log } from "../ui/logger.js";
import type { PipelineContext, PhaseResult } from "./types.js";

const DEFAULT_FONT_DATA = JSON.stringify({
  fontFaces: [],
  roles: {
    body: "system-ui, -apple-system, sans-serif",
    heading: "system-ui, -apple-system, sans-serif",
    mono: '"SF Mono", ui-monospace, monospace',
  },
}, null, 2);

const DEFAULT_ICON_DATA = JSON.stringify({
  library: "none",
  icons: [],
  count: 0,
}, null, 2);

const DEFAULT_BRAND_DATA = JSON.stringify({
  companyName: null,
  tagline: null,
  description: null,
  logoUrl: null,
  faviconUrl: null,
  ogImageUrl: null,
  aboutText: "",
}, null, 2);

export async function runPhase0(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<PhaseResult> {
  const start = Date.now();

  // Directories are created by the orchestrator before Phase 0 runs
  const screenshotDir = join(ctx.cwd, ctx.screenshotDir);
  const fontsDir = join(ctx.cwd, ".claude/fonts");

  try {
    const result = await runClaudePhase(
      {
        name: "phase-0-screenshot",
        prompt: getScreenshotPrompt(ctx.url),
        allowedTools: [...PHASE_0_TOOLS],
        model: "claude-sonnet-4-6",
        timeout: 180_000,
        maxTurns: 25,
        activityTimeout: 180_000, // Chrome MCP startup + page load can have long gaps
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    // Update session ID for chaining
    ctx.sessionId = result.sessionId;

    // Validate screenshots
    const fullPagePath = join(screenshotDir, "full-page.png");
    const valid = existsSync(fullPagePath);

    if (valid) {
      log.success("full-page.png (light)");
      const darkPath = join(screenshotDir, "full-page-dark.png");
      if (existsSync(darkPath)) {
        log.success("full-page-dark.png (dark)");
      }
    } else {
      log.error("full-page.png not found — screenshot capture failed");
    }

    // Safety net: create default font-data.json if agent didn't write it
    const fontDataPath = join(fontsDir, "font-data.json");
    if (!existsSync(fontDataPath)) {
      writeFileSync(fontDataPath, DEFAULT_FONT_DATA, "utf-8");
      log.warn("font-data.json not created by agent — wrote default (system fonts)");
    }

    // Safety net: create default brand-data.json if agent didn't write it
    const brandDir = join(ctx.cwd, ".claude/branding");
    const brandDataPath = join(brandDir, "brand-data.json");
    if (!existsSync(brandDataPath)) {
      // Try to populate companyName from URL
      let defaultBrand = JSON.parse(DEFAULT_BRAND_DATA);
      try {
        const u = new URL(ctx.url);
        const domain = u.hostname.replace(/^www\./, "");
        const name = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
        defaultBrand = { ...defaultBrand, companyName: name };
      } catch { /* ignore */ }
      writeFileSync(brandDataPath, JSON.stringify(defaultBrand, null, 2), "utf-8");
      log.warn("brand-data.json not created by agent — wrote default from URL");
    }

    // Safety net: create default icon-data.json if agent didn't write it
    const iconsDir = join(ctx.cwd, ".claude/icons");
    const iconDataPath = join(iconsDir, "icon-data.json");
    if (!existsSync(iconDataPath)) {
      writeFileSync(iconDataPath, DEFAULT_ICON_DATA, "utf-8");
      log.warn("icon-data.json not created by agent — wrote default (no icons)");
    }

    // Validate icon extraction (non-blocking)
    try {
      const iconData = JSON.parse(readFileSync(iconDataPath, "utf-8"));
      const lib = iconData?.library ?? "none";
      const count = iconData?.count ?? 0;
      log.success(`icon-data.json: library="${lib}", ${count} icons detected`);
    } catch {
      log.warn("icon-data.json exists but is not valid JSON");
    }

    // Validate font extraction (non-blocking) — file always exists after safety net
    try {
      const fontData = JSON.parse(readFileSync(fontDataPath, "utf-8"));
      const faceCount = fontData?.fontFaces?.length ?? 0;
      const roles = fontData?.roles;
      log.success(`font-data.json: ${faceCount} font faces, roles: ${roles ? Object.keys(roles).join("/") : "none"}`);
    } catch {
      log.warn("font-data.json exists but is not valid JSON");
    }

    // Validate brand extraction (non-blocking) — file always exists after safety net
    try {
      const brandData = JSON.parse(readFileSync(brandDataPath, "utf-8"));
      const name = brandData?.companyName;
      log.success(`brand-data.json: ${name ? `"${name}"` : "no company name"}`);
    } catch {
      log.warn("brand-data.json exists but is not valid JSON");
    }

    return {
      phase: "phase-0-screenshot",
      success: valid,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      error: valid ? undefined : "Screenshot file not created",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-0-screenshot",
      success: false,
      duration: Date.now() - start,
      error: msg,
    };
  }
}
