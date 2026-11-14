---
title: Lint Feature Questions
description: Validates follow-up feature questions so agents ask only user-owned questions during early framing.
version: 1.0
fragment_type: validation
domain: codebase
---
# Fragment: Lint Feature Questions

Validates follow-up feature questions so agents ask only user-owned questions during early framing.

## Checks

### Ownership
- [ ] The question asks for product intent, priority, user value, constraints, or acceptance expectations.
- [ ] The question is not asking the user to provide facts the agent can discover from the repository.
- [ ] The question does not ask for low-level architecture before codebase context has been inspected.

### Timing
- [ ] The answer materially changes scope, success criteria, sequencing, or constraints.
- [ ] The question is needed before Phase 2 context work begins.
- [ ] The question can be deferred if it is repo-owned or implementation-owned.

### Quality
- [ ] The question is concise.
- [ ] The options, when present, are mutually exclusive and meaningful.
- [ ] The recommended option is explicit when a default is safe.

## Acceptance Criteria

- [ ] Ask only questions that pass ownership, timing, and quality checks.
- [ ] Defer repo-owned questions to the context phase.
- [ ] Record deferred questions in the framing package instead of dropping them.

## Failure Handling

1. Rewrite questions that are too broad or implementation-specific.
2. Move discoverable repo questions into the Phase 2 investigation list.
3. Ask no question if the answer would not change the next phase.
