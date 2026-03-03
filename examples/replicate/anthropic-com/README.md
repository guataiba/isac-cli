# Replicate Example — anthropic.com

Full landing page replicated from [anthropic.com](https://www.anthropic.com/) using ISAC's replicate mode.

## What's included

This project was scaffolded with `npx create-next-app@latest` and then processed with:

```bash
isac replicate https://www.anthropic.com/
```

ISAC ran the full pipeline (capture, plan, build, verify) and generated:

- `app/globals.css` — CSS custom properties (`--sf-*` primitives, `--color-*` semantics, dark mode, Tailwind v4 bridge)
- `app/page.tsx` — Replicated landing page
- `app/design-system/page.tsx` — Visual documentation page
- `app/design-system/data.ts` — Parsed token data
- `public/fonts/` — Downloaded web fonts (Anthropic Sans, Serif, Mono, JetBrains Mono)
- `.claude/screenshots/` — Reference and verification screenshots
- `.claude/` — Raw extracted JSON data (fonts, colors, branding, icons)

## Preview

```bash
npm run dev
# Open http://localhost:3000 for the replicated page
# Open http://localhost:3000/design-system for the token docs
```

## Recreate from scratch

```bash
npx create-next-app@latest my-app
cd my-app
npm install -g @guataiba/isac-cli
isac replicate https://www.anthropic.com/
```
