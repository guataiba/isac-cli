import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { PipelineMode } from "./types.js";

// ── Types ───────────────────────────────────────────────────────────

interface FontFace {
  family: string;
  url?: string;
  weight?: string;
  style?: string;
}

interface FontData {
  fontFaces: FontFace[];
  roles: {
    body?: string;
    heading?: string;
    mono?: string;
  };
}

interface ColorData {
  backgrounds: {
    page: string | null;
    header: string | null;
    card: string | null;
    footer: string | null;
  };
  text: {
    heading: string | null;
    body: string | null;
    muted: string | null;
    link: string | null;
    hierarchy?: string[];
  };
  accents: {
    primary: string | null;
    primaryText: string | null;
  };
  borders: {
    default: string | null;
  };
  surfaces: {
    input: string | null;
  };
  _cssVars?: Record<string, string>;
  shapes?: {
    radii?: Array<{ value: string; count: number }>;
    shadows?: Array<{ value: string; count: number; source: string }>;
  };
}

// ── Gray scale steps ────────────────────────────────────────────────

const GRAY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/** Tailwind default gray scale — used as fallback when extracted data is unusable */
const DEFAULT_GRAY_SCALE: Map<number, string> = new Map([
  [50, "#f9fafb"], [100, "#f3f4f6"], [200, "#e5e7eb"],
  [300, "#d1d5db"], [400, "#9ca3af"], [500, "#6b7280"],
  [600, "#4b5563"], [700, "#374151"], [800, "#1f2937"],
  [900, "#111827"], [950, "#030712"],
]);

// ── Default fallbacks ───────────────────────────────────────────────

const DEFAULT_FONT: FontData = {
  fontFaces: [],
  roles: {
    body: "system-ui, -apple-system, sans-serif",
    heading: "system-ui, -apple-system, sans-serif",
    mono: '"SF Mono", ui-monospace, monospace',
  },
};

const DEFAULT_COLORS: ColorData = {
  backgrounds: { page: "#ffffff", header: "#f9fafb", card: "#ffffff", footer: "#f9fafb" },
  text: { heading: "#111827", body: "#1f2937", muted: "#6b7280", link: "#2563eb" },
  accents: { primary: "#2563eb", primaryText: "#ffffff" },
  borders: { default: "#e5e7eb" },
  surfaces: { input: "#ffffff" },
};

// ── Color utilities ─────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3
    ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/** Relative luminance (0..1) from hex */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const srgb = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/** WCAG contrast ratio between two hex colors (1..21) */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function isValidHex(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

// ── Sanity checks ───────────────────────────────────────────────────

/**
 * Check if extracted color data is minimally usable.
 * Returns false when Phase 0 produced garbage (e.g. consent screen, empty page).
 *
 * Note: dark sites are NOT considered garbage — they are handled by isDarkFirstSite().
 * This function only detects *structural* problems where the extraction is empty/broken.
 */
function isColorDataSane(colorData: ColorData): boolean {
  // 1. Must have at least 2 non-null text colors.
  //    If most text values are null, the extractor hit a wall or empty page.
  const { hierarchy: _h1, ...textOnly } = colorData.text;
  const textValues = Object.values(textOnly);
  const nonNullText = textValues.filter(v => isValidHex(v)).length;
  if (nonNullText < 2) return false;

  // 2. At least 3 distinct colors total — a real site has visual variety.
  const allColors = new Set<string>();
  for (const val of Object.values(colorData.backgrounds)) {
    if (isValidHex(val)) allColors.add(val.toLowerCase());
  }
  for (const val of Object.values(textOnly)) {
    if (isValidHex(val)) allColors.add(val.toLowerCase());
  }
  for (const val of Object.values(colorData.accents)) {
    if (isValidHex(val)) allColors.add(val.toLowerCase());
  }
  if (allColors.size < 3) return false;

  return true;
}

/**
 * Detect if the site is dark-first (dark background, light text).
 * Dark-first sites should use their dark palette as the primary :root theme
 * instead of fabricating a light mode that doesn't exist.
 */
function isDarkFirstSite(colorData: ColorData, darkData: ColorData | null): boolean {
  const bg = colorData.backgrounds.page;
  if (!isValidHex(bg)) return false;

  const bgLum = luminance(bg);

  // If page bg is dark (luminance < 0.15) and there is NO separate dark extraction
  // (meaning the site doesn't have a toggle — it IS dark), it's dark-first.
  if (bgLum < 0.15) {
    // If we have a separate dark extraction that is significantly different,
    // the site has both modes — not dark-first, just happened to load in dark.
    if (darkData && hasAnyColor(darkData)) {
      const darkBg = darkData.backgrounds.page;
      if (isValidHex(darkBg)) {
        const darkBgLum = luminance(darkBg);
        // Both extractions are dark → dark-first (no real light mode)
        if (darkBgLum < 0.15) return true;
        // Light extraction is dark but dark extraction is light → both exist, not dark-first
        return false;
      }
    }
    return true;
  }

  return false;
}

// ── Interpolation ───────────────────────────────────────────────────

/** Interpolate between two hex colors in HSL space at ratio t (0..1) */
function interpolateHsl(hex1: string, hex2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  let [h1, s1, l1] = rgbToHsl(r1, g1, b1);
  let [h2, s2, l2] = rgbToHsl(r2, g2, b2);

  // When an endpoint is achromatic (gray/white/black), its hue is arbitrary (0°).
  // Adopt the other color's hue to prevent tinted grays (e.g. purple-tinted neutrals).
  if (s1 < 0.04 && s2 >= 0.04) h1 = h2;
  else if (s2 < 0.04 && s1 >= 0.04) h2 = h1;
  else if (s1 < 0.04 && s2 < 0.04) { h1 = 0; h2 = 0; }

  // Use the shorter arc for hue interpolation
  let hDiff = h2 - h1;
  if (hDiff > 180) hDiff -= 360;
  if (hDiff < -180) hDiff += 360;

  const h = h1 + hDiff * t;
  const s = s1 + (s2 - s1) * t;
  const l = l1 + (l2 - l1) * t;
  const [r, g, b] = hslToRgb(h < 0 ? h + 360 : h, s, l);
  return rgbToHex(r, g, b);
}

// ── Helpers ─────────────────────────────────────────────────────────

function readJsonSafe<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    let parsed = JSON.parse(readFileSync(path, "utf-8"));
    // Handle double-stringified JSON (agent-browser eval wraps return values)
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch { return fallback; }
    }
    // If it's still not an object, use fallback
    if (typeof parsed !== "object" || parsed === null) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/** Sanitize a font family into a valid filename stem */
