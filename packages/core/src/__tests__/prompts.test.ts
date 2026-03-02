import { describe, it, expect } from "vitest";
import { getScreenshotPrompt } from "../prompts/screenshot-capturer.js";

describe("Core prompt generation", () => {
  const testUrl = "https://example.com";

  it("design-system mode prompt does NOT contain take_screenshot and CONTAINS color-data.json", () => {
    const prompt = getScreenshotPrompt(testUrl, "design-system");
    expect(prompt).toContain(testUrl);
    expect(prompt).toContain("navigate_page");
    expect(prompt).toContain("1440px");
    // Font extraction steps
    expect(prompt).toContain("font-data.json");
    expect(prompt).toContain("evaluate_script");
    expect(prompt).toContain("public/fonts");
    // Color extraction via JS
    expect(prompt).toContain("color-data.json");
    expect(prompt).toContain("getComputedStyle");
    // Should NOT contain screenshot instructions
    expect(prompt).not.toContain("take_screenshot");
    expect(prompt).not.toContain("full-page.png");
  });

  it("default mode is design-system (no screenshots)", () => {
    const prompt = getScreenshotPrompt(testUrl);
    expect(prompt).not.toContain("take_screenshot");
    expect(prompt).toContain("color-data.json");
  });

  it("replicate mode prompt CONTAINS take_screenshot", () => {
    const prompt = getScreenshotPrompt(testUrl, "replicate");
    expect(prompt).toContain(testUrl);
    expect(prompt).toContain("navigate_page");
    expect(prompt).toContain("take_screenshot");
    expect(prompt).toContain("full-page.png");
    expect(prompt).toContain("1440px");
    // Font extraction steps
    expect(prompt).toContain("font-data.json");
    expect(prompt).toContain("evaluate_script");
    expect(prompt).toContain("public/fonts");
    // Color extraction via JS (also present in replicate)
    expect(prompt).toContain("color-data.json");
  });
});
