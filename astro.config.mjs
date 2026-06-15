// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Disclosure gate (0020b): keep gated paths out of the sitemap unless flipped on.
// Mirrors src/config.ts (kept inline so the .mjs config has no TS import).
const SHOW_DETAILS = process.env.SHOW_DETAILS === "true";
const GATED_PATHS = ["/how-it-works"];

// Static output, no runtime backend. Custom domain is budgetary.tools (apex + www).
export default defineConfig({
  site: "https://budgetary.tools",
  output: "static",
  trailingSlash: "ignore",
  integrations: [
    sitemap({
      // Defense-in-depth: even if a gated page were emitted, keep it out of the
      // sitemap until SHOW_DETAILS is true.
      filter: (page) =>
        SHOW_DETAILS ||
        !GATED_PATHS.some((p) => new URL(page).pathname.replace(/\/$/, "") === p),
    }),
  ],
});
