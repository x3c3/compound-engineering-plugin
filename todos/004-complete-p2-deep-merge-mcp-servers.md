---
status: pending
priority: p2
issue_id: "004"
tags: [code-review, security, data-loss]
dependencies: []
---

# Deep-merge mcpServers in settings.json instead of replacing

## Problem Statement
The Gemini writer replaces the entire `mcpServers` key in `settings.json`, silently destroying any existing user MCP servers. The test name says "merges" but it actually replaces.

## Findings
- `src/targets/gemini.ts` line 44: `{ ...existingSettings, mcpServers: bundle.mcpServers }`
- `tests/gemini-writer.test.ts` line 150: test name says "merges" but asserts replacement

## Proposed Solution
Deep-merge `mcpServers` entries: `{ ...existingMcp, ...bundle.mcpServers }`. Update the test to verify existing servers are preserved alongside new ones.

## Acceptance Criteria
- [ ] Existing mcpServers entries are preserved when new ones are added
- [ ] New entries with same name override existing (not merged at field level)
- [ ] Test verifies both old and new servers exist after merge
- [ ] All tests pass
