import type { APIRoute } from "astro";
import { SHOW_DETAILS, GATED_PATHS } from "../config";

// Flag-aware robots.txt. While the disclosure gate is closed (SHOW_DETAILS
// false, the default) we explicitly Disallow the gated paths as defense-in-depth
// on top of the fact that they aren't emitted at all. When counsel flips the
// gate on, the Disallow lines drop and the paths become crawlable.
export const GET: APIRoute = () => {
  const lines = ["User-agent: *", "Allow: /"];

  if (!SHOW_DETAILS) {
    for (const p of GATED_PATHS) lines.push(`Disallow: ${p}`);
    lines.push("Disallow: /docs/");
  }

  lines.push("", "Sitemap: https://budgetary.tools/sitemap-index.xml", "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
