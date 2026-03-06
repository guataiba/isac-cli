export { catalog } from "./catalog.js";
export type { IsacCatalog } from "./catalog.js";
export { registry } from "./registry.js";
export { generatePageFromSpec, generateIsacPageComponent, generateRegistryReExport } from "./page-generator.js";

// ── Design System (capture mode) ──
export { dsCatalog } from "./ds-catalog.js";
export type { DSCatalog } from "./ds-catalog.js";
export { dsRegistry } from "./ds-registry.js";
export {
  generateDesignSystemSpec,
  generateDSPageFromSpec,
  generateDSPageComponent,
  generateDSCatalogSource,
  generateDSRegistrySource,
} from "./ds-spec-generator.js";
