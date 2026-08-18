#!/usr/bin/env node
/**
 * Signup key-substitution + install-routing gate (0020g).
 *
 * Two invariants, both of which fail SILENTLY without this check.
 *
 * 1. THE SUBSTITUTION. `signup.astro` hands a brand-new user their real key by
 *    doing `heroInstall.replace("bg_test_YOUR_KEY", key)` on HERO_INSTALL. That
 *    is a string contract between two files: rename the placeholder, drop it, or
 *    let it appear twice, and the page still renders — it just hands every
 *    signup a placeholder instead of their key, at the highest-intent moment on
 *    the site. Nothing else in the build notices.
 *
 * 2. THE ROUTING. The hero command must be the stdio package — the path with a
 *    local process, and therefore a pending store and a transcript to read. The
 *    hosted streamable-http remote estimates only: an estimate made through it
 *    is never closed out by an actual, by any route. Handing that command to a
 *    new signup is silent in exactly the same way — the page renders, the
 *    command works, and no measurement ever arrives.
 *
 * Both needles are READ OUT OF THE SOURCE they guard (the placeholder from
 * signup.astro's own `.replace` call; the remote URL and the package name from
 * install.ts's own exports), so this check cannot drift from the constants it
 * pins. Routing is asserted positively — the hero must BE the stdio package —
 * because a blacklist of one CLI spelling (`--transport http`) is sidestepped by
 * `-t http`, `--transport=http`, or a bare positional URL.
 *
 * Usage:
 *   node scripts/check-hero-placeholder.mjs         # source contract (prebuild)
 *   node scripts/check-hero-placeholder.mjs dist    # rendered output (postbuild)
 */
import { readFileSync, existsSync } from "node:fs";

const fails = [];
const fail = (msg) => fails.push(msg);

const INSTALL_TS = "src/data/install.ts";
const SIGNUP = "src/pages/signup.astro";
const installSrc = readFileSync(INSTALL_TS, "utf8");

/** Evaluate an `export const NAME = <literal>;` out of install.ts. */
function exported(name) {
  const m = installSrc.match(new RegExp(`export const ${name}\\s*=\\s*([\\s\\S]*?);\\r?\\n`));
  if (!m) {
    fail(`${INSTALL_TS}: could not read the ${name} export.`);
    return null;
  }
  try {
    return new Function(`return ${m[1]}`)();
  } catch (err) {
    fail(`${INSTALL_TS}: ${name} did not evaluate (${err.message}).`);
    return null;
  }
}

// ── The needle, read from the code that performs the substitution ──────────
const signupSrc = readFileSync(SIGNUP, "utf8");
const replaceCall = signupSrc.match(/heroInstall\.replace\(\s*"([^"]+)"\s*,/);
if (!replaceCall) {
  fail(`${SIGNUP}: no \`heroInstall.replace("…", key)\` call found — either the ` +
       "substitution was removed (new signups get no key in their command) or it was " +
       "rewritten in a form this check cannot see. Update both together.");
}
const NEEDLE = replaceCall ? replaceCall[1] : null;

// ── The routing needles, read from the constants they guard ────────────────
const REMOTE_URL = exported("MCP_HTTP_REMOTE");
const PACKAGE = exported("MCP_PACKAGE");
const STDIO = PACKAGE ? `npx -y ${PACKAGE}` : null;

const WHY_REMOTE =
  "That path estimates only — no local process, so no pending store, no session-end " +
  "hook, and no run through it is ever closed out by an actual. The command the hero " +
  "and /signup hand out must be a path that can be measured.";

/** The routing assertions, applied to whichever text carries the hero command. */
function assertRouting(text, where) {
  if (STDIO && !text.includes(STDIO)) {
    fail(`${where} is not the stdio package (expected to contain "${STDIO}"). ${WHY_REMOTE}`);
  }
  if (REMOTE_URL && text.includes(REMOTE_URL)) {
    fail(`${where} points at the hosted remote ("${REMOTE_URL}"). ${WHY_REMOTE}`);
  }
}

/** The substitution assertion. */
function assertNeedle(text, where, expected) {
  if (!NEEDLE) return;
  const n = text.split(NEEDLE).length - 1;
  if (expected === "once" && n !== 1) {
    fail(`${where} contains "${NEEDLE}" ${n} time(s); it must appear exactly once. ` +
         (n === 0
           ? "String.replace finds nothing to substitute, so every signup is handed a placeholder."
           : "String.replace substitutes only the FIRST match, so a placeholder still ships."));
  } else if (expected === "present" && n === 0) {
    fail(`${where} does not carry "${NEEDLE}" — the issued key has nothing to replace.`);
  }
}

if (process.argv[2] !== "dist") {
  // ── Source mode ─────────────────────────────────────────────────────────
  const hero = exported("HERO_INSTALL");
  if (typeof hero === "string") {
    assertNeedle(hero, "HERO_INSTALL", "once");
    assertRouting(hero, "HERO_INSTALL");
  }
} else {
  // ── Rendered mode ───────────────────────────────────────────────────────
  const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

  const index = read("dist/index.html");
  if (!index) {
    fail("dist/index.html not found — nothing to check.");
  } else {
    // Scoped to the hero block on purpose: the Install section legitimately
    // names the remote's URL under its caveat, and that must keep working.
    const block = index.match(/<pre id="hero-install">([\s\S]*?)<\/pre>/);
    if (!block) {
      fail('dist/index.html: no <pre id="hero-install"> block — the hero install command did ' +
           "not render, or its id changed (signup.astro's substitution is keyed to this command).");
    } else {
      assertNeedle(block[1], "dist/index.html hero block", "once");
      assertRouting(block[1], "dist/index.html hero block");
    }
  }

  const signup = read("dist/signup/index.html");
  if (!signup) {
    fail("dist/signup/index.html not found — nothing to check.");
  } else {
    assertNeedle(signup, "dist/signup/index.html", "present");
    assertRouting(signup, "dist/signup/index.html");
  }
}

if (fails.length) {
  console.error("\n✗ Signup install-command check FAILED — every break here is silent: the page still renders.\n");
  for (const f of fails) console.error(`  • ${f}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ Signup install-command check passed (${process.argv[2] === "dist" ? "dist" : "src"}).`
);
