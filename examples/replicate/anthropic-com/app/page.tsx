"use client";

import { NavDropdown } from "./components/nav-dropdown";
import { CookieBanner } from "./components/cookie-banner";
import { ThemeToggle } from "./components/theme-toggle";

// ─── Font stacks ───────────────────────────────────────────────────────────────
const SERIF = '"Anthropic Serif", Georgia, sans-serif';
const DISPLAY = '"Anthropic Sans", Arial, sans-serif';

// ─── Data ──────────────────────────────────────────────────────────────────────
const LATEST_RELEASES = [
  {
    title: "Statement on the comments from Secretary of War Pete Hegseth",
    excerpt: "Anthropic's response to the Secretary of War and advice to customers.",
    date: "February 27, 2026",
    category: "Announcements",
  },
  {
    title: "Statement from Dario Amodei on our discussions with the Department of War",
    excerpt: "A statement from our CEO on national security uses of AI.",
    date: "February 26, 2026",
    category: "Announcements",
  },
  {
    title: "Claude is a space to think",
    excerpt:
      "No ads. No sponsored content. Just genuinely helpful conversations.",
    date: "February 4, 2026",
    category: "Announcements",
  },
];

const MISSION_LINKS = [
  { text: "Core views on AI safety", category: "Announcements" },
  { text: "Anthropic's Responsible Scaling Policy", category: "Alignment Science" },
  { text: "Anthropic Academy: Build and Learn with Claude", category: "Education" },
  { text: "Anthropic's Economic Index", category: "Economic Research" },
  { text: "Claude's constitution", category: "Announcements" },
];

const FOOTER_COLS = [
  {
    label: "Products",
    links: [
      "Claude",
      "Claude Code",
      "Claude Code for Enterprise",
      "Cowork",
      "Claude in Chrome",
      "Claude in Excel",
      "Claude in PowerPoint",
      "Claude in Slack",
      "Skills",
      "Mini plan",
      "Team plan",
      "Enterprise plan",
      "Download app",
      "Pricing",
      "Login to Claude",
    ],
    extra: {
      label: "Models",
      links: ["Opus", "Sonnet", "Haiku"],
    },
  },
  {
    label: "Solutions",
    links: [
      "All agents",
      "Claude Code Security",
      "Code modernization",
      "Coding",
      "Customer support",
      "Education",
      "Financial services",
      "Government",
      "Healthcare",
      "Life sciences",
      "Nonprofits",
    ],
    extra: {
      label: "Claude Developer Platform",
      links: [
        "Overview",
        "Developer docs",
        "Pricing",
        "Regional compliance",
        "Amazon Bedrock",
        "Google Cloud's Vertex AI",
        "Consologue",
      ],
    },
  },
  {
    label: "Learn",
    links: [
      "Blog",
      "Claude partner network",
      "Connectors",
      "Courses",
      "Customer stories",
      "Engineering at Anthropic",
      "Events",
      "Plugins",
      "Powered by Claude",
      "Service partners",
      "Startups program",
      "Tutorials",
      "Use cases",
    ],
  },
  {
    label: "Company",
    links: [
      "Anthropic",
      "Careers",
      "Economic Futures",
      "Research",
      "News",
      "Claude's Constitution",
      "Responsible Scaling Policy",
      "Security and compliance",
      "Transparency",
    ],
  },
  {
    label: "Help and security",
    links: ["Availability", "Status", "Support center"],
    extra: {
      label: "Terms and policies",
      links: [
        "Privacy choices",
        "Privacy policy",
        "Consumer health data privacy policy",
        "Responsible disclosure policy",
        "Terms of service: Commercial",
        "Terms of service: Consumer",
        "Usage policy",
      ],
    },
  },
];

