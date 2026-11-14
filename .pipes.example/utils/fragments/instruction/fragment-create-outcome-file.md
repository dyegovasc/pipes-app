---
title: Create Outcome File
description: Writes an approved factual outcome for a mission or plan.
version: 2.6
fragment_type: instruction
domain: project
---
# Fragment: Create Outcome File

## Instructions

1. Confirm the exact outcome content and write are approved or explicitly included in the user's request.
2. Read `.pipes/project/06-outcomes/config.md`.
3. When closing a recorded mission or plan, inspect its existing `related` paths and every outcome record that relates back to it; reuse exactly one matching outcome when it is validated and already represents this closure, choose the next available `outcome-{number}-{slug}.md` filename only when no match exists, and stop on multiple or contradictory matches.
4. Validate related paths, result, factual summary, evidence, deviations, residual risk, and follow-up.
5. When the outcome closes a mission or plan, include that source record in the outcome `related` list and include the reciprocal source-record relationship in the approval package. When any outcome is created under active mission execution, also include the invoking mission and its reciprocal `related` effect even when a plan is the closure source. A direct agent-authored reciprocal edit requires that approval.
6. When Pipes Local applies an approved source-record relationship write, treat its automatic reciprocal `related` update and `.pipes/utils/state/related-sync-state.json` refresh as expected app-managed effects of the approved write and do not repeat the reciprocal edit directly. This expected synchronization does not authorize any unrelated record edit.
7. Before writing, verify `related` is a YAML list: use `[]` when no paths apply, otherwise use only unique readable project-relative paths.
8. Write and re-read the outcome, source record, and invoking mission when distinct. Verify every persisted reciprocal `related` value meets the approved bidirectional contract and that exactly one outcome closes the source before terminal closure; refuse completion when expected app-managed synchronization cannot be verified.
9. For a recorded plan, return the validated outcome as the precondition for its separate `active` to `done` lifecycle transition. For inline plan content, return `not_applicable` and do not invent an outcome target.

## Output

- Outcome path
- Config and evidence validation
- Reused outcome or new outcome result
- Approved direct relationship writes and expected Pipes Local synchronization effects
