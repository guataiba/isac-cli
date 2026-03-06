import React from "react";
import { defineRegistry } from "@json-render/react";
import { dsCatalog } from "./ds-catalog.js";

const fonts = {
  sans: "var(--font-sans)",
  display: "var(--font-display, var(--font-sans))",
  mono: "var(--font-mono)",
};

function SectionWrapper({ title, children }: { title: string; children?: React.ReactNode }) {
  return React.createElement("section", { style: { marginBottom: 64 } },
    React.createElement("h2", {
      style: { fontFamily: fonts.sans, fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid var(--color-border-primary)" },
    }, title),
    children,
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return React.createElement("h3", {
    style: { fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 16 },
  }, children);
}

export const { registry: dsRegistry } = defineRegistry(dsCatalog, {
  components: {
    DSPage: ({ props, children }) => {
      return React.createElement("div", {
        style: { maxWidth: 960, margin: "0 auto", padding: "48px 24px", fontFamily: fonts.sans, color: "var(--color-text-primary)" },
      }, children);
    },

    DSHeader: ({ props }) => {
      return React.createElement("header", { style: { marginBottom: 64 } },
        React.createElement("h1", {
          style: { fontFamily: fonts.display, fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 },
        }, "Design System"),
        React.createElement("p", { style: { fontSize: 16, color: "var(--color-text-secondary)" } },
          "Tokens and components extracted from ",
          React.createElement("span", { style: { fontWeight: 600, color: "var(--color-text-primary)" } }, props.domain),
          " — with dark mode support",
        ),
      );
    },

    DSBrandIdentity: ({ props }) => {
      if (!props.logoUrl && !props.tagline && !props.description) return null;
      return React.createElement(SectionWrapper, { title: "Brand Identity" },
        React.createElement("div", {
          style: { display: "flex", flexDirection: "column" as const, gap: 20, padding: 32, background: "var(--color-bg-secondary)", borderRadius: 12, border: "1px solid var(--color-border-primary)" },
        },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 20 } },
            props.logoUrl ? React.createElement("img", { src: props.logoUrl, alt: `${props.name} logo`, style: { height: 48, maxWidth: 200, objectFit: "contain" as const } }) : null,
            React.createElement("div", null,
              React.createElement("h3", { style: { fontFamily: fonts.display, fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-text-primary)" } }, props.name),
              props.tagline ? React.createElement("p", { style: { fontSize: 16, color: "var(--color-text-secondary)", margin: "4px 0 0" } }, props.tagline) : null,
            ),
          ),
          props.description ? React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0, maxWidth: 640 } }, props.description) : null,
          props.faviconUrl ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
            React.createElement("img", { src: props.faviconUrl, alt: "Favicon", style: { width: 24, height: 24 } }),
            React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-tertiary)" } }, props.faviconUrl),
          ) : null,
        ),
      );
    },

    DSColorPalette: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        props.subtitle ? React.createElement("p", { style: { fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 } }, props.subtitle) : null,
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 } },
          ...props.colors.map((c) =>
            React.createElement("div", { key: c.name, style: { border: "1px solid var(--color-border-primary)", borderRadius: 8, overflow: "hidden" } },
              React.createElement("div", { style: { height: 56, background: c.hex, borderBottom: "1px solid var(--color-border-primary)" } }),
              React.createElement("div", { style: { padding: "8px 10px" } },
                React.createElement("div", { style: { fontSize: 12, fontWeight: 600, marginBottom: 2 } }, c.name),
                React.createElement("code", { style: { fontSize: 10, color: "var(--color-text-secondary)", fontFamily: fonts.mono } }, c.varName),
                React.createElement("div", { style: { fontSize: 10, color: "var(--color-text-tertiary)", fontFamily: fonts.mono, marginTop: 2 } }, c.hex),
              ),
            ),
          ),
        ),
      );
    },

    DSSemanticTokens: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        props.subtitle ? React.createElement("p", { style: { fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 32 } }, props.subtitle) : null,
        ...props.groups.map((group) =>
          React.createElement("div", { key: group.category, style: { marginBottom: 40 } },
            React.createElement(SubHeading, null, group.category),
            React.createElement("div", { style: { border: "1px solid var(--color-border-primary)", borderRadius: 8, overflow: "hidden" } },
              React.createElement("div", {
                style: { display: "grid", gridTemplateColumns: "1fr 56px 120px 56px 120px", gap: 0, padding: "8px 16px", background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-primary)", fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
              },
                React.createElement("span", null, "Token"),
                React.createElement("span", { style: { textAlign: "center" as const } }, "Light"),
                React.createElement("span", null, "Reference"),
                React.createElement("span", { style: { textAlign: "center" as const } }, "Dark"),
                React.createElement("span", null, "Reference"),
              ),
              ...group.tokens.map((t) =>
                React.createElement("div", {
                  key: t.name,
                  style: { display: "grid", gridTemplateColumns: "1fr 56px 120px 56px 120px", gap: 0, padding: "10px 16px", borderBottom: "1px solid var(--color-border-subtle)", alignItems: "center", fontSize: 13 },
                },
                  React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-primary)" } }, t.varName),
                  React.createElement("div", { style: { display: "flex", justifyContent: "center" } },
                    React.createElement("div", { style: { width: 32, height: 32, borderRadius: 6, background: t.lightHex, border: "1px solid var(--color-border-primary)" } }),
                  ),
                  React.createElement("div", null,
                    React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-secondary)", display: "block" } }, t.lightRef),
                    React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 10, color: "var(--color-text-tertiary)" } }, t.lightHex),
                  ),
                  React.createElement("div", { style: { display: "flex", justifyContent: "center" } },
                    React.createElement("div", { style: { width: 32, height: 32, borderRadius: 6, background: t.darkHex, border: "1px solid var(--color-border-primary)" } }),
                  ),
                  React.createElement("div", null,
                    React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-secondary)", display: "block" } }, t.darkRef),
                    React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 10, color: "var(--color-text-tertiary)" } }, t.darkHex),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    },

    DSTypography: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement(SubHeading, null, "Font Families"),
        React.createElement("div", { style: { marginBottom: 32 } },
          ...props.families.map((f) =>
            React.createElement("div", { key: f.key, style: { display: "flex", flexDirection: "column" as const, gap: 8, padding: 16, borderBottom: "1px solid var(--color-border-subtle)" } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" } }, `--font-${f.key}`),
                React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-tertiary)", background: "var(--color-bg-tertiary)", padding: "2px 8px", borderRadius: 4, maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const } }, f.stack),
              ),
              React.createElement("span", { style: { fontFamily: `var(--font-${f.key}, ${f.stack})`, fontSize: 20 } }, "The quick brown fox jumps over the lazy dog"),
            ),
          ),
        ),
        React.createElement(SubHeading, null, "Size Scale"),
        React.createElement("div", { style: { marginBottom: 32 } },
          ...props.sizes.map((fs) =>
            React.createElement("div", { key: fs.label, style: { display: "flex", alignItems: "baseline", gap: 16, padding: "8px 0", borderBottom: "1px solid var(--color-border-subtle)" } },
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 13, color: "var(--color-text-secondary)", minWidth: 80 } }, fs.label),
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 60 } }, fs.size),
              React.createElement("span", { style: { fontFamily: fonts.sans, fontSize: fs.size } }, fs.sample),
            ),
          ),
        ),
        React.createElement(SubHeading, null, "Weights"),
        React.createElement("div", { style: { marginBottom: 32 } },
          ...props.weights.map((fw) =>
            React.createElement("div", { key: fw.label, style: { display: "flex", alignItems: "center", gap: 16, padding: "8px 0", borderBottom: "1px solid var(--color-border-subtle)" } },
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 13, color: "var(--color-text-secondary)", minWidth: 100 } }, fw.label),
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-tertiary)", minWidth: 40 } }, String(fw.weight)),
              React.createElement("span", { style: { fontFamily: fonts.sans, fontSize: 18, fontWeight: fw.weight } }, "The quick brown fox jumps over the lazy dog"),
            ),
          ),
        ),
      );
    },

    DSSpacing: ({ props }) => {
      if (props.items.length === 0) return null;
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement("div", { style: { display: "flex", flexDirection: "column" as const, gap: 6 } },
          ...props.items.map((s) =>
            React.createElement("div", { key: s.label, style: { display: "flex", alignItems: "center", gap: 16 } },
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 12, color: "var(--color-text-secondary)", minWidth: 48, textAlign: "right" as const } }, s.label),
              React.createElement("div", { style: { height: 16, width: s.px, background: "var(--color-accent)", borderRadius: 4, minWidth: 4 } }),
              React.createElement("code", { style: { fontFamily: fonts.mono, fontSize: 11, color: "var(--color-text-tertiary)" } }, s.px),
            ),
          ),
        ),
      );
    },

    DSRadii: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 } },
          ...props.items.map((r) =>
            React.createElement("div", { key: r.label, style: { textAlign: "center" as const } },
              React.createElement("div", { style: { width: 80, height: 80, margin: "0 auto 8px", background: "var(--color-accent)", borderRadius: r.value, opacity: 0.8 } }),
              React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, r.label),
              React.createElement("code", { style: { fontSize: 11, color: "var(--color-text-secondary)", fontFamily: fonts.mono } }, r.value),
            ),
          ),
        ),
      );
    },

    DSShadows: ({ props }) => {
      if (props.items.length === 0) return null;
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 } },
          ...props.items.map((s) =>
            React.createElement("div", { key: s.label, style: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 12 } },
              React.createElement("div", { style: { width: "100%", height: 80, background: "var(--color-bg-secondary)", borderRadius: 12, boxShadow: s.value, border: "1px solid var(--color-border-subtle)" } }),
              React.createElement("div", { style: { textAlign: "center" as const } },
                React.createElement("div", { style: { fontSize: 13, fontWeight: 600 } }, s.label),
                React.createElement("code", { style: { fontSize: 10, color: "var(--color-text-tertiary)", fontFamily: fonts.mono } }, s.value),
              ),
            ),
          ),
        ),
      );
    },

    DSComponents: ({ props }) => {
      return React.createElement(SectionWrapper, { title: props.title },
        // Buttons
        React.createElement(SubHeading, null, "Buttons"),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap" as const, gap: 12, marginBottom: 32 } },
          React.createElement("button", { style: { padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, background: "var(--color-accent)", color: "var(--sf-white)", border: "none", borderRadius: 8, cursor: "pointer" } }, "Primary"),
          React.createElement("button", { style: { padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, background: "var(--color-bg-secondary)", color: "var(--color-text-primary)", border: "1px solid var(--color-border-primary)", borderRadius: 8, cursor: "pointer" } }, "Secondary"),
          React.createElement("button", { style: { padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, background: "transparent", color: "var(--color-accent)", border: "1px solid var(--color-accent)", borderRadius: 8, cursor: "pointer" } }, "Outline"),
          React.createElement("button", { style: { padding: "10px 24px", fontSize: 14, fontWeight: 600, fontFamily: fonts.sans, background: "transparent", color: "var(--color-text-secondary)", border: "none", borderRadius: 8, cursor: "pointer", textDecoration: "underline" } }, "Ghost"),
        ),
        // Cards
        React.createElement(SubHeading, null, "Cards"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 } },
          React.createElement("div", { style: { padding: 24, background: "var(--color-bg-primary)", border: "1px solid var(--color-border-primary)", borderRadius: 12 } },
            React.createElement("h4", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, "Default Card"),
            React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5 } }, "A basic card component using surface and border tokens for consistent styling."),
          ),
          React.createElement("div", { style: { padding: 24, background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" } },
            React.createElement("h4", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, "Elevated Card"),
            React.createElement("p", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5 } }, "A card with elevation using box-shadow for depth and visual hierarchy."),
          ),
        ),
        // Badges
        React.createElement(SubHeading, null, "Badges"),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 32 } },
          ...["TypeScript", "JavaScript", "Python", "Rust", "Go"].map((lang) =>
            React.createElement("span", { key: lang, style: { display: "inline-block", padding: "4px 12px", fontSize: 12, fontWeight: 500, fontFamily: fonts.sans, background: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)", borderRadius: 9999, border: "1px solid var(--color-border-subtle)" } }, lang),
          ),
        ),
        // Input
        React.createElement(SubHeading, null, "Input"),
        React.createElement("div", { style: { maxWidth: 400, marginBottom: 32 } },
          React.createElement("div", { style: { height: 44, padding: "0 16px", display: "flex", alignItems: "center", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderRadius: 8, fontSize: 14, color: "var(--color-text-tertiary)" } }, "Search tokens..."),
        ),
        // Text Hierarchy
        React.createElement(SubHeading, null, "Text Hierarchy"),
        React.createElement("div", { style: { padding: 24, background: "var(--color-bg-secondary)", borderRadius: 12, border: "1px solid var(--color-border-subtle)" } },
          React.createElement("div", { style: { fontSize: 24, fontWeight: 700, fontFamily: fonts.display, marginBottom: 4, color: "var(--color-text-primary)" } }, "Heading"),
          React.createElement("div", { style: { fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 } }, "Subheading with medium weight"),
          React.createElement("div", { style: { fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 4 } }, "Body text using secondary color for comfortable reading on any background."),
          React.createElement("div", { style: { fontSize: 12, color: "var(--color-text-tertiary)" } }, "Caption text — tertiary color for supplementary information"),
        ),
      );
    },

    DSIcons: ({ props }) => {
      if (props.count === 0) return null;
      return React.createElement(SectionWrapper, { title: props.title },
        React.createElement("div", { style: { marginBottom: 16, display: "flex", alignItems: "center", gap: 12 } },
          React.createElement("span", { style: { display: "inline-block", padding: "4px 12px", fontSize: 12, fontWeight: 600, fontFamily: fonts.mono, background: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)", borderRadius: 6, border: "1px solid var(--color-border-subtle)" } }, props.library),
          React.createElement("span", { style: { fontSize: 13, color: "var(--color-text-tertiary)" } }, `${props.count} icon elements detected`),
        ),
        props.names.length > 0 ? React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 } },
          ...props.names.map((name) =>
            React.createElement("div", { key: name, style: { padding: "8px 12px", fontSize: 12, fontFamily: fonts.mono, color: "var(--color-text-primary)", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-subtle)", borderRadius: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const } }, name),
          ),
        ) : null,
      );
    },

    DSFooter: ({ props }) => {
      return React.createElement("footer", {
        style: { marginTop: 64, paddingTop: 24, borderTop: "1px solid var(--color-border-primary)", fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center" as const },
      }, `Extracted from ${props.domain} — Design System Documentation`);
    },
  },
});
