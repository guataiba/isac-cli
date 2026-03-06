import React from "react";
import { defineRegistry } from "@json-render/react";
import { catalog } from "./catalog.js";

function t(tokens: Record<string, string> | null | undefined, key: string, fallback: string): string {
  return `var(--color-${tokens?.[key] ?? fallback})`;
}

export const { registry } = defineRegistry(catalog, {
  components: {
    Page: ({ props, children }) => {
      return React.createElement("div", {
        style: {
          minHeight: "100vh",
          backgroundColor: "var(--color-bg-primary)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
        },
      }, children);
    },

    Header: ({ props }) => {
      const logoContent = props.logo?.src
        ? React.createElement("img", {
            src: props.logo.src,
            alt: props.logo.alt ?? props.logo.text ?? "Logo",
            style: { height: 32 },
          })
        : React.createElement("span", {
            style: { fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)" },
          }, props.logo?.text ?? "");

      const navItems = (props.nav ?? []).map((n, i) =>
        React.createElement("a", {
          key: i,
          href: n.url,
          style: { color: "var(--color-text-primary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 },
        }, n.text),
      );

      const cta = props.cta
        ? React.createElement("a", {
            href: props.cta.url,
            style: {
              backgroundColor: "var(--color-accent-primary)",
              color: "var(--color-accent-text)",
              padding: "8px 16px",
              borderRadius: "var(--radius-md, 8px)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            },
          }, props.cta.text)
        : null;

      return React.createElement("header", {
        style: {
          position: props.behavior === "sticky" ? "sticky" : "relative",
          top: 0,
          zIndex: 50,
          backgroundColor: t(props.tokens, "bg", "bg-primary"),
          borderBottom: "1px solid var(--color-border-primary)",
          padding: "16px 0",
        },
      },
        React.createElement("div", {
          style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
        },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, logoContent),
          React.createElement("nav", { style: { display: "flex", alignItems: "center", gap: 24 } }, ...navItems, cta),
        ),
      );
    },

    Hero: ({ props }) => {
      const badge = props.badge
        ? React.createElement("span", {
            style: { display: "inline-block", backgroundColor: "var(--color-surface-primary)", color: "var(--color-accent-primary)", padding: "4px 12px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600, marginBottom: 16 },
          }, props.badge)
        : null;

      const image = props.image
        ? React.createElement("img", {
            src: props.image.src,
            alt: props.image.alt,
            style: { maxWidth: "100%", borderRadius: "var(--radius-lg, 12px)" },
          })
        : null;

      const ctaEl = props.cta
        ? React.createElement("a", {
            href: props.cta.url,
            style: { backgroundColor: "var(--color-accent-primary)", color: "var(--color-accent-text)", padding: "12px 24px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "16px", fontWeight: 600 },
          }, props.cta.text)
        : null;

      const secondaryCtaEl = props.secondaryCta
        ? React.createElement("a", {
            href: props.secondaryCta.url,
            style: { border: "1px solid var(--color-border-primary)", color: "var(--color-text-primary)", padding: "12px 24px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "16px", fontWeight: 500 },
          }, props.secondaryCta.text)
        : null;

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "80px 0" },
      },
        React.createElement("div", {
          style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" },
        },
          badge,
          React.createElement("h1", {
            style: { fontSize: "48px", fontWeight: 700, color: t(props.tokens, "heading", "text-primary"), margin: "0 0 16px", fontFamily: "var(--font-display)" },
          }, props.headline),
          props.subheadline ? React.createElement("p", {
            style: { fontSize: "20px", color: t(props.tokens, "body", "text-secondary"), margin: "0 0 32px", maxWidth: 640, marginInline: "auto" },
          }, props.subheadline) : null,
          (ctaEl || secondaryCtaEl)
            ? React.createElement("div", { style: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" } }, ctaEl, secondaryCtaEl)
            : null,
          image,
        ),
      );
    },

    FeatureGrid: ({ props }) => {
      const items = (props.items ?? []).map((item, i) =>
        React.createElement("div", {
          key: i,
          style: { flex: "1 1 280px", padding: 24, backgroundColor: "var(--color-surface-primary)", borderRadius: "var(--radius-lg, 12px)", border: "1px solid var(--color-border-primary)" },
        },
          item.icon ? React.createElement("div", { style: { fontSize: "24px", marginBottom: 12 } }, item.icon) : null,
          React.createElement("h3", { style: { fontSize: "18px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 8px" } }, item.title),
          React.createElement("p", { style: { fontSize: "14px", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 } }, item.description),
        ),
      );

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
      },
        React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } },
          props.heading ? React.createElement("h2", { style: { fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 12px", fontFamily: "var(--font-display)" } }, props.heading) : null,
          props.subheading ? React.createElement("p", { style: { fontSize: "16px", color: "var(--color-text-secondary)", textAlign: "center", margin: "0 0 40px", maxWidth: 600, marginInline: "auto" } }, props.subheading) : null,
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" } }, ...items),
        ),
      );
    },

    StatsBar: ({ props }) => {
      const items = (props.items ?? []).map((item, i) =>
        React.createElement("div", {
          key: i,
          style: { textAlign: "center", flex: "1 1 120px" },
        },
          React.createElement("div", { style: { fontSize: "36px", fontWeight: 700, color: "var(--color-accent-primary)", fontFamily: "var(--font-display)" } }, `${item.prefix ?? ""}${item.value}${item.suffix ?? ""}`),
          React.createElement("div", { style: { fontSize: "14px", color: "var(--color-text-secondary)", marginTop: 4 } }, item.label),
        ),
      );

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-secondary"), padding: "48px 0" },
      },
        React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } },
          props.heading ? React.createElement("h2", { style: { fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 32px", fontFamily: "var(--font-display)" } }, props.heading) : null,
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" } }, ...items),
        ),
      );
    },

    DataTable: ({ props }) => {
      const headerCells = props.headers.map((h, i) =>
        React.createElement("th", {
          key: i,
          style: { padding: "12px 16px", textAlign: "left" as const, fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "2px solid var(--color-border-primary)" },
        }, h),
      );

      const rows = props.rows.map((row, ri) =>
        React.createElement("tr", { key: ri },
          ...row.map((cell, ci) =>
            React.createElement("td", {
              key: ci,
              style: { padding: "12px 16px", fontSize: "14px", color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-primary)" },
            }, cell),
          ),
        ),
      );

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
      },
        React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } },
          props.heading ? React.createElement("h2", { style: { fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 24px", fontFamily: "var(--font-display)" } }, props.heading) : null,
          React.createElement("div", { style: { overflowX: "auto" as const } },
            React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" as const } },
              props.caption ? React.createElement("caption", { style: { textAlign: "left" as const, fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: 12 } }, props.caption) : null,
              React.createElement("thead", null, React.createElement("tr", null, ...headerCells)),
              React.createElement("tbody", null, ...rows),
            ),
          ),
        ),
      );
    },

    Testimonials: ({ props }) => {
      const items = (props.items ?? []).map((item, i) =>
        React.createElement("div", {
          key: i,
          style: { flex: "1 1 320px", padding: 24, backgroundColor: "var(--color-surface-primary)", borderRadius: "var(--radius-lg, 12px)", border: "1px solid var(--color-border-primary)" },
        },
          React.createElement("p", { style: { fontSize: "15px", color: "var(--color-text-primary)", lineHeight: 1.7, margin: "0 0 16px", fontStyle: "italic" } }, `\u201C${item.quote}\u201D`),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
            item.avatar ? React.createElement("img", { src: item.avatar, alt: item.author, style: { width: 40, height: 40, borderRadius: "50%", objectFit: "cover" as const } }) : null,
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" } }, item.author),
              item.role ? React.createElement("div", { style: { fontSize: "13px", color: "var(--color-text-secondary)" } }, item.role) : null,
            ),
          ),
        ),
      );

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
      },
        React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } },
          props.heading ? React.createElement("h2", { style: { fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 40px", fontFamily: "var(--font-display)" } }, props.heading) : null,
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" } }, ...items),
        ),
      );
    },

    PricingTable: ({ props }) => {
      const plans = (props.plans ?? []).map((plan, i) => {
        const features = plan.features.map((f, fi) =>
          React.createElement("li", { key: fi, style: { padding: "6px 0", fontSize: "14px", color: "var(--color-text-secondary)" } }, f),
        );

        return React.createElement("div", {
          key: i,
          style: {
            flex: "1 1 280px", maxWidth: 360, padding: 32,
            backgroundColor: "var(--color-surface-primary)",
            borderRadius: "var(--radius-lg, 12px)",
            border: plan.highlighted ? "2px solid var(--color-accent-primary)" : "1px solid var(--color-border-primary)",
            display: "flex", flexDirection: "column" as const,
          },
        },
          plan.highlighted ? React.createElement("span", { style: { display: "inline-block", backgroundColor: "var(--color-accent-primary)", color: "var(--color-accent-text)", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600, marginBottom: 12, alignSelf: "flex-start" } }, "Popular") : null,
          React.createElement("h3", { style: { fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 8px" } }, plan.name),
          plan.description ? React.createElement("p", { style: { fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 16px" } }, plan.description) : null,
          React.createElement("div", { style: { fontSize: "36px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 4px" } }, plan.price),
          plan.period ? React.createElement("div", { style: { fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: 24 } }, plan.period) : null,
          React.createElement("ul", { style: { listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 } }, ...features),
          plan.cta ? React.createElement("a", {
            href: plan.cta.url,
            style: {
              display: "block", textAlign: "center" as const,
              backgroundColor: plan.highlighted ? "var(--color-accent-primary)" : "transparent",
              color: plan.highlighted ? "var(--color-accent-text)" : "var(--color-accent-primary)",
              border: "1px solid var(--color-accent-primary)",
              padding: "10px 20px", borderRadius: "var(--radius-md, 8px)",
              textDecoration: "none", fontWeight: 600, fontSize: "14px",
            },
          }, plan.cta.text) : null,
        );
      });

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
      },
        React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } },
          props.heading ? React.createElement("h2", { style: { fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 12px", fontFamily: "var(--font-display)" } }, props.heading) : null,
          props.subheading ? React.createElement("p", { style: { fontSize: "16px", color: "var(--color-text-secondary)", textAlign: "center", margin: "0 0 40px" } }, props.subheading) : null,
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", alignItems: "stretch" } }, ...plans),
        ),
      );
    },

    CTA: ({ props }) => {
      const secondaryCtaEl = props.secondaryCta
        ? React.createElement("a", {
            href: props.secondaryCta.url,
            style: { border: "1px solid var(--color-border-primary)", color: "var(--color-text-primary)", padding: "12px 24px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "16px", fontWeight: 500 },
          }, props.secondaryCta.text)
        : null;

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-secondary"), padding: "64px 0" },
      },
        React.createElement("div", { style: { maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center" } },
          React.createElement("h2", { style: { fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 12px", fontFamily: "var(--font-display)" } }, props.heading),
          props.subheading ? React.createElement("p", { style: { fontSize: "16px", color: "var(--color-text-secondary)", margin: "0 0 32px" } }, props.subheading) : null,
          React.createElement("div", { style: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" } },
            React.createElement("a", {
              href: props.cta.url,
              style: { backgroundColor: "var(--color-accent-primary)", color: "var(--color-accent-text)", padding: "12px 24px", borderRadius: "var(--radius-md, 8px)", textDecoration: "none", fontSize: "16px", fontWeight: 600 },
            }, props.cta.text),
            secondaryCtaEl,
          ),
        ),
      );
    },

    FAQ: ({ props }) => {
      const items = (props.items ?? []).map((item, i) =>
        React.createElement("details", {
          key: i,
          style: { borderBottom: "1px solid var(--color-border-primary)", padding: "16px 0" },
        },
          React.createElement("summary", { style: { fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)", cursor: "pointer", listStyle: "none" } }, item.question),
          React.createElement("p", { style: { fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: 1.7, margin: "12px 0 0", paddingLeft: 0 } }, item.answer),
        ),
      );

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
      },
        React.createElement("div", { style: { maxWidth: 800, margin: "0 auto", padding: "0 24px" } },
          props.heading ? React.createElement("h2", { style: { fontSize: "32px", fontWeight: 700, color: "var(--color-text-primary)", textAlign: "center", margin: "0 0 40px", fontFamily: "var(--font-display)" } }, props.heading) : null,
          React.createElement("div", null, ...items),
        ),
      );
    },

    ContentBlock: ({ props }) => {
      const imageEl = props.image
        ? React.createElement("img", {
            src: props.image.src,
            alt: props.image.alt,
            style: { maxWidth: "100%", borderRadius: "var(--radius-lg, 12px)" },
          })
        : null;

      const pos = props.image?.position ?? "right";
      const isHorizontal = pos === "left" || pos === "right";

      if (isHorizontal && props.image) {
        const textBlock = React.createElement("div", { style: { flex: 1 } },
          props.heading ? React.createElement("h2", { style: { fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 16px", fontFamily: "var(--font-display)" } }, props.heading) : null,
          React.createElement("div", { style: { fontSize: "16px", color: "var(--color-text-secondary)", lineHeight: 1.7 } }, props.body),
        );
        const imgBlock = React.createElement("div", { style: { flex: 1 } }, imageEl);

        return React.createElement("section", {
          style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
        },
          React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" } },
            pos === "left" ? imgBlock : textBlock,
            pos === "left" ? textBlock : imgBlock,
          ),
        );
      }

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
      },
        React.createElement("div", { style: { maxWidth: 800, margin: "0 auto", padding: "0 24px" } },
          pos === "top" && imageEl ? imageEl : null,
          props.heading ? React.createElement("h2", { style: { fontSize: "28px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 16px", fontFamily: "var(--font-display)" } }, props.heading) : null,
          React.createElement("div", { style: { fontSize: "16px", color: "var(--color-text-secondary)", lineHeight: 1.7 } }, props.body),
          pos === "bottom" && imageEl ? imageEl : null,
        ),
      );
    },

    LogoCloud: ({ props }) => {
      const logos = (props.logos ?? []).map((logo, i) => {
        const img = React.createElement("img", {
          src: logo.src,
          alt: logo.alt,
          style: { height: 32, opacity: 0.7, filter: "grayscale(100%)", transition: "opacity 0.2s, filter 0.2s" },
        });
        return logo.url
          ? React.createElement("a", { key: i, href: logo.url, style: { display: "flex", alignItems: "center" } }, img)
          : React.createElement("div", { key: i, style: { display: "flex", alignItems: "center" } }, img);
      });

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "48px 0" },
      },
        React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } },
          props.heading ? React.createElement("p", { style: { fontSize: "14px", color: "var(--color-text-secondary)", textAlign: "center", margin: "0 0 24px", textTransform: "uppercase" as const, letterSpacing: "0.05em", fontWeight: 600 } }, props.heading) : null,
          React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", alignItems: "center" } }, ...logos),
        ),
      );
    },

    Footer: ({ props }) => {
      const columns = (props.columns ?? []).map((col, ci) => {
        const links = col.links.map((l, li) =>
          React.createElement("a", {
            key: li,
            href: l.url,
            style: { display: "block", fontSize: "14px", color: "var(--color-text-secondary)", textDecoration: "none", padding: "4px 0" },
          }, l.text),
        );
        return React.createElement("div", { key: ci, style: { flex: "1 1 160px" } },
          React.createElement("h4", { style: { fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 12px", textTransform: "uppercase" as const, letterSpacing: "0.05em" } }, col.title),
          ...links,
        );
      });

      const social = (props.social ?? []).map((item, i) =>
        React.createElement("a", {
          key: i,
          href: item.url,
          style: { color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "14px" },
        }, item.icon ?? item.platform),
      );

      return React.createElement("footer", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-secondary"), borderTop: "1px solid var(--color-border-primary)", padding: "48px 0 24px" },
      },
        React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } },
          columns.length > 0 ? React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 32 } }, ...columns) : null,
          social.length > 0 ? React.createElement("div", { style: { display: "flex", gap: 16, marginBottom: 24 } }, ...social) : null,
          props.copyright ? React.createElement("p", { style: { fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 } }, props.copyright) : null,
        ),
      );
    },

    CustomHTML: ({ props }) => {
      if (props.htmlHint) {
        return React.createElement("section", {
          style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
        },
          React.createElement("div", {
            style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
            dangerouslySetInnerHTML: { __html: props.htmlHint },
          }),
        );
      }

      return React.createElement("section", {
        style: { backgroundColor: t(props.tokens, "bg", "bg-primary"), padding: "64px 0" },
      },
        React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" } },
          React.createElement("div", {
            style: { padding: 32, backgroundColor: "var(--color-surface-primary)", borderRadius: "var(--radius-lg, 12px)", border: "1px dashed var(--color-border-primary)", textAlign: "center" },
          },
            React.createElement("p", { style: { fontSize: "14px", color: "var(--color-text-secondary)" } }, props.description),
          ),
        ),
      );
    },
  },

  actions: {
    navigate: async (params) => {
      if (params?.url && typeof window !== "undefined") {
        window.location.href = params.url;
      }
    },
  },
});
