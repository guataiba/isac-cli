import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

// ── Shared primitives ───────────────────────────────────────────

const LinkItem = z.object({
  text: z.string(),
  url: z.string(),
});

const TokenMap = z.record(z.string(), z.string()).nullable()
  .describe("Map of element role to CSS token name, e.g. { bg: 'bg-secondary', heading: 'text-primary' }");

const Behavior = z.enum(["static", "sticky", "scroll-reveal", "parallax"]).nullable()
  .describe("Section behavior");

const ResponsiveHint = z.enum(["stack", "scroll", "hide", "collapse"]).nullable()
  .describe("How this section adapts on mobile");

// ── Catalog ─────────────────────────────────────────────────────

export const catalog = defineCatalog(schema, {
  components: {
    Page: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      slots: ["default"],
      description: "Root page wrapper. Always use as the root element. All sections are children of this component.",
    },

    Header: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        logo: z.object({
          src: z.string().nullable(),
          alt: z.string().nullable(),
          text: z.string().nullable(),
        }).nullable(),
        nav: z.array(LinkItem).nullable(),
        cta: LinkItem.nullable(),
      }),
      description: "Site header with logo, navigation links, and optional CTA button. Use behavior='sticky' for fixed headers.",
    },

    Hero: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        headline: z.string(),
        subheadline: z.string().nullable(),
        cta: LinkItem.nullable(),
        secondaryCta: LinkItem.nullable(),
        image: z.object({ src: z.string(), alt: z.string() }).nullable(),
        badge: z.string().nullable(),
      }),
      description: "Hero section with headline, subheadline, CTA buttons, optional image and badge. Centered layout.",
    },

    FeatureGrid: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string().nullable(),
        subheading: z.string().nullable(),
        columns: z.number().nullable(),
        items: z.array(z.object({
          icon: z.string().nullable(),
          title: z.string(),
          description: z.string(),
        })),
      }),
      description: "Grid of feature cards. Each item has an optional icon, title, and description. Default 3 columns.",
    },

    StatsBar: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string().nullable(),
        items: z.array(z.object({
          value: z.string(),
          label: z.string(),
          prefix: z.string().nullable(),
          suffix: z.string().nullable(),
        })),
      }),
      description: "Horizontal bar of stats/metrics. Each item has a large value and a label below it.",
    },

    DataTable: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string().nullable(),
        caption: z.string().nullable(),
        headers: z.array(z.string()),
        rows: z.array(z.array(z.string())),
      }),
      description: "Data table with headers and rows. Supports horizontal scrolling on mobile.",
    },

    Testimonials: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string().nullable(),
        items: z.array(z.object({
          quote: z.string(),
          author: z.string(),
          role: z.string().nullable(),
          avatar: z.string().nullable(),
        })),
      }),
      description: "Testimonials section with quote cards. Each card has a quote, author name, optional role and avatar.",
    },

    PricingTable: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string().nullable(),
        subheading: z.string().nullable(),
        plans: z.array(z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().nullable(),
          description: z.string().nullable(),
          features: z.array(z.string()),
          cta: LinkItem.nullable(),
          highlighted: z.boolean().nullable(),
        })),
      }),
      description: "Pricing table with plan cards. Supports highlighting a recommended plan.",
    },

    CTA: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string(),
        subheading: z.string().nullable(),
        cta: LinkItem,
        secondaryCta: LinkItem.nullable(),
      }),
      description: "Call-to-action section with heading, subheading, and action buttons.",
    },

    FAQ: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string().nullable(),
        items: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })),
      }),
      description: "FAQ section with expandable question/answer pairs using <details> elements.",
    },

    ContentBlock: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string().nullable(),
        body: z.string(),
        image: z.object({
          src: z.string(),
          alt: z.string(),
          position: z.enum(["left", "right", "top", "bottom"]).nullable(),
        }).nullable(),
      }),
      description: "Content block with heading, body text, and optional image. Image position controls layout (left/right = side-by-side, top/bottom = stacked).",
    },

    LogoCloud: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        heading: z.string().nullable(),
        logos: z.array(z.object({
          src: z.string(),
          alt: z.string(),
          url: z.string().nullable(),
        })),
      }),
      description: "Logo cloud showing customer/partner logos in a centered row. Logos are grayscale by default.",
    },

    Footer: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        copyright: z.string().nullable(),
        columns: z.array(z.object({
          title: z.string(),
          links: z.array(LinkItem),
        })).nullable(),
        social: z.array(z.object({
          platform: z.string(),
          url: z.string(),
          icon: z.string().nullable(),
        })).nullable(),
      }),
      description: "Site footer with link columns, social links, and copyright text.",
    },

    CustomHTML: {
      props: z.object({
        behavior: Behavior,
        tokens: TokenMap,
        description: z.string(),
        htmlHint: z.string().nullable(),
      }),
      description: "Fallback section for content that doesn't fit other types. Provide a description of what it should render. Avoid using this when a specific component type exists.",
    },
  },

  actions: {
    navigate: {
      params: z.object({ url: z.string() }),
      description: "Navigate to a URL",
    },
  },
});

export type IsacCatalog = typeof catalog;
