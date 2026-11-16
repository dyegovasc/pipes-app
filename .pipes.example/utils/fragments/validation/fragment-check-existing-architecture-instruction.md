---
title: Check Existing Architecture Instruction
description: Determines whether the canonical architecture instruction is missing, placeholder, or established and identifies safe create or update boundaries.
version: 1.2
fragment_type: validation
domain: codebase
---
# Fragment: Check Existing Architecture Instruction

## Checks

- [ ] Resolve `execution_context` before selecting targets: `installed_project` uses `.pipes/ai-instructions/architecture.md`, while `starter_maintenance` edits `ai-instructions/architecture.md` in the starter source tree first and reconciles its `.pipes/` mirror only after staged validation
- [ ] Reject a staging target for an installed-project invocation merely because a sibling staging tree exists
- [ ] Read and classify every applicable target as `missing`, `placeholder`, or `established`
- [ ] When established, extract current version, evidence references, accepted commitments, and sections that cannot change silently
- [ ] Compare architecture content with `project.md`, decisions, and repository evidence while keeping identity, stack summary, and conventions in their owners
- [ ] Identify configured instruction wrappers and generator context required after an approved write
- [ ] Report target conflicts, staged/installed drift, or contradictory evidence without modifying a source or wrapper

## Acceptance Criteria

- [ ] `execution_context` is `installed_project` or `starter_maintenance`
- [ ] `architecture_mode` is `create` or `update`
- [ ] Existing commitments and preservation constraints are explicit
- [ ] Primary target, optional installed mirror, and wrapper effects are unambiguous
- [ ] No file has been modified during discovery