function fontFileName(family: string): string {
  return family.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
}

// ── Builders ────────────────────────────────────────────────────────

function buildFontFaces(fontData: FontData, cwd: string): string {
  const rules: string[] = [];
  const fontsDir = join(cwd, "public/fonts");

  // Find all .woff2 files in public/fonts
  let woff2Files: string[] = [];
  try {
    woff2Files = readdirSync(fontsDir).filter(f => f.endsWith(".woff2"));
  } catch {
    // Directory doesn't exist
  }

  for (const face of fontData.fontFaces) {
    if (!face.family) continue;

    // Try to find a matching woff2 file
    const stem = fontFileName(face.family);
    const weight = face.weight ?? "400";
    const style = face.style ?? "normal";

    // Look for exact match or partial match
    const matchingFile = woff2Files.find(f => {
      const lower = f.toLowerCase();
      const stemLower = stem.toLowerCase();
      return lower === `${stemLower}.woff2`
        || lower === `${stemLower}-${weight}.woff2`
        || lower.startsWith(stemLower);
    });

    if (!matchingFile) continue;

    // Verify the file actually exists and has content
    const fullPath = join(fontsDir, matchingFile);
    try {
      const stat = readFileSync(fullPath);
      if (stat.length < 100) continue; // Likely corrupt
    } catch {
      continue;
    }

    rules.push(`@font-face {
  font-family: "${face.family}";
  src: url("/fonts/${matchingFile}") format("woff2");
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`);
  }

  return rules.join("\n\n");
}

const MONO_FALLBACK = '"SF Mono", "Fira Code", ui-monospace, monospace';

/** Known mono font family names (case-insensitive match) */
const MONO_KEYWORDS = ["mono", "code", "consolas", "courier", "fira code", "jetbrains", "geist"];

function buildFontVars(roles: FontData["roles"], fontFaces?: FontFace[]): {
  fontSans: string;
  fontDisplay: string;
  fontMono: string;
} {
  let mono = roles?.mono;

  // If roles.mono is the generic fallback (no <code> found on page),
  // try to find a mono font from the extracted font-faces
  if (!mono || mono === '"SF Mono", monospace' || mono === "monospace") {
    const monoFace = fontFaces?.find(f =>
      MONO_KEYWORDS.some(kw => f.family.toLowerCase().includes(kw)),
    );
    if (monoFace) {
      mono = `"${monoFace.family}", ${MONO_FALLBACK}`;
    } else {
      mono = MONO_FALLBACK;
    }
  }

  return {
    fontSans: roles?.body ?? "system-ui, -apple-system, sans-serif",
    fontDisplay: roles?.heading ?? roles?.body ?? "system-ui, sans-serif",
    fontMono: mono,
  };
}

interface PrimitiveScale {
  grays: Map<number, string>; // step → hex
  accent: string;
  accentText: string;
  white: string;
  black: string;
  link: string | null;
  /** Extra named colors that don't fit the gray scale (e.g. exact text colors) */
  extras: Map<string, string>;
}

/** CSS var names that commonly hold a site's primary/accent color */
const CSS_VAR_ACCENT_NAMES = [
  "--primary-color", "--accent-color", "--brand-color",
  "--primary", "--accent", "--color-primary",
  "--theme-primary", "--color-accent", "--brand-primary",
];

/** Extract a valid accent color from CSS custom properties, if any */
function resolveCssVarAccent(cssVars?: Record<string, string>): string | null {
  if (!cssVars) return null;
  for (const name of CSS_VAR_ACCENT_NAMES) {
    const val = cssVars[name];
    if (isValidHex(val) && val.toLowerCase() !== "#ffffff" && val.toLowerCase() !== "#000000") {
      return val;
    }
  }
  return null;
}

