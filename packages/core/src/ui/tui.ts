import chalk from "chalk";

// ── State ────────────────────────────────────────────────────────────
let currentPhase = "";
let currentTool = "";
let animTimer: ReturnType<typeof setInterval> | null = null;
let spinnerFrame = 0;
let phaseStart = 0;
let phaseCostUsd = 0;
let totalCostUsd = 0;
let toolCounts: Record<string, number> = {};

const SPINNER = ["\u28CB", "\u28D9", "\u28F9", "\u28F8", "\u28FC", "\u28F4", "\u28E6", "\u28E7", "\u28C7", "\u28CF"];
const INTERVAL_MS = 80;

// ── Helpers ──────────────────────────────────────────────────────────
function getWidth(): number {
  return process.stdout.columns ?? 80;
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function truncateLine(str: string, max: number): string {
  const plain = stripAnsi(str);
  if (plain.length <= max) return str;

  // Walk through string tracking visible chars
  let visible = 0;
  let i = 0;
  while (i < str.length && visible < max - 1) {
    if (str[i] === "\x1b") {
      const end = str.indexOf("m", i);
      if (end !== -1) {
        i = end + 1;
        continue;
      }
    }
    visible++;
    i++;
  }
  return str.slice(0, i) + "\x1b[0m";
}

function formatElapsed(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}m${remainSecs.toString().padStart(2, "0")}s`;
}

// ── Rendering ────────────────────────────────────────────────────────
function renderFrame() {
  const frame = chalk.cyan(SPINNER[spinnerFrame % SPINNER.length]);
  spinnerFrame++;

  const elapsed = formatElapsed(Date.now() - phaseStart);
  const tool = currentTool ? chalk.dim(` \u00b7 ${currentTool}`) : "";
  const line = `  ${frame} ${currentPhase}${tool} ${chalk.dim(`(${elapsed})`)}`;

  process.stdout.write(`\r\x1b[K${truncateLine(line, getWidth() - 1)}`);
}

function startAnimation() {
  stopAnimation();
  spinnerFrame = 0;
  animTimer = setInterval(renderFrame, INTERVAL_MS);
}

function stopAnimation() {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }
  process.stdout.write("\r\x1b[K");
}

// ── Safe logging (interleaves with spinner without breaking it) ──────
export function logLine(text: string) {
  if (animTimer) {
    process.stdout.write("\r\x1b[K");
    console.log(text);
    renderFrame();
  } else {
    console.log(text);
  }
}

// ── Public API ───────────────────────────────────────────────────────
export function setPhase(phaseName: string) {
  if (animTimer) {
    stopAnimation();
  }

  currentPhase = phaseName;
  currentTool = "";
  toolCounts = {};
  phaseCostUsd = 0;
  phaseStart = Date.now();
  startAnimation();
}

export function updateStatus(text: string) {
  currentPhase = text;
}

export function succeedPhase(message?: string) {
  const elapsed = formatElapsed(Date.now() - phaseStart);
  const label = message ?? currentPhase;
  const cost = phaseCostUsd > 0 ? ` \u00b7 $${phaseCostUsd.toFixed(2)}` : "";
  stopAnimation();
  console.log(chalk.green(`  \u2713 ${label}`) + chalk.dim(` (${elapsed}${cost})`));
}

export function failPhase(message?: string) {
  const label = message ?? `${currentPhase} failed`;
  const cost = phaseCostUsd > 0 ? ` \u00b7 $${phaseCostUsd.toFixed(2)}` : "";
  stopAnimation();
  console.log(chalk.red(`  \u2717 ${label}`) + chalk.dim(`${cost}`));
}

export function renderEvent(event: Record<string, unknown>) {
  if (!event) return;

  const type = event.type as string | undefined;

  if (type === "assistant" && event.subtype === "tool_use") {
    const toolName = (event.tool_name as string) ?? "unknown";
    toolCounts[toolName] = (toolCounts[toolName] ?? 0) + 1;

    // Shorten tool names for display
    currentTool = toolName
      .replace("mcp__chrome-devtools__", "")
      .replace("computer:", "")
      .replace("mcp__", "");
  }

  if (type === "result") {
    const cost = event.cost_usd as number | undefined;
    if (cost !== undefined && cost > 0) {
      phaseCostUsd = cost;
      totalCostUsd += cost;
    }
    currentTool = "";
  }
}

export function renderToolUse(toolName: string) {
  currentTool = toolName
    .replace("mcp__chrome-devtools__", "")
    .replace("computer:", "")
    .replace("mcp__", "");
}

export function getToolCounts(): Record<string, number> {
  return { ...toolCounts };
}

export function getTotalCost(): number {
  return totalCostUsd;
}

export function stopSpinner() {
  stopAnimation();
}
