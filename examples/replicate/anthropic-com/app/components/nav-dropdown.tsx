"use client";

import { useState, useRef, useEffect } from "react";

const FONT_DISPLAY = '"Anthropic Sans", Arial, sans-serif';

interface NavDropdownProps {
  label: string;
}

export function NavDropdown({ label }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <li ref={ref} style={{ position: "relative", listStyle: "none" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          padding: 0,
          fontSize: 14,
          fontFamily: FONT_DISPLAY,
          color: "var(--color-text-primary)",
          cursor: "pointer",
          transition: "opacity 0.15s",
          opacity: open ? 1 : undefined,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            background: "var(--color-bg-primary)",
            border: "1px solid var(--color-border-primary)",
            borderRadius: 8,
            padding: "8px 0",
            minWidth: 160,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            zIndex: 100,
          }}
        >
          <p
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontFamily: FONT_DISPLAY,
              color: "var(--color-text-secondary)",
            }}
          >
            Coming soon
          </p>
        </div>
      )}
    </li>
  );
}
