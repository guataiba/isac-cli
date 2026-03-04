# Capture Example — anthropic.com

Design system extracted from [anthropic.com](https://www.anthropic.com/) using ISAC's default capture mode.

## What's included

This project was scaffolded with `npx create-next-app@latest` and then processed with:

```bash
isac capture https://www.anthropic.com/
```

ISAC extracted the Brand DNA and generated:

- `app/globals.css` — CSS custom properties (`--sf-*` primitives, `--color-*` semantics, dark mode, Tailwind v4 bridge)
- `app/design-system/page.tsx` — Visual documentation page
- `app/design-system/data.ts` — Parsed token data
- `public/fonts/` — Downloaded web fonts (Anthropic Sans, Serif, Mono, JetBrains Mono)
- `.claude/` — Raw extracted JSON data (fonts, colors, branding, icons)

No page replication — just the Brand DNA.

## Preview

```bash
npm run dev
# Open http://localhost:3000/design-system
```

## Recreate from scratch

```bash
npx create-next-app@latest my-app
cd my-app
npm install -g @guataiba/isac-cli
isac capture https://www.anthropic.com/
```
