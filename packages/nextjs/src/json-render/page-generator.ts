import type { Spec } from "@json-render/core";

/**
 * Generate a page.tsx file that renders a json-render spec
 * using the ISAC registry. The spec is embedded as a constant.
 */
export function generatePageFromSpec(spec: Spec, title: string, description?: string): string {
  const specJson = JSON.stringify(spec, null, 2);
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedDesc = (description ?? "").replace(/"/g, '\\"');

  return `import type { Metadata } from "next";
import { IsacPage } from "./json-render/isac-page";

export const metadata: Metadata = {
  title: "${escapedTitle}",
  description: "${escapedDesc}",
};

const spec = ${specJson} as const;

export default function Home() {
  return <IsacPage spec={spec} />;
}
`;
}

/**
 * Generate the IsacPage client component that wraps the Renderer.
 * This is a separate file because Renderer requires "use client".
 */
export function generateIsacPageComponent(): string {
  return `"use client";

import { Renderer, JSONUIProvider } from "@json-render/react";
import { registry } from "./registry";

interface IsacPageProps {
  spec: Parameters<typeof Renderer>[0]["spec"];
}

export function IsacPage({ spec }: IsacPageProps) {
  return (
    <JSONUIProvider registry={registry}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}
`;
}

/**
 * Generate a re-export of the registry for the app directory.
 * This copies the registry into the app so Next.js can resolve it.
 */
export function generateRegistryReExport(): string {
  return `export { registry } from "@guataiba/isac-nextjs/json-render";
`;
}