function buildPrimitiveScale(colorData: ColorData): PrimitiveScale {
  // Determine lightest and darkest colors from the palette
  const allBgs = Object.values(colorData.backgrounds).filter(isValidHex);
  const allTexts = [colorData.text.heading, colorData.text.body].filter(isValidHex);

  // Sort by luminance to find actual lightest/darkest
  const allNeutrals = [...allBgs, ...allTexts];
  allNeutrals.sort((a, b) => luminance(b) - luminance(a));

  const lightest = allNeutrals.length > 0 ? allNeutrals[0] : "#ffffff";
  const darkest = allNeutrals.length > 0 ? allNeutrals[allNeutrals.length - 1] : "#111827";

  // Sanity check: if lightest ≈ darkest, use Tailwind default gray scale
  const lumDiff = Math.abs(luminance(lightest) - luminance(darkest));
  if (lumDiff < 0.1) {
    return {
      grays: new Map(DEFAULT_GRAY_SCALE),
      accent: isValidHex(colorData.accents.primary) ? colorData.accents.primary : "#2563eb",
      accentText: isValidHex(colorData.accents.primaryText) ? colorData.accents.primaryText : "#ffffff",
      white: "#ffffff",
      black: "#000000",
      link: isValidHex(colorData.text.link) ? colorData.text.link : null,
      extras: new Map(),
    };
  }

  // Collect all neutral-ish colors to detect the hue/saturation of grays
  const neutralSamples: string[] = [];
  for (const val of Object.values(colorData.backgrounds)) {
    if (isValidHex(val)) neutralSamples.push(val);
  }
  for (const val of [colorData.text.heading, colorData.text.body, colorData.text.muted]) {
    if (isValidHex(val)) neutralSamples.push(val);
  }
  if (isValidHex(colorData.borders.default)) neutralSamples.push(colorData.borders.default);

  // Interpolate 11 gray steps from lightest to darkest
  const grays = new Map<number, string>();
  for (let i = 0; i < GRAY_STEPS.length; i++) {
    const t = i / (GRAY_STEPS.length - 1);
    grays.set(GRAY_STEPS[i], interpolateHsl(lightest, darkest, t));
  }

  // If we have real intermediate colors, snap the closest gray step to them
  // for better fidelity to the original design
  const intermediates: Array<{ hex: string; lum: number }> = [];
  for (const hex of neutralSamples) {
    const l = luminance(hex);
    intermediates.push({ hex, lum: l });
  }
  intermediates.sort((a, b) => b.lum - a.lum); // lightest first

  for (const { hex } of intermediates) {
    const step = closestGrayStep(hex, grays);
    if (step !== null) {
      // Clamp: light steps (50-200) must stay light, dark steps (800-950) must stay dark
      const snapLum = luminance(hex);
      if (step <= 200 && snapLum <= 0.5) continue;  // too dark for a light step
      if (step >= 800 && snapLum >= 0.3) continue;   // too light for a dark step
      grays.set(step, hex);
    }
  }

  // Build extras: text colors that don't map well to the gray scale
  // (distance > 0.05 luminance from the nearest gray step)
  const extras = new Map<string, string>();
  const textColors: Array<{ name: string; hex: string | null }> = [
    { name: "text-muted", hex: colorData.text.muted },
    { name: "text-body", hex: colorData.text.body },
    { name: "text-link", hex: colorData.text.link },
  ];
  for (const { name, hex } of textColors) {
    if (!isValidHex(hex)) continue;
    const step = closestGrayStep(hex, grays);
    if (step === null) continue;
    const grayHex = grays.get(step)!;
    const dist = Math.abs(luminance(hex) - luminance(grayHex));
    // If the color is far from the nearest gray, preserve it as an extra primitive
    if (dist > 0.04) {
      extras.set(name, hex);
    }
  }

  // Use the accent already resolved by mergeColorDefaults (CSS vars are fallback there)
  const accent = isValidHex(colorData.accents.primary)
    ? colorData.accents.primary
    : "#2563eb";
  const accentText = isValidHex(colorData.accents.primaryText)
    ? colorData.accents.primaryText
    : "#ffffff";
  const link = isValidHex(colorData.text.link)
    ? colorData.text.link
    : null;

  return {
    grays,
    accent,
    accentText,
    white: "#ffffff",
    black: "#000000",
    link,
    extras,
  };
}

function closestGrayStep(hex: string, scale: Map<number, string>): number | null {
  const lum = luminance(hex);
  let closest: number | null = null;
  let minDiff = Infinity;

  for (const [step, stepHex] of scale) {
    const stepLum = luminance(stepHex);
    const diff = Math.abs(lum - stepLum);
    if (diff < minDiff) {
      minDiff = diff;
      closest = step;
    }
  }

  return closest;
}

/**
 * Check if the dark palette's neutral tint diverges from the light gray scale.
 * Returns true when average hue differs by >30deg or saturation differs by >0.15.
 */
