---
name: coding-workflow
description: "Use for implementing, debugging, or reviewing changes in an existing codebase. Localize the owning code path, form a falsifiable hypothesis, make the smallest testable change, validate immediately, and report risks and remaining gaps."
argument-hint: "Describe the bug, feature, or review target and any known failing check."
user-invocable: true
disable-model-invocation: false
---

# Focused Coding Workflow

## When to Use

Use this skill for a concrete change, bug investigation, or code review in an existing repository. It is especially useful when the request names a file, symbol, failing behavior, test, or command.

Do not use it for greenfield project scaffolding, broad architecture discovery, or a one-line factual answer.

## Procedure

1. **Identify the anchor.** Start from the most concrete available signal: a named file, symbol, failing command, test, or nearby implementation. Search narrowly and prefer the nearest code that directly computes, mutates, or controls the requested behavior.
2. **Check local constraints.** Read the relevant repository instructions and the smallest useful slice of neighboring code, tests, and call sites. Preserve unrelated user changes and established APIs.
3. **State a hypothesis.** Before editing, name one falsifiable explanation for the behavior and one cheap check that could disconfirm it. If the evidence is insufficient, take one nearby read to resolve the controlling boundary, then act.
4. **Choose the smallest edit.** Make a focused, reversible change at the owning abstraction. Follow local patterns, avoid unrelated cleanup, and add or update a focused test when the behavior warrants it.
5. **Validate immediately.** After the first substantive edit, run the narrowest executable check that can falsify the hypothesis: a behavior test, focused test file, targeted typecheck, lint, or build. Do not broaden exploration before this check unless a concrete blocker prevents it.
6. **Repair locally.** If validation fails and supports the hypothesis, fix that same slice and rerun the same check. If it falsifies the hypothesis, move one nearby hop toward the code that actually controls the behavior. Avoid reopening broad exploration.
7. **Complete adjacent work.** Make only follow-up edits required by the focused result, rerunning focused validation after each meaningful slice. Then run the repository’s appropriate broader check when available.
8. **Review the result.** Inspect the final diff, confirm no unrelated files were changed, and check for new diagnostics. For reviews, report findings first in severity order with file links, then assumptions, test gaps, and summary.
9. **Hand off clearly.** State what changed, the validations that passed or failed, and any residual risk or blocked step. Do not claim checks were run when they were not.

## Decision Rules

- If the request is ambiguous but a safe local interpretation is available, make that focused change and state the assumption.
- If multiple paths look plausible, choose the one with the strongest falsifiable hypothesis and cheapest discriminating check.
- If no executable validation exists, use the narrowest available static check and then inspect the diff.
- If unrelated worktree changes exist, work around them; never reset or overwrite them.
- Stop expanding scope when the requested behavior is implemented and the relevant checks pass.

## Completion Criteria

The task is complete when:

- The owning behavior has been changed at the smallest appropriate surface.
- A focused executable validation has been run after editing, when available.
- Relevant diagnostics and broader checks have been considered.
- The final diff contains no accidental unrelated changes.
- The handoff names validation results and remaining limitations.
