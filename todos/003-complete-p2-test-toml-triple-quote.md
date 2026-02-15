---
status: pending
priority: p2
issue_id: "003"
tags: [code-review, testing, security]
dependencies: []
---

# Add test for TOML triple-quote escaping in prompt

## Problem Statement
The `toToml` function escapes `"""` in prompts, but there is no test verifying this works correctly. This is a potential TOML injection vector.

## Findings
- `src/converters/claude-to-gemini.ts` line 150: `prompt.replace(/"""/g, '\\"\\"\\"')`
- `tests/gemini-converter.test.ts`: no triple-quote test in `toToml` describe block

## Proposed Solution
Add a test in the `toToml` describe block that passes a prompt containing `"""` and verifies the output escapes it correctly.

## Acceptance Criteria
- [ ] Test added for prompt containing `"""`
- [ ] Escaped output does not prematurely close the TOML multi-line string
- [ ] All tests pass
