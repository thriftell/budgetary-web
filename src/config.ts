/**
 * Build-time configuration.
 *
 * SHOW_DETAILS — the disclosure gate for the 0020b "Details / how-it-works"
 * depth. This is the most disclosure-sensitive surface on the site and its
 * go-live is COUNSEL-GATED.
 *
 * Default: false. When false, the gated pages are NOT emitted into dist/ at
 * all (zero public exposure), are excluded from the sitemap, the nav/footer
 * links to them are hidden, and robots.txt disallows their paths.
 *
 * Two-step go-live (see GATING.md):
 *   1. Build/deploy with SHOW_DETAILS=true  → pages emit, link, enter sitemap,
 *      robots.txt stops disallowing them.
 *   2. Remove the marked `noindex` <meta> line in HowItWorks pages → indexable.
 *
 * Read from process.env at build time (server context) so no PUBLIC_ prefix is
 * needed and the flag never ships to the client.
 */
export const SHOW_DETAILS = process.env.SHOW_DETAILS === "true";

// Paths gated behind SHOW_DETAILS. Kept here so the route, the sitemap filter,
// and the robots.txt endpoint all agree on exactly one list.
export const GATED_PATHS = ["/how-it-works"];
