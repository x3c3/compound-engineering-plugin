import { defineCommand } from "citty"
import os from "os"
import path from "path"
import { loadClaudeHome } from "../parsers/claude-home"
import { syncToOpenCode } from "../sync/opencode"
import { syncToCodex } from "../sync/codex"
import { syncToPi } from "../sync/pi"
import { syncToDroid } from "../sync/droid"
import { syncToCursor } from "../sync/cursor"
import { expandHome } from "../utils/resolve-home"

const validTargets = ["opencode", "codex", "pi", "droid", "cursor"] as const
type SyncTarget = (typeof validTargets)[number]

function isValidTarget(value: string): value is SyncTarget {
  return (validTargets as readonly string[]).includes(value)
}

/** Check if any MCP servers have env vars that might contain secrets */
function hasPotentialSecrets(mcpServers: Record<string, unknown>): boolean {
  const sensitivePatterns = /key|token|secret|password|credential|api_key/i
  for (const server of Object.values(mcpServers)) {
    const env = (server as { env?: Record<string, string> }).env
    if (env) {
      for (const key of Object.keys(env)) {
        if (sensitivePatterns.test(key)) return true
      }
    }
  }
  return false
}

function resolveOutputRoot(target: SyncTarget): string {
  switch (target) {
    case "opencode":
      return path.join(os.homedir(), ".config", "opencode")
    case "codex":
      return path.join(os.homedir(), ".codex")
    case "pi":
      return path.join(os.homedir(), ".pi", "agent")
    case "droid":
      return path.join(os.homedir(), ".factory")
    case "cursor":
      return path.join(process.cwd(), ".cursor")
  }
}

export default defineCommand({
  meta: {
    name: "sync",
    description: "Sync Claude Code config (~/.claude/) to OpenCode, Codex, Pi, Droid, or Cursor",
  },
  args: {
    target: {
      type: "string",
      required: true,
      description: "Target: opencode | codex | pi | droid | cursor",
    },
    claudeHome: {
      type: "string",
      alias: "claude-home",
      description: "Path to Claude home (default: ~/.claude)",
    },
  },
  async run({ args }) {
    if (!isValidTarget(args.target)) {
      throw new Error(`Unknown target: ${args.target}. Use one of: ${validTargets.join(", ")}`)
    }

    const claudeHome = expandHome(args.claudeHome ?? path.join(os.homedir(), ".claude"))
    const config = await loadClaudeHome(claudeHome)

    // Warn about potential secrets in MCP env vars
    if (hasPotentialSecrets(config.mcpServers)) {
      console.warn(
        "⚠️  Warning: MCP servers contain env vars that may include secrets (API keys, tokens).\n" +
        "   These will be copied to the target config. Review before sharing the config file.",
      )
    }

    console.log(
      `Syncing ${config.skills.length} skills, ${Object.keys(config.mcpServers).length} MCP servers...`,
    )

    const outputRoot = resolveOutputRoot(args.target)

    switch (args.target) {
      case "opencode":
        await syncToOpenCode(config, outputRoot)
        break
      case "codex":
        await syncToCodex(config, outputRoot)
        break
      case "pi":
        await syncToPi(config, outputRoot)
        break
      case "droid":
        await syncToDroid(config, outputRoot)
        break
      case "cursor":
        await syncToCursor(config, outputRoot)
        break
    }

    console.log(`✓ Synced to ${args.target}: ${outputRoot}`)
  },
})