function isDarkPaletteDivergent(
  lightGrays: Map<number, string>,
  darkGrays: Map<number, string>,
): boolean {
  function avgHueSat(grays: Map<number, string>): { hue: number; sat: number } {
    let hueSum = 0;
    let satSum = 0;
    let count = 0;
    for (const hex of grays.values()) {
      const [r, g, b] = hexToRgb(hex);
      const [h, s] = rgbToHsl(r, g, b);
      // Skip achromatic grays (s ≈ 0) — they have no meaningful hue
      if (s < 0.01) continue;
      hueSum += h;
      satSum += s;
      count++;
    }
    if (count === 0) return { hue: 0, sat: 0 };
    return { hue: hueSum / count, sat: satSum / count };
  }

  const light = avgHueSat(lightGrays);
  const dark = avgHueSat(darkGrays);

  // Hue difference on the circular 0-360 scale
  let hueDiff = Math.abs(light.hue - dark.hue);
  if (hueDiff > 180) hueDiff = 360 - hueDiff;

  const satDiff = Math.abs(light.sat - dark.sat);

  return hueDiff > 30 || satDiff > 0.15;
}

/** Find the gray step whose luminance is closest to the given hex */
function matchToGrayVar(hex: string | null, scale: Map<number, string>, fallbackStep: number): string {
  if (!isValidHex(hex)) return `var(--sf-gray-${fallbackStep})`;
  const step = closestGrayStep(hex, scale);
  return `var(--sf-gray-${step ?? fallbackStep})`;
}

function buildSemanticTokens(colorData: ColorData, primitives: PrimitiveScale, isDarkFirst: boolean): string {
  const { grays, extras } = primitives;
  const lines: string[] = [];

  if (isDarkFirst) {
    // Dark-first: :root is the dark theme
    lines.push("  /* Backgrounds */");
    lines.push(`  --color-bg-primary: ${matchToGrayVar(colorData.backgrounds.page, grays, 950)};`);
    lines.push(`  --color-bg-secondary: ${matchToGrayVar(colorData.backgrounds.header, grays, 900)};`);
    lines.push(`  --color-bg-tertiary: ${matchToGrayVar(colorData.backgrounds.card, grays, 800)};`);

    const pageBg = isValidHex(colorData.backgrounds.page) ? colorData.backgrounds.page : "#0a0a0a";
    const [pr, pg, pb] = hexToRgb(pageBg);
    lines.push(`  --color-bg-glass: rgba(${pr}, ${pg}, ${pb}, 0.8);`);

    lines.push("");
    lines.push("  /* Text */");
    lines.push(`  --color-text-primary: ${matchToGrayVar(colorData.text.heading, grays, 50)};`);
    // Use extras for text-secondary/tertiary if available (preserves exact site colors)
    lines.push(`  --color-text-secondary: ${extras.has("text-body") ? `var(--sf-${sanitizeVarName("text-body")})` : matchToGrayVar(colorData.text.body, grays, 300)};`);
    lines.push(`  --color-text-tertiary: ${extras.has("text-muted") ? `var(--sf-${sanitizeVarName("text-muted")})` : matchToGrayVar(colorData.text.muted, grays, 400)};`);
    lines.push("  --color-text-inverse: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Borders */");
    // Dark-first: borders should be subtle dark tones, not bright
    const borderHex = isValidHex(colorData.borders.default) ? colorData.borders.default : null;
    if (borderHex && luminance(borderHex) > 0.5) {
      // Extracted border is bright (e.g. #ffffff) — use dark gray instead
      lines.push("  --color-border-primary: var(--sf-gray-800);");
    } else {
      lines.push(`  --color-border-primary: ${matchToGrayVar(borderHex, grays, 800)};`);
    }
    lines.push("  --color-border-secondary: var(--sf-gray-700);");
    lines.push("  --color-border-subtle: var(--sf-gray-800);");

    lines.push("");
    lines.push("  /* Surfaces */");
    lines.push("  --color-surface-elevated: var(--sf-gray-900);");
    lines.push("  --color-surface-sunken: var(--sf-gray-950);");
  } else {
    // Light-first: original behavior
    lines.push("  /* Backgrounds */");
    lines.push(`  --color-bg-primary: ${matchToGrayVar(colorData.backgrounds.page, grays, 50)};`);
    lines.push(`  --color-bg-secondary: ${matchToGrayVar(colorData.backgrounds.header, grays, 50)};`);
    lines.push(`  --color-bg-tertiary: ${matchToGrayVar(colorData.backgrounds.card, grays, 100)};`);

    const pageBg = isValidHex(colorData.backgrounds.page) ? colorData.backgrounds.page : "#ffffff";
    const [pr, pg, pb] = hexToRgb(pageBg);
    lines.push(`  --color-bg-glass: rgba(${pr}, ${pg}, ${pb}, 0.8);`);

    lines.push("");
    lines.push("  /* Text */");
    lines.push(`  --color-text-primary: ${matchToGrayVar(colorData.text.heading, grays, 900)};`);
    lines.push(`  --color-text-secondary: ${extras.has("text-muted") ? `var(--sf-${sanitizeVarName("text-muted")})` : matchToGrayVar(colorData.text.muted, grays, 500)};`);
    lines.push(`  --color-text-tertiary: ${extras.has("text-body") ? `var(--sf-${sanitizeVarName("text-body")})` : matchToGrayVar(colorData.text.body, grays, 400)};`);
    lines.push("  --color-text-inverse: var(--sf-white);");

    lines.push("");
    lines.push("  /* Borders */");
    lines.push(`  --color-border-primary: ${matchToGrayVar(colorData.borders.default, grays, 200)};`);
    const borderStep = closestGrayStep(
      isValidHex(colorData.borders.default) ? colorData.borders.default : "#e5e7eb",
      grays,
    ) ?? 200;
    const borderSecondaryStep = Math.min(borderStep + 100, 950);
    lines.push(`  --color-border-secondary: var(--sf-gray-${borderSecondaryStep});`);
    const borderSubtleStep = Math.max(borderStep - 100, 50);
    lines.push(`  --color-border-subtle: var(--sf-gray-${borderSubtleStep});`);

    lines.push("");
    lines.push("  /* Surfaces */");
    lines.push("  --color-surface-elevated: var(--sf-white);");
    lines.push(`  --color-surface-sunken: ${matchToGrayVar(colorData.backgrounds.footer ?? colorData.backgrounds.header, grays, 50)};`);
  }

  lines.push("");
  lines.push("  /* Accent */");
  lines.push("  --color-accent: var(--sf-accent);");
  if (primitives.link) {
    lines.push("  --color-text-link: var(--sf-link);");
  }

  return lines.join("\n");
}

