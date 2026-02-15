---
status: pending
priority: p2
issue_id: "002"
tags: [code-review, testing]
dependencies: []
---

# Add test for uniqueName dedup when agent collides with skill

## Problem Statement
The `uniqueName` function handles name collisions by appending `-2`, but there is no test covering the scenario where an agent name collides with a pass-through skill name.

## Findings
- `src/converters/claude-to-gemini.ts` lines 181-193: uniqueName function
- `tests/gemini-converter.test.ts`: no dedup test

## Proposed Solution
Add a test where a plugin has both a skill named "security-reviewer" and an agent named "Security Reviewer". The generated skill should get name "security-reviewer-2".

## Acceptance Criteria
- [ ] Test added for agent/skill name collision
- [ ] Test verifies the deduped name is `security-reviewer-2`
- [ ] All tests pass
