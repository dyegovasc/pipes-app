---
title: Identify Fragments
description: Determines which fragments to reuse and which to create.
version: 1.1
fragment_type: instruction
domain: all
---
# Fragment: Identify Fragments

## Instructions

1. Read the complete phase outline and the current fragment catalog.
2. For each phase, identify the smallest reusable units needed for questions, context, instructions, validation, and output formatting.
3. Prefer an existing fragment when its responsibility and type contract fit; do not reuse a fragment whose workflow assumptions contradict the phase.
4. Bind each selected ID explicitly under that phase's `**Fragments:**` field and order the IDs as the phase will use them.
5. Make the pipeline frontmatter `fragments` list the exact union of phase bindings. Reject declared-but-unused and used-but-undeclared fragments.
6. A phase may use no fragment only when its complete action is safely expressed by the pipeline and creating a fragment would add no reuse value.
7. Propose a new fragment only for an atomic missing responsibility. Specify its ID, type, domain, target path, required sections, and reuse rationale.
8. Validate every reused or proposed fragment against `rule-validate-fragment-types` before the pipeline is approved.

## Output

- Phase-to-fragment mapping in execution order
- Exact frontmatter fragment union
- Reused fragments with source paths
- Proposed fragments with type, target path, and justification
- Unused, undeclared, invalid, or conflicting references that must be resolved