// ─── SVG helpers ───────────────────────────────────────────────────────────────
function ChevronDown({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 4L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnthropicLogoMark() {
  // Simplified "AI" wordmark for footer
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Anthropic"
    >
      <text
        x="0"
        y="24"
        fontSize="22"
        fontWeight="700"
        fontFamily="Georgia, serif"
        fill="currentColor"
      >
        AI
      </text>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="LinkedIn">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="X (Twitter)">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.865L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="YouTube">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ─── Components ────────────────────────────────────────────────────────────────
function ArticleCard({
  title,
  excerpt,
  date,
  category,
}: {
  title: string;
  excerpt: string;
  date: string;
  category: string;
}) {
  return (
    <article
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border-primary)",
        borderRadius: 8,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div>
        <h3
          style={{
            fontSize: 15,
            fontFamily: SERIF,
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: 12,
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            fontFamily: DISPLAY,
            color: "var(--color-text-secondary)",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          {excerpt}
        </p>
      </div>
      <div>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: 4,
            fontSize: 11,
            fontFamily: DISPLAY,
            marginBottom: 24,
          }}
        >
          <dt
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-secondary)",
            }}
          >
            DATE
          </dt>
          <dd style={{ color: "var(--color-text-primary)" }}>{date}</dd>
          <dt
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-secondary)",
            }}
          >
            CATEGORY
          </dt>
          <dd style={{ color: "var(--color-text-primary)" }}>{category}</dd>
        </dl>
        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontFamily: DISPLAY,
            border: "1px solid var(--color-border-primary)",
            padding: "6px 12px",
            borderRadius: 4,
            color: "var(--color-text-primary)",
            textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--color-bg-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          Read the post →
        </a>
      </div>
    </article>
  );
}

