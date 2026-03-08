import { THEME_INIT_SCRIPT, THEME_INIT_SCRIPT_DARK } from "./root-layout-snippet.js";

export function getDesignSystemLayoutTemplate(isDarkFirst: boolean): string {
  const script = isDarkFirst ? THEME_INIT_SCRIPT_DARK : THEME_INIT_SCRIPT;
  return `export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: '${script}',
        }}
      />
      <div style={{ background: "var(--color-bg-primary)", color: "var(--color-text-primary)", minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
}
`;
}

/** @deprecated Use getDesignSystemLayoutTemplate() instead */
export const DESIGN_SYSTEM_LAYOUT_TEMPLATE = getDesignSystemLayoutTemplate(false);