/** Sanitize extra var names for CSS custom property use */
function sanitizeVarName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-]/g, "-");
}

function buildDarkOverrides(
  darkData: ColorData | null,
  primitives: PrimitiveScale,
  darkGrays?: Map<number, string>,
): string {
  const grays = darkGrays ?? primitives.grays;
  const lines: string[] = [];

  // When dark palette diverges, override --sf-gray-* in the dark block
  if (darkGrays) {
    lines.push("  /* ─── Dark gray overrides ─── */");
    for (const step of GRAY_STEPS) {
      const hex = darkGrays.get(step) ?? "#888888";
      lines.push(`  --sf-gray-${step}: ${hex};`);
    }
    lines.push("");
  }

  if (darkData && hasAnyColor(darkData)) {
    // Use real dark mode data
    lines.push("  /* Backgrounds */");
    lines.push(`  --color-bg-primary: ${matchToGrayVar(darkData.backgrounds.page, grays, 950)};`);
    lines.push(`  --color-bg-secondary: ${matchToGrayVar(darkData.backgrounds.header, grays, 900)};`);
    lines.push(`  --color-bg-tertiary: ${matchToGrayVar(darkData.backgrounds.card, grays, 800)};`);

    const darkBg = isValidHex(darkData.backgrounds.page) ? darkData.backgrounds.page : "#0a0a0a";
    const [dr, dg, db] = hexToRgb(darkBg);
    lines.push(`  --color-bg-glass: rgba(${dr}, ${dg}, ${db}, 0.8);`);

    lines.push("");
    lines.push("  /* Text */");
    lines.push(`  --color-text-primary: ${matchToGrayVar(darkData.text.heading, grays, 100)};`);
    lines.push(`  --color-text-secondary: ${matchToGrayVar(darkData.text.muted, grays, 400)};`);
    lines.push(`  --color-text-tertiary: ${matchToGrayVar(darkData.text.body, grays, 600)};`);
    lines.push("  --color-text-inverse: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Borders */");
    lines.push(`  --color-border-primary: ${matchToGrayVar(darkData.borders.default, grays, 800)};`);
    lines.push("  --color-border-secondary: var(--sf-gray-700);");
    lines.push("  --color-border-subtle: var(--sf-gray-800);");

    lines.push("");
    lines.push("  /* Surfaces */");
    lines.push("  --color-surface-elevated: var(--sf-gray-900);");
    lines.push("  --color-surface-sunken: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Accent */");
    lines.push("  --color-accent: var(--sf-accent);");
    if (primitives.link) {
      lines.push("  --color-text-link: var(--sf-link);");
    }
  } else {
    // Invert: swap light → dark by reversing the gray scale
    lines.push("  /* Backgrounds */");
    lines.push("  --color-bg-primary: var(--sf-gray-950);");
    lines.push("  --color-bg-secondary: var(--sf-gray-900);");
    lines.push("  --color-bg-tertiary: var(--sf-gray-800);");
    lines.push("  --color-bg-glass: rgba(10, 10, 10, 0.8);");

    lines.push("");
    lines.push("  /* Text */");
    lines.push("  --color-text-primary: var(--sf-gray-100);");
    lines.push("  --color-text-secondary: var(--sf-gray-400);");
    lines.push("  --color-text-tertiary: var(--sf-gray-600);");
    lines.push("  --color-text-inverse: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Borders */");
    lines.push("  --color-border-primary: var(--sf-gray-800);");
    lines.push("  --color-border-secondary: var(--sf-gray-700);");
    lines.push("  --color-border-subtle: var(--sf-gray-800);");

    lines.push("");
    lines.push("  /* Surfaces */");
    lines.push("  --color-surface-elevated: var(--sf-gray-900);");
    lines.push("  --color-surface-sunken: var(--sf-gray-950);");

    lines.push("");
    lines.push("  /* Accent */");
    lines.push("  --color-accent: var(--sf-accent);");
    if (primitives.link) {
      lines.push("  --color-text-link: var(--sf-link);");
    }
  }

  // Always include Tailwind bridge in dark mode
  lines.push("");
  lines.push("  /* Tailwind bridge */");
  lines.push("  --background: var(--color-bg-primary);");
  lines.push("  --foreground: var(--color-text-primary);");

  return lines.join("\n");
}