function FooterColumn({
  label,
  links,
  extra,
}: {
  label: string;
  links: string[];
  extra?: { label: string; links: string[] };
}) {
  const headingStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: DISPLAY,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    opacity: 0.6,
    marginBottom: 12,
    color: "var(--color-text-inverse)",
  };
  const linkStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontFamily: DISPLAY,
    color: "var(--color-text-inverse)",
    textDecoration: "none",
    marginBottom: 6,
    opacity: 0.8,
    transition: "opacity 0.15s",
  };

  return (
    <div>
      <h4 style={headingStyle}>{label}</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: extra ? 24 : 0 }}>
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              style={linkStyle}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
      {extra && (
        <>
          <h4 style={{ ...headingStyle, marginTop: 24 }}>{extra.label}</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {extra.links.map((l) => (
              <li key={l}>
                <a
                  href="#"
                  style={linkStyle}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = "1")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = "0.8")
                  }
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const navLinkStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: DISPLAY,
    color: "var(--color-text-primary)",
    textDecoration: "none",
    transition: "opacity 0.15s",
  };

  return (
    <>
      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "var(--color-bg-glass)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-primary)",
          zIndex: 50,
        }}
      >
        <nav
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56,
          }}
        >
          {/* Logo */}
          <a
            href="/"
            style={{ textDecoration: "none", color: "var(--color-text-primary)" }}
          >
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              ANTHROPIC\C
            </span>
          </a>

          {/* Nav links */}
          <ul
            style={{
              display: "flex",
              gap: 24,
              listStyle: "none",
              padding: 0,
              margin: 0,
              alignItems: "center",
            }}
          >
            {(["Research", "Economic Futures", "News"] as const).map((item) => (
              <li key={item}>
                <a
                  href="#"
                  style={navLinkStyle}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = "0.6")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = "1")
                  }
                >
                  {item}
                </a>
              </li>
            ))}
            <NavDropdown label="Commitments" />
            <NavDropdown label="Learn" />
          </ul>

          {/* CTA + theme toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "var(--color-bg-secondary)",
                  color: "var(--color-text-inverse)",
                  padding: "6px 16px",
                  borderRadius: 9999,
                  border: "none",
                  fontSize: 14,
                  fontFamily: DISPLAY,
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.opacity = "0.9")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.opacity = "1")
                }
              >
                Try Claude
                <ChevronDown />
              </button>
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ── */}
        <section
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "80px 24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                fontFamily: SERIF,
                fontWeight: 700,
                lineHeight: 1.15,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              AI{" "}
              <span style={{ textDecoration: "underline" }}>research</span>
              {" "}and{" "}
              <br />
              <span style={{ textDecoration: "underline" }}>products</span>
              {" "}that put
              <br />
              safety at the frontier
            </h1>
          </div>
          <div style={{ maxWidth: 360, paddingTop: 16 }}>
            <p
              style={{
                fontSize: 15,
                fontFamily: DISPLAY,
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              AI will have a vast impact on the world. Anthropic is a public
              benefit corporation dedicated to securing its benefits and
              mitigating its risks.
            </p>
          </div>
        </section>

        {/* ── Featured Article (Dark Hero) ── */}
        <section
          style={{
            width: "100%",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-inverse)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "64px 24px 32px",
              textAlign: "center",
              position: "relative",
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontFamily: DISPLAY,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                opacity: 0.6,
                marginBottom: 24,
              }}
            >
              FEATURED
            </p>
            <div style={{ position: "relative", display: "inline-block" }}>
              <h2
                style={{
                  fontSize: "clamp(4rem, 12vw, 10rem)",
                  fontFamily: SERIF,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  margin: 0,
                  position: "relative",
                  zIndex: 10,
                }}
              >
                FOUR HUNDRED METERS on MARS
              </h2>
            </div>
          </div>

          {/* Mars planet image placeholder */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px 0",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 384,
                height: 384,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 35%, #c1440e, #7a2500 60%, #2d0e00)",
                boxShadow: "0 0 80px rgba(193,68,14,0.3)",
              }}
              aria-hidden="true"
            />
          </div>

          <div
            style={{
              textAlign: "center",
              paddingBottom: 80,
              position: "relative",
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontSize: 20,
                fontFamily: SERIF,
                marginBottom: 16,
                color: "var(--color-text-inverse)",
              }}
            >
              The first AI-planned drive on another planet.
            </p>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                fontSize: 14,
                fontFamily: DISPLAY,
                color: "var(--color-text-inverse)",
                textDecoration: "underline",
              }}
            >
              Read the story →
            </a>
          </div>
        </section>

        {/* ── Latest Releases ── */}
        <section
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "64px 24px",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontFamily: DISPLAY,
              fontWeight: 500,
              marginBottom: 32,
              color: "var(--color-text-primary)",
            }}
          >
            Latest releases
          </h2>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {LATEST_RELEASES.map((card) => (
              <li key={card.title}>
                <ArticleCard {...card} />
              </li>
            ))}
          </ul>
        </section>

        {/* ── Mission + Resource Links ── */}
        <section
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "64px 24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 30,
                fontFamily: SERIF,
                fontWeight: 700,
                lineHeight: 1.3,
                maxWidth: 300,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              At Anthropic, we build AI to serve humanity&apos;s long-term
              well-being.
            </p>
          </div>
          <nav aria-label="Resources">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {MISSION_LINKS.map(({ text, category }) => (
                <li
                  key={text}
                  style={{
                    borderTop: "1px solid var(--color-border-secondary)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--color-border-subtle)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                >
                  <a
                    href="#"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "12px 0",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: DISPLAY,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {text}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: DISPLAY,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {category}
                    </span>
                  </a>
                </li>
              ))}
              <li
                style={{ borderTop: "1px solid var(--color-border-secondary)" }}
              />
            </ul>
          </nav>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "var(--color-bg-secondary)",
          color: "var(--color-text-inverse)",
          paddingTop: 64,
          paddingBottom: 32,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          {/* Logo row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 48,
            }}
          >
            <a
              href="/"
              style={{ color: "var(--color-text-inverse)", textDecoration: "none" }}
            >
              <AnthropicLogoMark />
            </a>
          </div>

          {/* Footer columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 32,
              marginBottom: 64,
            }}
          >
            {FOOTER_COLS.map((col) => (
              <FooterColumn
                key={col.label}
                label={col.label}
                links={col.links}
                extra={col.extra}
              />
            ))}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--color-border-secondary)",
              paddingTop: 24,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontFamily: DISPLAY,
                opacity: 0.6,
                color: "var(--color-text-inverse)",
                margin: 0,
              }}
            >
              © 2026 Anthropic PBC
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {(
                [
                  {
                    href: "https://www.linkedin.com/company/anthropicresearch",
                    Icon: LinkedInIcon,
                  },
                  { href: "https://x.com/anthropic", Icon: XIcon },
                  {
                    href: "https://www.youtube.com/@anthropic-ai",
                    Icon: YouTubeIcon,
                  },
                ] as const
              ).map(({ href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--color-text-inverse)",
                    opacity: 0.6,
                    transition: "opacity 0.15s",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = "1")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = "0.6")
                  }
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Cookie Banner (client overlay) ── */}
      <CookieBanner />
    </>
  );
}
