/**
 * Install + prompt strings for the landing page.
 *
 * Every command here is traced to a source. Do NOT edit a command to "look
 * nicer" — a string that isn't confirmed by source does not ship.
 *
 * Sources (verified 2026-06-15):
 *  - budgetary-clients docs/installation.md   → Claude Code plugin flow, VS Code, Codex status
 *  - budgetary-clients docs/api-contract.md    → key prefixes, /v1/estimate, scenarios, void
 *  - MCP registry io.github.thriftell/budgetary v0.1.1 → @budgetary/mcp (stdio),
 *      env BUDGETARY_API_KEY. That entry also carried the hosted streamable-http
 *      remote https://api.budgetary.tools/mcp; the listing has since WITHDRAWN
 *      it, and this file follows — see the routing note below.
 *
 * Host config formats (verified 2026-08-09 against each host's official docs):
 *  - Cursor   https://cursor.com/docs/context/mcp        → .cursor/mcp.json, top-level
 *      "mcpServers", per-server command / args / env
 *  - Codex    https://developers.openai.com/codex/mcp    → ~/.codex/config.toml,
 *      [mcp_servers.<id>] table, command / args, env as an [mcp_servers.<id>.env] sub-table
 *
 * Which install path can be measured (0020g, verified 2026-08-18 against the
 * published @budgetary/mcp README — clients/mcp/README.md in
 * thriftell/budgetary-clients, §"Claude Code" and §"The remote endpoint"):
 *  - The stdio package is the path that can be measured: it runs a local process,
 *    so it has a pending store and a real transcript to read.
 *  - The hosted streamable-http remote ESTIMATES ONLY. No local process — no
 *    pending store, no session-end hook, no transcript — so an estimate made
 *    through it is never closed out by an actual, by any route. The registry
 *    listing no longer advertises it; it is hand-configured or nothing.
 *  - `claude mcp add … -- npx -y @budgetary/mcp` wires the ESTIMATE TOOL ONLY.
 *    The session-end hook that submits actuals comes with the Claude Code
 *    PLUGIN — or is wired by hand in the host's own settings, which `doctor`
 *    prints on request. Two rules follow, and they bind in both directions: no
 *    surface here may present automatic actuals as a property of the bare
 *    `claude mcp add` command, and none may claim the plugin is the ONLY route
 *    to them. The README documents the hand-wired hook; overstating the plugin
 *    would be the same kind of false claim in the other direction.
 *  - `npx @budgetary/mcp doctor` reports whether an automatic submission has ever
 *    run on this machine; `on-session-end --transcript <file>` submits one by hand.
 */

export const API_BASE = "https://api.budgetary.tools";
export const MCP_HTTP_REMOTE = "https://api.budgetary.tools/mcp";
// The caveat lives next to the URL it qualifies so a later edit cannot carry one
// without the other. Sourced from the published @budgetary/mcp README, §"The
// remote endpoint (hand-configured only)".
export const MCP_HTTP_REMOTE_CAVEAT =
  "It estimates only. There is no local process on that path — no pending store, no session-end hook, no transcript to read — so a run estimated through it is never closed out by an actual, by any route. Hand-configure it or not at all: the registry listing no longer advertises it, because a listing entry carries a URL and nothing else.";
export const MCP_PACKAGE = "@budgetary/mcp";
export const CLIENTS_REPO = "https://github.com/thriftell/budgetary-clients";

// Hero one-command install — the stdio package, verbatim in shape from the
// published @budgetary/mcp README (§"Claude Code"). It is the hosted remote's
// replacement here for one reason: this path runs a local process, so a run
// estimated through it can be closed out by an actual. The remote cannot.
// BUDGETARY_HOST is deliberate: it tags the ledger entry with the host, and an
// explicit value always wins over what the server detects from the handshake.
//
// ⚠ `bg_test_YOUR_KEY` is a CONTRACT, not a sample. signup.astro does
// `heroInstall.replace("bg_test_YOUR_KEY", key)` to hand a new signup their real
// key. Alter it, remove it, or let it appear more than once and the substitution
// silently no-ops — every signup is then handed a placeholder instead of a key.
// Keep it verbatim, exactly once. scripts/check-hero-placeholder.mjs pins this.
export const HERO_INSTALL = `claude mcp add budgetary \\
  --env BUDGETARY_API_KEY=bg_test_YOUR_KEY \\
  --env BUDGETARY_HOST=claude-code \\
  -- npx -y @budgetary/mcp`;

// Claude Code plugin install — verbatim from docs/installation.md.
export const CLAUDE_PLUGIN = `/plugin marketplace add thriftell/budgetary-clients
/plugin install budgetary@budgetary
/reload-plugins`;

// MCP server for any agent (stdio). Package + env var confirmed by the registry.
export const MCP_STDIO = `npx -y @budgetary/mcp
# requires env BUDGETARY_API_KEY=bg_test_…  (free tier) or bg_live_…`;

// VS Code — the extension is published to Open VSX ONLY. Pinned from the Open
// VSX API (verified 2026-08-08): namespace "budgetary", name "budgetary-vscode",
// displayName "Budgetary". The Microsoft VS Code Marketplace listing does not
// exist (itemName budgetary.budgetary-vscode → HTTP 404), so it is not named
// here. `Budgetary: Sign In` is from docs/installation.md.
export const VSCODE_EXTENSION_ID = "budgetary.budgetary-vscode";
export const VSCODE_OPEN_VSX = "https://open-vsx.org/extension/budgetary/budgetary-vscode";
export const VSCODE_STEPS = `1. Install "Budgetary" (budgetary.budgetary-vscode) from Open VSX.
2. Run the command:  Budgetary: Sign In
3. Paste your API key (bg_test_… free, or bg_live_…) when prompted.`;