/** Build light mode overrides for dark-first sites */
function buildLightOverrides(primitives: PrimitiveScale): string {
  const lines: string[] = [];

  // Invert the dark palette: swap dark → light by reversing the gray scale
  lines.push("  /* Backgrounds */");
  lines.push("  --color-bg-primary: var(--sf-gray-50);");
  lines.push("  --color-bg-secondary: var(--sf-white);");
  lines.push("  --color-bg-tertiary: var(--sf-gray-100);");
  lines.push("  --color-bg-glass: rgba(255, 255, 255, 0.8);");

  lines.push("");
  lines.push("  /* Text */");
  lines.push("  --color-text-primary: var(--sf-gray-950);");
  lines.push("  --color-text-secondary: var(--sf-gray-600);");
  lines.push("  --color-text-tertiary: var(--sf-gray-500);");
  lines.push("  --color-text-inverse: var(--sf-white);");

  lines.push("");
  lines.push("  /* Borders */");
  lines.push("  --color-border-primary: var(--sf-gray-200);");
  lines.push("  --color-border-secondary: var(--sf-gray-300);");
  lines.push("  --color-border-subtle: var(--sf-gray-100);");

  lines.push("");
  lines.push("  /* Surfaces */");
  lines.push("  --color-surface-elevated: var(--sf-white);");
  lines.push("  --color-surface-sunken: var(--sf-gray-50);");

  lines.push("");
  lines.push("  /* Accent */");
  lines.push("  --color-accent: var(--sf-accent);");
  if (primitives.link) {
    lines.push("  --color-text-link: var(--sf-link);");
  }

  lines.push("");
  lines.push("  /* Tailwind bridge */");
  lines.push("  --background: var(--color-bg-primary);");
  lines.push("  --foreground: var(--color-text-primary);");

  return lines.join("\n");
}

function hasAnyColor(data: ColorData): boolean {
  for (const val of Object.values(data.backgrounds)) {
    if (isValidHex(val)) return true;
  }
  const { hierarchy: _h, ...txtOnly } = data.text;
  for (const val of Object.values(txtOnly)) {
    if (isValidHex(val)) return true;
  }
  return false;
}

function buildThemeBridge(fontVars: { fontSans: string; fontMono: string }): string {
  // Tailwind v4 @theme inline block
  // Use explicit font values to avoid self-referential var(--font-sans) → --font-sans
  return `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: ${fontVars.fontSans};
  --font-mono: ${fontVars.fontMono};
}`;
}

// ── Main assembler ──────────────────────────────────────────────────

