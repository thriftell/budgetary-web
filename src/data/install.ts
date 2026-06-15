/**
 * Install + prompt strings for the landing page.
 *
 * Every command here is traced to a source. Do NOT edit a command to "look
 * nicer" — if a string isn't confirmed by source, it carries a TODO(verify)
 * note and is flagged in the PR's "Deviations from spec" section.
 *
 * Sources (verified 2026-06-15):
 *  - budgetary-clients docs/installation.md   → Claude Code plugin flow, VS Code, Codex status
 *  - budgetary-clients docs/api-contract.md    → key prefixes, /v1/estimate, scenarios, void
 *  - MCP registry io.github.thriftell/budgetary v0.1.1 → @budgetary/mcp (stdio),
 *      hosted streamable-http remote https://api.budgetary.tools/mcp, env BUDGETARY_API_KEY
 */

export const API_BASE = "https://api.budgetary.tools";
export const MCP_HTTP_REMOTE = "https://api.budgetary.tools/mcp";
export const MCP_PACKAGE = "@budgetary/mcp";
export const CLIENTS_REPO = "https://github.com/thriftell/budgetary-clients";
export const DRYRUNS = "https://dryruns.tools";

// Hero one-command install. Hosted MCP via the Claude Code CLI: the remote URL
// and key prefix are registry-confirmed; the `claude mcp add --transport http`
// wrapper is standard Claude Code CLI syntax.
export const HERO_INSTALL =
  'claude mcp add --transport http budgetary https://api.budgetary.tools/mcp \\\n  --header "Authorization: Bearer bg_test_YOUR_KEY"';

// Claude Code plugin install — verbatim from docs/installation.md.
export const CLAUDE_PLUGIN = `/plugin marketplace add thriftell/budgetary-clients
/plugin install budgetary@budgetary
/reload-plugins`;

// MCP server for any agent (stdio). Package + env var confirmed by the registry.
export const MCP_STDIO = `npx -y @budgetary/mcp
# requires env BUDGETARY_API_KEY=bg_test_…  (free tier) or bg_live_…`;

// VS Code — method confirmed by docs/installation.md ("Budgetary" from the
// Marketplace or Open VSX, then run `Budgetary: Sign In`). Exact Open VSX
// extension id (@budgetary/vscode) is not pinned in source → TODO(verify).
export const VSCODE_STEPS = `1. Install "Budgetary" from the VS Code Marketplace or Open VSX.
2. Run the command:  Budgetary: Sign In
3. Paste your API key (bg_test_… free, or bg_live_…) when prompted.`;

// ── Per-platform onboarding (a) + demo (b) prompts ─────────────────────────
// Onboarding prompts are deliberately transparent (Invariant 4): they state
// they add ONE MCP server, ask for the key, write no key without consent, and
// touch nothing else. An opaque paste-and-run is exactly the malicious pattern.

export const CLAUDE_CODE = {
  actuals: "auto" as const,
  actualsLine:
    "Actuals: automatic. Once installed, Claude Code captures your real session token usage and lines it up against the estimate.",
  onboarding: `Set up Budgetary so you give me a pre-flight token-spend estimate before large tasks.

Do exactly this, and nothing more:
1. Ask me for my Budgetary API key first (it starts with bg_test_ or bg_live_). If I don't give you one, stop and tell me — do not invent or read one from anywhere.
2. Add a single MCP server named "budgetary" pointing at the hosted API:
   claude mcp add --transport http budgetary https://api.budgetary.tools/mcp --header "Authorization: Bearer <the key I gave you>"

This only registers one MCP server (it exposes an "estimate" tool). It does not edit my code, read my repository, or install anything else. Do not write the key to any other file or commit it.`,
  demo: `Before you start, call the Budgetary "estimate" tool on this task and show me what it returns — the token range, the scenario, and the confidence — then wait for my go-ahead:

  "Refactor the auth middleware to use async sessions and update the tests."

If Budgetary returns a "no read" (it can't confidently estimate this one), just tell me that plainly. Don't guess a number.`,
};

export const CURSOR = {
  actuals: "manual" as const,
  actualsLine:
    "Actuals: estimate-only. Cursor gets the pre-flight estimate; it does not auto-report real usage back — so there's no realized number to show, and none is fabricated.",
  // TODO(verify): no Budgetary-authored Cursor doc exists yet. This .cursor/mcp.json
  // is derived from the registry stdio package (@budgetary/mcp) + Cursor's standard
  // MCP config format. Confirm against an official Cursor setup doc before launch.
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
  actualsLine:
    "Actuals: estimate-only / manual. Codex exposes no session-end event, so realized spend is never auto-captured — and never invented.",
  // TODO(verify): docs/installation.md says the Codex client install "will land
  // alongside the first published Codex release." This [mcp_servers] block is
  // derived from the registry stdio package + Codex's documented config.toml
  // schema. Confirm against the official Codex release before launch.
  onboarding: `Add Budgetary as an MCP server in my Codex config (~/.codex/config.toml) by appending exactly the block below.

Ask me for my Budgetary API key first (bg_test_ or bg_live_ prefix) and put it in the BUDGETARY_API_KEY value. Do not store it anywhere else or echo it back. This registers one MCP server (the "estimate" tool) and changes nothing else in my config.

[mcp_servers.budgetary]
command = "npx"
args = ["-y", "@budgetary/mcp"]
env = { BUDGETARY_API_KEY = "bg_test_YOUR_KEY" }`,
  demo: `Call the Budgetary "estimate" tool for a pre-flight token-spend estimate on this task, and show me the range, scenario, and confidence before you do anything:

  "Migrate the config loader from JSON to TOML and keep backward compatibility."

If Budgetary returns a "no read" for this one, say so plainly instead of guessing.`,
};
