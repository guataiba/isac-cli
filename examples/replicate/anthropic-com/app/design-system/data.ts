// ─── Site Info ──────────────────────────────────────────────────
export const siteInfo = {
  name: "Anthropic",
  domain: "anthropic.com",
  tagline: "Anthropic is an AI safety and research company that's working to build reliable, interpretable, and steerable AI systems.",
  description: "Anthropic is an AI safety and research company that's working to build reliable, interpretable, and steerable AI systems.",
};

// ─── Branding ───────────────────────────────────────────────────
export const branding = {
  logoUrl: "https://cdn.prod.website-files.com/67ce28cfec624e2b733f8a52/67d31dd7aa394792257596c5_webclip.png",
  faviconUrl: "https://cdn.prod.website-files.com/67ce28cfec624e2b733f8a52/681d52619fec35886a7f1a70_favicon.png",
  ogImageUrl: "https://cdn.prod.website-files.com/67ce28cfec624e2b733f8a52/68309ab48369f7ad9b4a40e1_open-graph.jpg",
  aboutText: "",
};

// ─── Typography ─────────────────────────────────────────────────
// Font stacks as defined in globals.css --font-* variables.
export const fonts = {
  display: '"Anthropic Sans", Arial, sans-serif',
  sans: '"Anthropic Serif", Georgia, sans-serif',
  mono: '"Anthropic Mono", Arial, sans-serif',
};

export const fontSizes: { label: string; size: string; sample: string }[] = [
  { label: "xs", size: "12px", sample: "Extra Small" },
  { label: "sm", size: "14px", sample: "Small" },
  { label: "base", size: "16px", sample: "Base" },
  { label: "lg", size: "18px", sample: "Large" },
  { label: "xl", size: "20px", sample: "Extra Large" },
  { label: "2xl", size: "24px", sample: "Heading 2XL" },
  { label: "3xl", size: "30px", sample: "Heading 3XL" },
  { label: "4xl", size: "36px", sample: "Heading 4XL" },
  { label: "display", size: "48px", sample: "Display" },
];

export const fontWeights: { label: string; weight: number }[] = [
  { label: "regular", weight: 400 },
  { label: "medium", weight: 500 },
  { label: "semibold", weight: 600 },
  { label: "bold", weight: 700 },
];

// ─── Spacing ────────────────────────────────────────────────────
export const spacing: { label: string; var: string; px: string }[] = [
  { label: "1", var: "--space-1", px: "4px" },
  { label: "2", var: "--space-2", px: "8px" },
  { label: "3", var: "--space-3", px: "12px" },
  { label: "4", var: "--space-4", px: "16px" },
  { label: "6", var: "--space-6", px: "24px" },
  { label: "8", var: "--space-8", px: "32px" },
  { label: "12", var: "--space-12", px: "48px" },
  { label: "16", var: "--space-16", px: "64px" },
];

// ─── Border Radius ──────────────────────────────────────────────
export const radii: { label: string; value: string }[] = [
  { label: "sm", value: "4px" },
  { label: "md", value: "8px" },
  { label: "lg", value: "12px" },
  { label: "xl", value: "16px" },
  { label: "pill", value: "9999px" },
];

// ─── Shadows ────────────────────────────────────────────────────
export const shadows: { label: string; var: string; value: string }[] = [
  { label: "sm", var: "--shadow-sm", value: "0 1px 2px rgba(0,0,0,0.05)" },
  { label: "md", var: "--shadow-md", value: "0 4px 12px rgba(0,0,0,0.08)" },
  { label: "lg", var: "--shadow-lg", value: "0 8px 24px rgba(0,0,0,0.1)" },
  { label: "xl", var: "--shadow-xl", value: "0 16px 48px rgba(0,0,0,0.12)" },
];

// ─── Primitive Palette ──────────────────────────────────────────
export const primitives: { name: string; var: string; hex: string }[] = [
  { name: "white", var: "--sf-white", hex: "#ffffff" },
  { name: "black", var: "--sf-black", hex: "#000000" },
  // gray scale
  { name: "gray-50", var: "--sf-gray-50", hex: "#faf9f5" },
  { name: "gray-100", var: "--sf-gray-100", hex: "#e5e7eb" },
  { name: "gray-200", var: "--sf-gray-200", hex: "#d8d3bb" },
  { name: "gray-300", var: "--sf-gray-300", hex: "#c5bea1" },
  { name: "gray-400", var: "--sf-gray-400", hex: "#b1a988" },
  { name: "gray-500", var: "--sf-gray-500", hex: "#9b9370" },
  { name: "gray-600", var: "--sf-gray-600", hex: "#6b7280" },
  { name: "gray-700", var: "--sf-gray-700", hex: "#625e4e" },
  { name: "gray-800", var: "--sf-gray-800", hex: "#47453b" },
  { name: "gray-900", var: "--sf-gray-900", hex: "#2d2c28" },
  { name: "gray-950", var: "--sf-gray-950", hex: "#000000" },
  // accent
  { name: "accent", var: "--sf-accent", hex: "#d97757" },
  // link
  { name: "link", var: "--sf-link", hex: "#141413" },
];

// ─── Icons ─────────────────────────────────────────────────────
export const icons: { library: string; names: string[]; count: number } = {
  library: "svg",
  names: [],
  count: 42,
};

// ─── Semantic Tokens ────────────────────────────────────────────
export const semanticTokens: {
  category: string;
  tokens: { name: string; var: string; lightRef: string; darkRef: string }[];
}[] = [
  {
    category: "Background",
    tokens: [
      { name: "bg-primary", var: "--color-bg-primary", lightRef: "gray-50", darkRef: "gray-50" },
      { name: "bg-secondary", var: "--color-bg-secondary", lightRef: "gray-950", darkRef: "gray-950" },
      { name: "bg-tertiary", var: "--color-bg-tertiary", lightRef: "gray-50", darkRef: "gray-800" },
    ],
  },
  {
    category: "Text",
    tokens: [
      { name: "text-primary", var: "--color-text-primary", lightRef: "gray-950", darkRef: "gray-950" },
      { name: "text-secondary", var: "--color-text-secondary", lightRef: "gray-600", darkRef: "gray-400" },
      { name: "text-tertiary", var: "--color-text-tertiary", lightRef: "gray-950", darkRef: "gray-950" },
      { name: "text-inverse", var: "--color-text-inverse", lightRef: "white", darkRef: "gray-950" },
    ],
  },
  {
    category: "Border",
    tokens: [
      { name: "border-primary", var: "--color-border-primary", lightRef: "gray-100", darkRef: "gray-800" },
      { name: "border-secondary", var: "--color-border-secondary", lightRef: "gray-200", darkRef: "gray-700" },
      { name: "border-subtle", var: "--color-border-subtle", lightRef: "gray-50", darkRef: "gray-800" },
    ],
  },
  {
    category: "Surface",
    tokens: [
      { name: "surface-elevated", var: "--color-surface-elevated", lightRef: "white", darkRef: "gray-900" },
      { name: "surface-sunken", var: "--color-surface-sunken", lightRef: "gray-50", darkRef: "gray-950" },
    ],
  },
  {
    category: "Accent",
    tokens: [
      { name: "accent", var: "--color-accent", lightRef: "accent", darkRef: "accent" },
      { name: "text-link", var: "--color-text-link", lightRef: "link", darkRef: "link" },
    ],
  },
];
