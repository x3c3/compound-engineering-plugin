---
status: pending
priority: p2
issue_id: "005"
tags: [code-review, error-handling]
dependencies: ["004"]
---

# Warn when existing settings.json is invalid JSON

## Problem Statement
When an existing `settings.json` cannot be parsed, the error is silently swallowed and the file is overwritten. Users get no warning that their settings were discarded.

## Findings
- `src/targets/gemini.ts` lines 37-41: empty catch block

## Proposed Solution
Add a `console.warn` in the catch block to inform the user that their existing settings.json could not be parsed and will be replaced.

## Acceptance Criteria
- [ ] `console.warn` emitted when settings.json parse fails
- [ ] File is still replaced (behavior unchanged)
- [ ] All tests pass
