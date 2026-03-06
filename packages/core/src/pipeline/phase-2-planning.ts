import { runClaudePhase } from "./claude-runner.js";
import { PHASE_2_TOOLS } from "./tools.js";
import { log } from "../ui/logger.js";
import { PagePlanSchema, SECTION_TYPES } from "../catalog/index.js";
import type { PagePlan } from "../catalog/index.js";
import type { PipelineContext, PhaseResult } from "./types.js";

export interface Phase2Result extends PhaseResult {
  /** Raw plan text (Markdown or JSON string) — always populated */
  plan: string;
  /** Validated structured plan — only populated when JSON parsing + Zod validation succeed */
  pagePlan?: PagePlan;
  /** json-render spec — only populated when engine is 'json-render' and parsing succeeds */
  jsonRenderSpec?: JsonRenderSpec;
}

/** Minimal type for a json-render spec */
export interface JsonRenderSpec {
  root: string;
  elements: Record<string, {
    type: string;
    props: Record<string, unknown>;
    children: string[];
  }>;
}

/**
 * Try to extract and validate a PagePlan JSON from Claude's response.
 * Returns the parsed plan or undefined if extraction/validation fails.
 */
function tryParsePagePlan(text: string): PagePlan | undefined {
  const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
  const raw = jsonBlock?.[1] ?? text;

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return undefined;

  try {
    const obj = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    const result = PagePlanSchema.safeParse(obj);
    if (result.success) {
      return result.data;
    }
    log.warn(`PagePlan validation failed: ${result.error.issues.map(i => i.message).join(", ")}`);
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Try to extract and validate a json-render spec from Claude's response.
 * Validates that root exists, elements map is populated, and each element has type+props+children.
 */
function tryParseJsonRenderSpec(text: string): JsonRenderSpec | undefined {
  const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
  const raw = jsonBlock?.[1] ?? text;

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return undefined;

  try {
    const obj = JSON.parse(raw.slice(firstBrace, lastBrace + 1));

    if (typeof obj.root !== "string" || !obj.elements || typeof obj.elements !== "object") {
      log.warn("json-render spec missing root or elements");
      return undefined;
    }

    const rootEl = obj.elements[obj.root];
    if (!rootEl) {
      log.warn(`json-render spec root "${obj.root}" not found in elements`);
      return undefined;
    }

    // Validate each element has type, props, children
    for (const [id, el] of Object.entries(obj.elements)) {
      const e = el as Record<string, unknown>;
      if (typeof e.type !== "string") {
        log.warn(`json-render spec element "${id}" missing type`);
        return undefined;
      }
      if (!e.props || typeof e.props !== "object") {
        log.warn(`json-render spec element "${id}" missing props`);
        return undefined;
      }
      if (!Array.isArray(e.children)) {
        // Auto-fix: add empty children array if missing
        e.children = [];
      }
    }

    return obj as JsonRenderSpec;
  } catch {
    return undefined;
  }
}

export async function runPhase2(
  ctx: PipelineContext,
  onEvent?: (event: Record<string, unknown>) => void,
): Promise<Phase2Result> {
  const start = Date.now();

  try {
    // Select prompt based on engine
    let prompt: string;
    if (ctx.engine === "json-render" && ctx.adapter.getJsonRenderPrompt) {
      prompt = ctx.adapter.getJsonRenderPrompt(ctx.screenshotDir);
      log.info("Using json-render engine for planning");
    } else if (ctx.adapter.getPagePlannerPromptV2) {
      prompt = ctx.adapter.getPagePlannerPromptV2(ctx.screenshotDir, [...SECTION_TYPES]);
    } else {
      prompt = ctx.adapter.getPagePlannerPrompt(ctx.screenshotDir);
    }

    const result = await runClaudePhase(
      {
        name: "phase-2-planning",
        prompt,
        allowedTools: [...PHASE_2_TOOLS],
        model: "claude-sonnet-4-6",
        timeout: 180_000,
        maxTurns: 15,
        activityTimeout: 180_000,
      },
      ctx.cwd,
      ctx.sessionId,
      onEvent,
    );

    ctx.sessionId = result.sessionId;

    const valid = result.result.length > 100;

    let pagePlan: PagePlan | undefined;
    let jsonRenderSpec: JsonRenderSpec | undefined;

    if (valid) {
      if (ctx.engine === "json-render") {
        // Try parsing as json-render spec
        jsonRenderSpec = tryParseJsonRenderSpec(result.result);
        if (jsonRenderSpec) {
          const elementCount = Object.keys(jsonRenderSpec.elements).length;
          log.success(`json-render spec: ${elementCount} elements (validated)`);
        } else {
          log.warn("json-render spec parsing failed — falling back to PagePlan");
          pagePlan = tryParsePagePlan(result.result);
          if (pagePlan) {
            log.success(`Fallback: ${pagePlan.sections.length} sections (PagePlan JSON)`);
          }
        }
      } else {
        pagePlan = tryParsePagePlan(result.result);
        if (pagePlan) {
          log.success(`Structured plan: ${pagePlan.sections.length} sections (JSON validated)`);
        } else {
          const sectionMatches = result.result.match(/###\s+\d+\./g);
          const sectionCount = sectionMatches?.length ?? 0;
          log.success(
            sectionCount > 0
              ? `${sectionCount} sections planned (Markdown)`
              : "Plan created (Markdown)",
          );
        }
      }
    } else {
      log.error("Plan is empty or too short");
    }

    return {
      phase: "phase-2-planning",
      success: valid,
      duration: Date.now() - start,
      costUsd: result.costUsd,
      plan: result.result,
      pagePlan,
      jsonRenderSpec,
      error: valid ? undefined : "Plan generation failed",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(msg);
    return {
      phase: "phase-2-planning",
      success: false,
      duration: Date.now() - start,
      plan: "",
      error: msg,
    };
  }
}
