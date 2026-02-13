import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { syncToCursor } from "../src/sync/cursor"
import type { ClaudeHomeConfig } from "../src/parsers/claude-home"

describe("syncToCursor", () => {
  test("symlinks skills and writes mcp.json", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sync-cursor-"))
    const fixtureSkillDir = path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one")

    const config: ClaudeHomeConfig = {
      skills: [
        {
          name: "skill-one",
          sourceDir: fixtureSkillDir,
          skillPath: path.join(fixtureSkillDir, "SKILL.md"),
        },
      ],
      mcpServers: {
        context7: { url: "https://mcp.context7.com/mcp" },
        local: { command: "echo", args: ["hello"], env: { FOO: "bar" } },
      },
    }

    await syncToCursor(config, tempRoot)

    // Check skill symlink
    const linkedSkillPath = path.join(tempRoot, "skills", "skill-one")
    const linkedStat = await fs.lstat(linkedSkillPath)
    expect(linkedStat.isSymbolicLink()).toBe(true)

    // Check mcp.json
    const mcpPath = path.join(tempRoot, "mcp.json")
    const mcpConfig = JSON.parse(await fs.readFile(mcpPath, "utf8")) as {
      mcpServers: Record<string, { url?: string; command?: string; args?: string[]; env?: Record<string, string> }>
    }

    expect(mcpConfig.mcpServers.context7?.url).toBe("https://mcp.context7.com/mcp")
    expect(mcpConfig.mcpServers.local?.command).toBe("echo")
    expect(mcpConfig.mcpServers.local?.args).toEqual(["hello"])
    expect(mcpConfig.mcpServers.local?.env).toEqual({ FOO: "bar" })
  })

  test("merges existing mcp.json", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sync-cursor-merge-"))
    const mcpPath = path.join(tempRoot, "mcp.json")

    await fs.writeFile(
      mcpPath,
      JSON.stringify({ mcpServers: { existing: { command: "node", args: ["server.js"] } } }, null, 2),
    )

    const config: ClaudeHomeConfig = {
      skills: [],
      mcpServers: {
        context7: { url: "https://mcp.context7.com/mcp" },
      },
    }

    await syncToCursor(config, tempRoot)

    const merged = JSON.parse(await fs.readFile(mcpPath, "utf8")) as {
      mcpServers: Record<string, { command?: string; url?: string }>
    }

    expect(merged.mcpServers.existing?.command).toBe("node")
    expect(merged.mcpServers.context7?.url).toBe("https://mcp.context7.com/mcp")
  })

  test("does not write mcp.json when no MCP servers", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sync-cursor-nomcp-"))
    const fixtureSkillDir = path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one")

    const config: ClaudeHomeConfig = {
      skills: [
        {
          name: "skill-one",
          sourceDir: fixtureSkillDir,
          skillPath: path.join(fixtureSkillDir, "SKILL.md"),
        },
      ],
      mcpServers: {},
    }

    await syncToCursor(config, tempRoot)

    const mcpExists = await fs.access(path.join(tempRoot, "mcp.json")).then(() => true).catch(() => false)
    expect(mcpExists).toBe(false)
  })
})
