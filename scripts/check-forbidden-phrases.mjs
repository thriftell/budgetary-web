#!/usr/bin/env node
/**
 * Forbidden-phrase gate (Invariants 1 & 2 of the 0020a spec).
 *
 * Budgetary's whole differentiator is intellectual honesty: the copy is the
 * product. This script fails the build if any cardinal-sin marketing phrase or
 * any private engine-internals term appears in the site copy.
 *
 * Runs twice: as `prebuild` over src/ (catches authors early) and as
 * `postbuild` over the rendered dist/ (catches anything that slips through
 * components or data). Exit non-zero on any hit.
 *
 * Usage:
 *   node scripts/check-forbidden-phrases.mjs          # scans src/ + public/
 *   node scripts/check-forbidden-phrases.mjs dist      # scans dist/ (rendered HTML)
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

// ── Cardinal-sin copy (Invariant 2). Never claim accurate/guaranteed spend
//    prediction. Each entry is matched case-insensitively; flexible whitespace.
const FORBIDDEN_COPY = [
  { id: "accurately-predicts", re: /accurately\s+predicts?\s+your\s+token\s+spend/i },
  { id: "know-exactly", re: /know\s+exactly\s+what\s+it('?ll| will)\s+cost/i },
  { id: "rely-on-prediction", re: /AI\s+cost\s+prediction\s+you\s+can\s+rely\s+on/i },
  { id: "precise-forecasts", re: /precise\s+forecasts?/i },
  { id: "impossible-to-budget", re: /impossible\s+to\s+budget\s+AI\s+spend\s+without\s+us/i },
  // Headline number framed as a guarantee, e.g. "save 40%".
  { id: "guaranteed-savings", re: /\bsave\s+\d{1,3}\s*%/i },
  // We never claim to read the user's repo.
  { id: "tracks-codebase", re: /\b(tracks?|indexes?|scans?)\s+your\s+(codebase|repo|repository)/i },
];

// ── Engine-internals vocabulary (Invariant 1). Pre-filing-sensitive; the
//    engine is private. Public vocabulary is the /v1 contract + plain behavior
//    words only. NOTE: `out_of_domain` is a wire-contract scenario label but is
//    explicitly forbidden as public marketing copy — render "no read" instead.
const FORBIDDEN_INTERNALS = [
  { id: "knn", re: /\bk-?nn\b/i },
  { id: "nearest-neighbor", re: /\bnearest[-\s]neighbou?rs?\b/i },
  { id: "neighbors", re: /\bneighbou?rs?\b/i },
  { id: "coverage-method", re: /\bcoverage\s+method\b/i },
  { id: "bandwidth", re: /\bbandwidth\b/i },
  { id: "csr", re: /\bCSR\b/ },
  { id: "ambiguity-scoring", re: /\bambiguity\s+scor/i },
  { id: "manifold", re: /\bmanifold\b/i },
  { id: "out-of-domain", re: /\bout[_-]of[_-]domain\b/i },
];

const RULES = [...FORBIDDEN_COPY, ...FORBIDDEN_INTERNALS];

const SCAN_EXT = new Set([".astro", ".md", ".mdx", ".ts", ".js", ".mjs", ".html", ".txt", ".json"]);
// Files this checker should not scan (it contains the patterns themselves).
const SELF = "check-forbidden-phrases.mjs";

const target = process.argv[2];
const roots = target ? [target] : ["src", "public"];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".git")) continue;
      yield* walk(p);
    } else if (SCAN_EXT.has(extname(p)) && !p.endsWith(SELF)) {
      yield p;
    }
  }
}

const hits = [];
for (const root of roots) {
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const rule of RULES) {
        const m = line.match(rule.re);
        if (m) hits.push({ file, line: i + 1, id: rule.id, match: m[0].trim() });
      }
    });
  }
}

if (hits.length) {
  console.error("\n✗ Forbidden-phrase check FAILED — the copy is the product; honesty is non-negotiable.\n");
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  [${h.id}]  "${h.match}"`);
  }
  console.error(`\n${hits.length} violation(s). See scripts/check-forbidden-phrases.mjs for the rules.\n`);
  process.exit(1);
}

console.log(`✓ Forbidden-phrase check passed (${roots.join(", ")}).`);
