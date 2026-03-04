"use client";

import { useState } from "react";

const FONT_DISPLAY = '"Anthropic Sans", Arial, sans-serif';
const FONT_SANS = '"Anthropic Serif", Georgia, sans-serif';

export function CookieBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie settings"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border-primary)",
        borderRadius: 12,
        padding: "20px 24px",
        maxWidth: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          fontFamily: FONT_SANS,
          color: "var(--color-text-primary)",
          marginBottom: 8,
        }}
      >
        Cookie Settings
      </h2>
      <p
        style={{
          fontSize: 13,
          fontFamily: FONT_DISPLAY,
          color: "var(--color-text-secondary)",
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        We use cookies to deliver and improve our services, analyse site usage, and if you agree, to customise or personalise your experience and market our services to you. You can read our Cookie Policy{" "}
        <a
          href="#"
          style={{ color: "var(--color-text-primary)", textDecoration: "underline" }}
        >
          here
        </a>
        .
      </p>
      <button
        onClick={() => setDismissed(true)}
        style={{
          display: "block",
          width: "100%",
          padding: "8px 0",
          marginBottom: 8,
          fontSize: 13,
          fontFamily: FONT_DISPLAY,
          background: "var(--color-bg-primary)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border-primary)",
          borderRadius: 6,
          cursor: "pointer",
          transition: "opacity 0.15s",
        }}
      >
        Customize cookie settings
      </button>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setDismissed(true)}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: 13,
            fontFamily: FONT_DISPLAY,
            background: "var(--color-bg-primary)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border-primary)",
            borderRadius: 6,
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
        >
          Reject all cookies
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: 13,
            fontFamily: FONT_DISPLAY,
            background: "var(--color-accent)",
            color: "var(--color-text-inverse)",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
        >
          Accept all cookies
        </button>
      </div>
    </div>
  );
}
