// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static output, no runtime backend. Custom domain is budgetary.tools (apex + www).
export default defineConfig({
  site: "https://budgetary.tools",
  output: "static",
  trailingSlash: "ignore",
  integrations: [sitemap()],
});