// ── Per-platform onboarding (a) + demo (b) prompts ─────────────────────────
// Onboarding prompts are deliberately transparent (Invariant 4): they state
// they add ONE MCP server, ask for the key, write no key without consent, and
// touch nothing else. An opaque paste-and-run is exactly the malicious pattern.

export const CLAUDE_CODE = {
  // Three states, not two: this host is the only one that CAN be automatic, and
  // it is automatic only with the plugin. The badge label is data (not a boolean
  // in the component) precisely so this third state can be said at all.
  actuals: "conditional" as const,
  actualsBadge: "◐ actuals: auto with the plugin",
  actualsLine:
    "Actuals: automatic with the Claude Code plugin — that is what wires the session-end hook that submits your real token counts. The command above adds the estimate tool alone: estimates work, and until that hook is in place you submit actuals yourself from the real session transcript (npx @budgetary/mcp on-session-end --transcript <file>), so you never type a number. Run npx @budgetary/mcp doctor to see whether an automatic submission has ever run on this machine — it prints the hook to add if none has.",
  onboarding: `Set up Budgetary so you give me a pre-flight token-spend estimate before large tasks.

Do exactly this, and nothing more:
1. Ask me for my Budgetary API key first (it starts with bg_test_ or bg_live_). If I don't give you one, stop and tell me — do not invent or read one from anywhere.
2. Add a single MCP server named "budgetary" from the published npm package:
   claude mcp add budgetary --env BUDGETARY_API_KEY=<the key I gave you> --env BUDGETARY_HOST=claude-code -- npx -y @budgetary/mcp
3. Then tell me, in one line: that command wires the "estimate" tool only. Automatic actuals — the session-end hook that submits what a run really cost — come with the Claude Code plugin (/plugin marketplace add thriftell/budgetary-clients, then /plugin install budgetary@budgetary). Do not install it unless I ask.

This only registers one MCP server (it exposes an "estimate" tool). It does not edit my code, read my repository, or install anything else. Do not write the key to any other file or commit it.`,
  demo: `Before you start, call the Budgetary "estimate" tool on this task and show me what it returns — the token range, the scenario, and the confidence — then wait for my go-ahead:

  "Refactor the auth middleware to use async sessions and update the tests."

If Budgetary returns a "no read" (it can't confidently estimate this one), just tell me that plainly. Don't guess a number.`,
};

export const CURSOR = {
  actuals: "manual" as const,
  actualsBadge: "○ actuals: estimate-only",
  actualsLine:
    "Actuals: estimate-only. Cursor gets the pre-flight estimate; it does not auto-report real usage back — so there's no realized number to show, and none is fabricated.",
  // Verified 2026-08-09 against Cursor's official MCP doc
  // (https://cursor.com/docs/context/mcp): project config lives at `.cursor/mcp.json`,
  // the top-level key is `mcpServers`, and a stdio server entry carries
  // `command` / `args` / `env`. Package + env var are registry-confirmed.
  onboarding: `Create a file at .cursor/mcp.json in this project with exactly the JSON below, then tell me to reload MCP servers in Cursor's settings.

Ask me for my Budgetary API key first (bg_test_ or bg_live_ prefix) and drop it into the BUDGETARY_API_KEY field. Do not store it anywhere else, and do not commit this file. This adds one MCP server (the "estimate" tool) and changes nothing else.

{
  "mcpServers": {
    "budgetary": {
      "command": "npx",
      "args": ["-y", "@budgetary/mcp"],
      "env": { "BUDGETARY_API_KEY": "bg_test_YOUR_KEY" }
    }
  }
}`,
  demo: `Use the Budgetary "estimate" tool to give me a pre-flight token-spend estimate for this task before writing any code — show the range, scenario, and confidence:

  "Add optimistic-locking retries to the order-update endpoint."

If Budgetary says it can't confidently estimate this one ("no read"), tell me that — don't make up a number.`,
};

export const CODEX = {
  actuals: "manual" as const,
  actualsBadge: "○ actuals: estimate-only",
  actualsLine:
    "Actuals: estimate-only / manual. Codex exposes no session-end event, so realized spend is never auto-captured — and never invented.",
  // Verified 2026-08-09 against Codex's official MCP doc
  // (https://developers.openai.com/codex/mcp): config lives at `~/.codex/config.toml`,
  // one `[mcp_servers.<id>]` table per server with `command` / `args`, and env vars
  // in an `[mcp_servers.<id>.env]` sub-table — the form the doc's worked example
  // uses. Package + env var are registry-confirmed.
  onboarding: `Add Budgetary as an MCP server in my Codex config (~/.codex/config.toml) by appending exactly the block below.

Ask me for my Budgetary API key first (bg_test_ or bg_live_ prefix) and put it in the BUDGETARY_API_KEY value. Do not store it anywhere else or echo it back. This registers one MCP server (the "estimate" tool) and changes nothing else in my config.

[mcp_servers.budgetary]
command = "npx"
args = ["-y", "@budgetary/mcp"]

[mcp_servers.budgetary.env]
BUDGETARY_API_KEY = "bg_test_YOUR_KEY"`,
  demo: `Call the Budgetary "estimate" tool for a pre-flight token-spend estimate on this task, and show me the range, scenario, and confidence before you do anything:

  "Migrate the config loader from JSON to TOML and keep backward compatibility."

If Budgetary returns a "no read" for this one, say so plainly instead of guessing.`,
};
