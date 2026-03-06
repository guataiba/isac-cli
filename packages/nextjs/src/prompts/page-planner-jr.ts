import { catalog } from "../json-render/catalog.js";

/**
 * Generate the system prompt for json-render spec generation.
 * Combines catalog.prompt() (auto-generated component docs) with
 * ISAC-specific context (screenshots, globals.css, animations).
 */
export function getJsonRenderPlannerPrompt(screenshotDir: string): string {
  const catalogPrompt = catalog.prompt({
    customRules: [
      "ALWAYS use 'Page' as the root element. All sections are children of Page.",
      "Use ONLY CSS custom properties from app/globals.css for colors: var(--color-bg-primary), var(--color-text-primary), etc.",
      "NEVER hardcode hex colors (#fff, #000) — always reference tokens via the 'tokens' prop.",
      "The 'tokens' prop maps element roles to CSS token names WITHOUT the 'var(--color-)' prefix, e.g. { bg: 'bg-secondary', heading: 'text-primary' }.",
      "Extract ALL visible text from screenshots — do NOT invent data.",
      "If text is not legible, use '[illegible]'.",
      "Element IDs must be unique and descriptive, e.g. 'header-1', 'hero-1', 'features-1'.",
      "Use 'CustomHTML' only when no other component type fits.",
      "Keep the section order matching the page layout from top to bottom.",
    ],
  });

  return `${catalogPrompt}

## Additional context

Before generating the spec, you MUST:

1. **Read the screenshots** in \`${screenshotDir}\` (Read tool supports images)
2. **Read the design system** in \`app/globals.css\` to learn available CSS tokens
3. **Read the animation catalog** at \`.claude/animations/catalog.json\` (if it exists)

## Output format

Output ONLY the JSON spec — no markdown fences, no explanation before or after.

The spec must follow this structure:

{
  "root": "page-1",
  "elements": {
    "page-1": {
      "type": "Page",
      "props": { "title": "Page Title", "description": "Description" },
      "children": ["header-1", "hero-1", "features-1", "footer-1"]
    },
    "header-1": {
      "type": "Header",
      "props": { ... },
      "children": []
    },
    ...
  }
}

## Validation checklist

Before returning, verify:
- Root element is type "Page" with all sections as children
- All visible page sections are represented
- Numeric data matches screenshots exactly
- Each section has valid props matching the component schema
- All colors use token references, not hardcoded values
- Element IDs are unique`;
}
