---
status: pending
priority: p2
issue_id: "001"
tags: [code-review, typescript, types]
dependencies: []
---

# Extract GeminiMcpServer as named type

## Problem Statement
The `GeminiBundle` inlines the MCP server type definition, and the converter uses `NonNullable<GeminiBundle["mcpServers"]>[string]` which is hard to read. Other targets (Cursor) define a named type.

## Findings
- `src/types/gemini.ts` lines 20-26: inline type in GeminiBundle
- `src/converters/claude-to-gemini.ts` line 117: `NonNullable<GeminiBundle["mcpServers"]>[string]`

## Proposed Solution
Extract a named `GeminiMcpServer` type in `src/types/gemini.ts` and use it in both the bundle type and converter.

## Acceptance Criteria
- [ ] `GeminiMcpServer` type exists in `src/types/gemini.ts`
- [ ] `GeminiBundle.mcpServers` uses `Record<string, GeminiMcpServer>`
- [ ] Converter uses `GeminiMcpServer` instead of indexed access type
- [ ] Tests still pass
