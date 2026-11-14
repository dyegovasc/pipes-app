---
title: Define Loop Contract
description: Converts a distinct adaptive mission class into a readable Pipes loop.
version: 2.2
fragment_type: instruction
domain: all
---
# Fragment: Define Loop Contract

## Instructions

1. Confirm adaptive action selection is genuinely required; otherwise create a pipeline.
2. Define concise frontmatter with title, description, version, domain, type, status, roles, fragments, pipelines, and rules.
3. Write the mission class, operating envelope, roles, adaptive cycle, Mission Integration, available pipelines, validation, stop conditions, and mission prompt.
4. Bind each cycle phase to atomic fragments without copying those fragments into the loop.
5. In Mission Integration, state when a durable mission is useful, that `loop` is the one mission-to-loop reference, how Current State is refreshed, and when the loop may run without a mission.
6. Require recorded terminal missions to use `fragment-capture-execution-outcome`, `fragment-format-outcome-record`, and `fragment-create-outcome-file` after validation and reflection but before `done`; check for an existing related outcome first, require one approved closure package, validate both links, keep `active` and `blocked` resumable, and exclude lightweight runs without a mission.
7. Declare the shared non-terminal mission phases `framed`, `observing`, `understanding`, `choosing`, `acting`, `validating`, `reflecting`, and `updating`, then list any permitted specialized phase or state `none`.
8. Make the loop continue until completion, a genuine user decision, a blocker, or a protected action.
9. Keep orchestration in Markdown; do not introduce an executable runner.

## Output

- Complete `loop-{id}.md` proposal
- Referenced fragments, pipelines, rules, and roles
- Generated-surface impact