function assembleCss(
  fontFaceRules: string,
  fontVars: { fontSans: string; fontDisplay: string; fontMono: string },
  primitives: PrimitiveScale,
  semantics: string,
  themeOverrides: string,
  themeBridge: string,
  isDarkFirst: boolean,
  shapes?: ColorData["shapes"],
): string {
  const lines: string[] = [];

  // 1. Tailwind import
  lines.push('@import "tailwindcss";');
  lines.push("");

  // 2. @font-face declarations
  if (fontFaceRules) {
    lines.push(fontFaceRules);
    lines.push("");
  }

  // 3. :root block
  lines.push(":root {");
  lines.push("  /* ─── Primitive palette ─── */");
  lines.push(`  --sf-white: ${primitives.white};`);
  lines.push(`  --sf-black: ${primitives.black};`);
  for (const step of GRAY_STEPS) {
    const hex = primitives.grays.get(step) ?? "#888888";
    lines.push(`  --sf-gray-${step}: ${hex};`);
  }
  lines.push(`  --sf-accent: ${primitives.accent};`);
  if (primitives.link) {
    lines.push(`  --sf-link: ${primitives.link};`);
  }
  // Extra primitives (exact text colors that don't fit gray scale)
  for (const [name, hex] of primitives.extras) {
    lines.push(`  --sf-${sanitizeVarName(name)}: ${hex};`);
  }

  lines.push("");
  lines.push("  /* ─── Font families ─── */");
  lines.push(`  --font-sans: ${fontVars.fontSans};`);
  lines.push(`  --font-display: ${fontVars.fontDisplay};`);
  lines.push(`  --font-mono: ${fontVars.fontMono};`);

  // Shape tokens (shadows & radii from extraction)
  if (shapes?.shadows && shapes.shadows.length > 0) {
    lines.push("");
    lines.push("  /* ─── Shadows ─── */");
    const labels = ["sm", "md", "lg", "xl"];
    for (let i = 0; i < Math.min(shapes.shadows.length, 4); i++) {
      lines.push(`  --shadow-${labels[i]}: ${shapes.shadows[i].value};`);
    }
  }
  if (shapes?.radii && shapes.radii.length > 0) {
    lines.push("");
    lines.push("  /* ─── Border radii ─── */");
    // Sort by parsed px value ascending, deduplicate
    const sortedRadii = [...shapes.radii]
      .map(r => ({ ...r, px: parseInt(r.value, 10) || 0 }))
      .filter(r => r.px > 0 && r.px < 100)
      .sort((a, b) => a.px - b.px);
    // Deduplicate close values (within 1px)
    const deduped: typeof sortedRadii = [];
    for (const r of sortedRadii) {
      if (deduped.length === 0 || r.px - deduped[deduped.length - 1].px > 1) {
        deduped.push(r);
      }
    }
    const rLabels = ["sm", "md", "lg", "xl", "2xl"];
    for (let i = 0; i < Math.min(deduped.length, 5); i++) {
      lines.push(`  --radius-${rLabels[i]}: ${deduped[i].value};`);
    }
    lines.push("  --radius-pill: 9999px;");
  }

  lines.push("");
  lines.push(`  /* ─── Semantic tokens (${isDarkFirst ? "dark" : "light"} = default) ─── */`);
  lines.push(semantics);

  lines.push("");
  lines.push("  /* ─── Tailwind bridge ─── */");
  lines.push("  --background: var(--color-bg-primary);");
  lines.push("  --foreground: var(--color-text-primary);");
  lines.push("}");
  lines.push("");

  // 4. @theme inline
  lines.push(themeBridge);
  lines.push("");

  // 5. Alternate theme
  if (isDarkFirst) {
    lines.push('/* ─── Light theme (via data-theme attribute) ─── */');
    lines.push('[data-theme="light"] {');
  } else {
    lines.push('/* ─── Dark theme (via data-theme attribute) ─── */');
    lines.push('[data-theme="dark"] {');
  }
  lines.push(themeOverrides);
  lines.push("}");
  lines.push("");

  // 6. Body
  lines.push("/* ─── Base styles ─── */");
  lines.push("body {");
  lines.push("  background: var(--color-bg-primary);");
  lines.push("  color: var(--color-text-primary);");
  lines.push("  font-family: var(--font-sans);");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Detect whether the extracted site is dark-first (dark bg, light text, no light mode).
 * Used by templates and spec generators to set the correct default theme.
 */
export function detectDarkFirst(cwd: string): boolean {
  const colorData = readJsonSafe<ColorData>(
    join(cwd, ".claude/colors/color-data.json"),
    DEFAULT_COLORS,
  );
  const colorDataDark = readJsonSafe<ColorData | null>(
    join(cwd, ".claude/colors/color-data-dark.json"),
    null,
  );
  return isDarkFirstSite(colorData, colorDataDark);
}

/**
 * Generate globals.css directly from Phase 0 JSON artifacts.
 * Replaces the Claude CLI call that was used in Phase 1A.
 * Works for both "design-system" and "replicate" modes.
 */
export function generateGlobalsCss(cwd: string, _mode: PipelineMode): string {
  // 1. Read inputs
  const fontData = readJsonSafe<FontData>(
    join(cwd, ".claude/fonts/font-data.json"),
    DEFAULT_FONT,
  );
  let colorData = readJsonSafe<ColorData>(
    join(cwd, ".claude/colors/color-data.json"),
    DEFAULT_COLORS,
  );
  const colorDataDark = readJsonSafe<ColorData | null>(
    join(cwd, ".claude/colors/color-data-dark.json"),
    null,
  );

  // 2. Detect dark-first sites BEFORE sanity check
  //    A site like Raycast (dark bg, light text) is valid — not garbage.
  const darkFirst = isDarkFirstSite(colorData, colorDataDark);

  // 3. Sanity check: if extraction is truly broken (few colors, empty page), fallback.
  //    Dark-first sites pass sanity check since we no longer reject dark backgrounds.
  if (!isColorDataSane(colorData)) {
    const savedCssVars = colorData._cssVars;
    const savedAccent = colorData.accents;
    colorData = { ...DEFAULT_COLORS, _cssVars: savedCssVars };
    // Restore accent if it was a real color (not white/black)
    const rawAccent = savedAccent?.primary;
    if (isValidHex(rawAccent) && rawAccent.toLowerCase() !== "#ffffff" && rawAccent.toLowerCase() !== "#000000") {
      colorData.accents = { ...colorData.accents, primary: rawAccent };
    }
  }

  // 4. Fill nulls with defaults (contrast-aware based on whether site is dark-first)
  const mergedColors = mergeColorDefaults(colorData, darkFirst);

  // 5. Font faces
  const fontFaceRules = buildFontFaces(fontData, cwd);

  // 6. Font variables
  const fontVars = buildFontVars(fontData.roles, fontData.fontFaces);

  // 7. Primitive scale
  const primitives = buildPrimitiveScale(mergedColors);

  // 8. Semantic tokens (primary theme — dark for dark-first, light otherwise)
  const semantics = buildSemanticTokens(mergedColors, primitives, darkFirst);

  // 9. Alternate theme overrides
  let themeOverrides: string;
  if (darkFirst) {
    // Dark-first: generate light mode as the override
    themeOverrides = buildLightOverrides(primitives);
  } else {
    // Light-first: generate dark mode as the override
    let darkGrays: Map<number, string> | undefined;
    if (colorDataDark && hasAnyColor(colorDataDark)) {
      const darkPrimitives = buildPrimitiveScale(colorDataDark);
      if (isDarkPaletteDivergent(primitives.grays, darkPrimitives.grays)) {
        darkGrays = darkPrimitives.grays;
      }
    }
    themeOverrides = buildDarkOverrides(colorDataDark, primitives, darkGrays);
  }

  // 10. Tailwind theme bridge
  const themeBridge = buildThemeBridge(fontVars);

  // 11. Assemble
  return assembleCss(fontFaceRules, fontVars, primitives, semantics, themeOverrides, themeBridge, darkFirst, colorData.shapes);
}

/** Resolve accent primary: use extracted value, fall back to CSS vars, then default */
function resolveAccentPrimary(data: ColorData): string {
  const raw = data.accents.primary;
  // Accept extracted accent if it's a real color (not null, white, or black)
  if (isValidHex(raw) && raw.toLowerCase() !== "#ffffff" && raw.toLowerCase() !== "#000000") {
    return raw;
  }
  // Try CSS custom properties as fallback
  const fromVars = resolveCssVarAccent(data._cssVars);
  if (fromVars) return fromVars;
  return DEFAULT_COLORS.accents.primary!;
}

/** Dark-themed defaults for dark-first sites */
const DEFAULT_DARK_COLORS: ColorData = {
  backgrounds: { page: "#0a0a0a", header: "#111111", card: "#1a1a1a", footer: "#0a0a0a" },
  text: { heading: "#ffffff", body: "#e0e0e0", muted: "#9c9c9d", link: "#2563eb" },
  accents: { primary: "#2563eb", primaryText: "#ffffff" },
  borders: { default: "#2a2a2a" },
  surfaces: { input: "#1a1a1a" },
};

/** Merge null fields in color data with sensible defaults, with per-field contrast checks */
function mergeColorDefaults(data: ColorData, darkFirst = false): ColorData {
  const defaults = darkFirst ? DEFAULT_DARK_COLORS : DEFAULT_COLORS;
  const pageBg = data.backgrounds.page ?? defaults.backgrounds.page!;

  // --- Text fields with contrast awareness ---
  let heading = data.text.heading ?? defaults.text.heading;
  if (isValidHex(heading) && isValidHex(pageBg) && contrastRatio(heading, pageBg) < 2.0) {
    heading = defaults.text.heading;
  }

  let body = data.text.body ?? defaults.text.body;
  if (isValidHex(body) && isValidHex(pageBg) && contrastRatio(body, pageBg) < 2.0) {
    body = defaults.text.body;
  }

  let link = data.text.link ?? defaults.text.link;
  if (isValidHex(link) && isValidHex(pageBg) && contrastRatio(link, pageBg) < 2.0) {
    link = defaults.text.link;
  }

  let muted = data.text.muted ?? defaults.text.muted;

  // --- Use text hierarchy from frequency analysis when available ---
  // The hierarchy array is sorted by luminance (lightest first on dark sites).
  // It captures the real distinct text tiers from the page.
  const hierarchy = data.text.hierarchy;
  if (hierarchy && hierarchy.length >= 2) {
    // hierarchy[0] = brightest text (primary/heading)
    // hierarchy[1] = second tier (secondary)
    // hierarchy[2] = third tier (tertiary/muted)
    if (hierarchy.length >= 3) {
      body = hierarchy[1];
      muted = hierarchy[2];
    } else {
      // Only 2 tiers: use second as muted
      muted = hierarchy[1];
    }
  } else {
    // No hierarchy data — use collapse recovery heuristics
    if (darkFirst && isValidHex(body) && isValidHex(heading) && body.toLowerCase() === heading.toLowerCase()) {
      body = defaults.text.body;
    }
    if (isValidHex(muted) && isValidHex(heading) && muted.toLowerCase() === heading.toLowerCase()) {
      if (isValidHex(link) && link.toLowerCase() !== heading.toLowerCase() && isValidHex(pageBg) && contrastRatio(link, pageBg) >= 2.0) {
        muted = link;
      } else {
        muted = defaults.text.muted;
      }
    }
  }

  // --- Background fields with luminance divergence checks ---
  const pageLum = luminance(pageBg);

  let card = data.backgrounds.card ?? defaults.backgrounds.card;
  if (isValidHex(card) && Math.abs(luminance(card) - pageLum) > 0.7) {
    card = defaults.backgrounds.card;
  }

  let footer = data.backgrounds.footer ?? defaults.backgrounds.footer;
  if (isValidHex(footer) && Math.abs(luminance(footer) - pageLum) > 0.7) {
    footer = defaults.backgrounds.footer;
  }

  return {
    backgrounds: {
      page: pageBg,
      header: data.backgrounds.header ?? defaults.backgrounds.header,
      card,
      footer,
    },
    text: {
      heading,
      body,
      muted,
      link,
    },
    accents: {
      primary: resolveAccentPrimary(data),
      primaryText: data.accents.primaryText ?? defaults.accents.primaryText,
    },
    borders: {
      default: data.borders.default ?? defaults.borders.default,
    },
    surfaces: {
      input: data.surfaces.input ?? defaults.surfaces.input,
    },
    _cssVars: data._cssVars,
  };
}
