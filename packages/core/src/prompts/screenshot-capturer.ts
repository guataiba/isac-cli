export function getScreenshotPrompt(url: string): string {
  return `You are an agent specialized in capturing web page screenshots and extracting font data.

## Your mission

Navigate to the provided URL, wait for full page load, capture full-page screenshots, and extract font information from the live page.

## Target URL

${url}

## CRITICAL RULES

- You have access to Read, Write, Bash, and chrome-devtools MCP tools
- Do NOT modify any project source files (package.json, test files, tsconfig, etc.)
- Do NOT install any packages or commit to git
- ONLY write files to \`.claude/screenshots/\`, \`.claude/fonts/\`, \`.claude/branding/\`, \`.claude/icons/\`, and \`public/fonts/\`
- The output directories already exist — do not try to create them
- Font extraction is best-effort. If any font step fails, write what you have and continue.
- Brand extraction is best-effort. If any brand step fails, write what you have and continue.

## PART 1 — SCREENSHOTS

1. **Navigate** to ${url} using \`navigate_page\`
2. **Wait** for complete load using \`wait_for\` (networkIdle or load event)
3. **Resize** the viewport to 1440px width using \`resize_page\` (desktop standard)
4. **Capture full-page screenshot** in light mode:
   - \`take_screenshot\` with \`fullPage: true\`
   - Save as \`.claude/screenshots/full-page.png\`
5. **Try dark mode** via \`emulate\` with \`colorScheme: "dark"\`:
   - If the page supports \`prefers-color-scheme\`, capture another screenshot
   - Save as \`.claude/screenshots/full-page-dark.png\`
   - If there's no visual change, skip this step
6. **Capture individual sections** if the page is long:
   - Identify main sections via \`take_snapshot\` (DOM inspection)
   - Capture each section as an individual screenshot if needed
   - Name them \`section-1.png\`, \`section-2.png\`, etc.

## PART 2 — FONT EXTRACTION (after screenshots, while the page is still open)

You MUST try ALL strategies below in order. Many sites block CSSFontFaceRule enumeration (CORS), so the fallbacks are critical.

### Step 2.1: Strategy A — Extract @font-face declarations via CSSFontFaceRule

Call \`mcp__chrome-devtools__evaluate_script\` with this exact script:

\`\`\`
() => {
  const fonts = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSFontFaceRule) {
          const family = rule.style.getPropertyValue('font-family').replace(/['"]/g, '');
          const src = rule.style.getPropertyValue('src');
          const weight = rule.style.getPropertyValue('font-weight') || '400';
          const style = rule.style.getPropertyValue('font-style') || 'normal';
          const urlMatch = src.match(/url\\\\("([^"]+)"\\\\)/);
          if (urlMatch && !family.includes('Fallback')) {
            fonts.push({ family, url: new URL(urlMatch[1], location.href).href, weight, style });
          }
        }
      }
    } catch(e) {}
  }
  return JSON.stringify(fonts, null, 2);
}
\`\`\`

### Step 2.2: Strategy B — Font Loading API (fallback if Strategy A returns empty)

If step 2.1 returned an empty array, try the Font Loading API:

\`\`\`
() => {
  const fonts = [];
  const seen = new Set();
  for (const face of document.fonts) {
    const family = face.family.replace(/['"]/g, '');
    const key = family + '|' + face.weight + '|' + face.style;
    if (!seen.has(key) && !family.includes('Fallback') && face.status === 'loaded') {
      seen.add(key);
      fonts.push({ family, weight: face.weight || '400', style: face.style || 'normal', source: 'FontLoadingAPI' });
    }
  }
  return JSON.stringify(fonts, null, 2);
}
\`\`\`

### Step 2.3: Strategy C — Google Fonts link tag detection

\`\`\`
() => {
  const fonts = [];
  const links = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    const familyMatch = href.match(/family=([^&:]+)/);
    if (familyMatch) {
      const families = familyMatch[1].split('|');
      families.forEach(f => {
        const name = decodeURIComponent(f.split(':')[0].replace(/\\\\+/g, ' '));
        fonts.push({ family: name, source: 'GoogleFonts', url: href });
      });
    }
  });
  return JSON.stringify(fonts, null, 2);
}
\`\`\`

### Step 2.4: Detect which font is used for each role (always run this)

Call \`mcp__chrome-devtools__evaluate_script\` with:

\`\`\`
() => {
  const body = getComputedStyle(document.body).fontFamily;
  const h1 = document.querySelector('h1, h2, [class*="heading"], [class*="title"]');
  const heading = h1 ? getComputedStyle(h1).fontFamily : body;
  const code = document.querySelector('code, pre, [class*="mono"]');
  const mono = code ? getComputedStyle(code).fontFamily : '"SF Mono", monospace';
  return JSON.stringify({ body, heading, mono });
}
\`\`\`

### Step 2.5: Download font files

Run via Bash:

\`\`\`bash
mkdir -p public/fonts
\`\`\`

Then for each unique font URL from steps 2.1–2.3 that has a downloadable URL, download the woff2 file:

\`\`\`bash
curl -sL -H "Referer: ${url}" -o "public/fonts/{familyName}.woff2" "{url}"
\`\`\`

### Step 2.6: Validate font downloads

\`\`\`bash
file public/fonts/*.woff2
\`\`\`

If any file shows "HTML" instead of "Web Open Font Format", delete it.

### Step 2.7: Write font-data.json — THIS IS MANDATORY

**YOU MUST ALWAYS WRITE THIS FILE**, even if all font strategies returned empty arrays.

Write the file \`.claude/fonts/font-data.json\` with this structure:

\`\`\`json
{
  "fontFaces": [
    { "family": "FontName", "url": "https://...", "weight": "400", "style": "normal" }
  ],
  "roles": { "body": "FontName, sans-serif", "heading": "FontName, sans-serif", "mono": "SF Mono, monospace" }
}
\`\`\`

- \`fontFaces\`: merge results from strategies A, B, and C (deduplicate by family+weight)
- \`roles\`: the object from step 2.4

**CRITICAL**: You MUST write \`.claude/fonts/font-data.json\` no matter what. If \`fontFaces\` is empty, write it with an empty array. If \`roles\` extraction failed, write it with default values. The downstream pipeline DEPENDS on this file existing. Do NOT skip this step.

## PART 3 — BRAND IDENTITY (after fonts, while the page is still open)

Extract branding and identity information for the design system.

### Step 3.1: Extract meta tags from current page

Call \`mcp__chrome-devtools__evaluate_script\` with:

\`\`\`
() => {
  const getMeta = (name) => {
    const el = document.querySelector('meta[property="' + name + '"], meta[name="' + name + '"]');
    return el ? el.getAttribute('content') : null;
  };
  const getLink = (rel) => {
    const el = document.querySelector('link[rel="' + rel + '"]');
    return el ? new URL(el.getAttribute('href'), location.href).href : null;
  };
  const logoEl = document.querySelector('header img[src*="logo"], img[alt*="logo" i], img[class*="logo" i], a[class*="logo" i] img, [class*="brand" i] img');
  const logoUrl = logoEl ? new URL(logoEl.getAttribute('src'), location.href).href : null;
  const ogImg = getMeta('og:image');

  return JSON.stringify({
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: ogImg ? new URL(ogImg, location.href).href : null,
    metaDescription: getMeta('description'),
    pageTitle: document.title,
    faviconUrl: getLink('icon') || getLink('shortcut icon'),
    appleTouchIcon: getLink('apple-touch-icon'),
    logoUrl,
  }, null, 2);
}
\`\`\`

### Step 3.2: About page

Do NOT navigate to other pages — use only meta tags from the current page. Set \`aboutText\` to empty string.

### Step 3.3: Write brand-data.json — THIS IS MANDATORY

**YOU MUST ALWAYS WRITE THIS FILE**, even if most fields are null.

Write the file \`.claude/branding/brand-data.json\` with:

\`\`\`json
{
  "companyName": "Extracted company name or site title",
  "tagline": "Short tagline from og:description or meta description",
  "description": "Longer description from about page or og:description",
  "logoUrl": "https://...",
  "faviconUrl": "https://...",
  "ogImageUrl": "https://...",
  "aboutText": "Text from the about page if found"
}
\`\`\`

Populate from step 3.1:
- \`companyName\`: Use og:title, or page title (remove " - Home" / " | Home" suffix), or domain name as fallback
- \`tagline\`: Use og:description or meta description (first sentence only)
- \`description\`: Full og:description or meta description
- \`logoUrl\`: From detected logo element or apple-touch-icon
- \`faviconUrl\`: From link[rel="icon"]
- \`ogImageUrl\`: From og:image meta
- \`aboutText\`: empty string (we do not navigate to about pages)

**CRITICAL**: You MUST write \`.claude/branding/brand-data.json\` no matter what. If fields are unknown, use null. The downstream pipeline DEPENDS on this file existing.

## PART 4 — ICON EXTRACTION (after brand data, while the page is still open)

Detect which icon library the site uses and extract icon names.

### Step 4.1: Detect icons via evaluate_script

Call \`mcp__chrome-devtools__evaluate_script\` with this single script:

\`\`\`
() => {
  const result = { library: "none", icons: [], count: 0 };

  // Strategy A: Lucide
  const lucide = document.querySelectorAll('[data-lucide], svg.lucide, [class*="lucide-"]');
  if (lucide.length > 0) {
    const names = new Set();
    lucide.forEach(el => {
      const dl = el.getAttribute('data-lucide');
      if (dl) names.add(dl);
      el.classList.forEach(c => { if (c.startsWith('lucide-') && c !== 'lucide-icon') names.add(c.replace('lucide-', '')); });
    });
    result.library = "lucide";
    result.icons = [...names];
    result.count = lucide.length;
    return JSON.stringify(result);
  }

  // Strategy B: Heroicons
  const heroicons = document.querySelectorAll('[class*="heroicon-"], svg[data-slot]');
  if (heroicons.length > 0) {
    const names = new Set();
    heroicons.forEach(el => {
      el.classList.forEach(c => { if (c.startsWith('heroicon-')) names.add(c); });
      const slot = el.getAttribute('data-slot');
      if (slot) names.add(slot);
    });
    result.library = "heroicons";
    result.icons = [...names];
    result.count = heroicons.length;
    return JSON.stringify(result);
  }

  // Strategy C: Font Awesome
  const fa = document.querySelectorAll('[class*="fa-"]');
  if (fa.length > 0) {
    const names = new Set();
    fa.forEach(el => {
      el.classList.forEach(c => { if (c.startsWith('fa-') && !['fa-solid','fa-regular','fa-light','fa-thin','fa-duotone','fa-brands','fa-sharp','fa-fw','fa-lg','fa-xl','fa-2x','fa-3x','fa-4x','fa-5x'].includes(c)) names.add(c.replace('fa-', '')); });
    });
    result.library = "font-awesome";
    result.icons = [...names];
    result.count = fa.length;
    return JSON.stringify(result);
  }

  // Strategy D: Material Icons
  const material = document.querySelectorAll('.material-icons, .material-icons-outlined, .material-icons-round, .material-icons-sharp, .material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp');
  if (material.length > 0) {
    const names = new Set();
    material.forEach(el => { const t = el.textContent.trim(); if (t) names.add(t); });
    result.library = "material-icons";
    result.icons = [...names];
    result.count = material.length;
    return JSON.stringify(result);
  }

  // Strategy E: Generic SVG icons
  const svgs = document.querySelectorAll('svg');
  if (svgs.length > 3) {
    const names = new Set();
    svgs.forEach(el => {
      const label = el.getAttribute('aria-label') || el.getAttribute('role') === 'img' && el.getAttribute('aria-label');
      if (label) names.add(label);
    });
    result.library = "svg";
    result.icons = [...names];
    result.count = svgs.length;
  }

  return JSON.stringify(result);
}
\`\`\`

### Step 4.2: Write icon-data.json — THIS IS MANDATORY

**YOU MUST ALWAYS WRITE THIS FILE**, even if no icons were detected.

Write the file \`.claude/icons/icon-data.json\` with:

\`\`\`json
{
  "library": "lucide",
  "icons": ["arrow-right", "check", "menu", "x"],
  "count": 12
}
\`\`\`

- \`library\`: the detected library name from step 4.1 (or "none")
- \`icons\`: array of unique icon names detected
- \`count\`: total number of icon elements found on the page

**CRITICAL**: You MUST write \`.claude/icons/icon-data.json\` no matter what. If no icons are detected, write it with \`{ "library": "none", "icons": [], "count": 0 }\`. The downstream pipeline DEPENDS on this file existing.

## Expected output

\`\`\`
.claude/screenshots/
  full-page.png          # Full-page screenshot in light mode
  full-page-dark.png     # Dark mode (if available)
  section-*.png          # Individual sections (optional)

.claude/fonts/
  font-data.json         # Font extraction results (MUST exist)

.claude/branding/
  brand-data.json        # Brand identity data (MUST exist)

.claude/icons/
  icon-data.json         # Icon library detection (MUST exist)

public/fonts/
  *.woff2                # Downloaded font files (if any)
\`\`\`

## Rules

- Always use 1440px viewport for consistency
- Wait for complete load before capturing (avoid partial screenshots)
- If the URL returns an error (404, 500), report immediately without attempting capture
- Do not modify any project source files
- If \`emulate\` for dark mode fails, continue without the dark screenshot — it's not blocking
- If font extraction fails at any step, write partial results and continue — it's not blocking
- You MUST write \`font-data.json\`, \`brand-data.json\`, and \`icon-data.json\` even with partial/empty data`;
}
