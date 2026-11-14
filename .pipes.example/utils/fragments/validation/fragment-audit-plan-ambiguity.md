---
title: Audit Plan Ambiguity
description: Classifies whether a generated implementation plan is clear or blocking by auditing execution ambiguity.
version: 1.5
fragment_type: validation
domain: codebase
---
# Fragment: Audit Plan Ambiguity

Classifies whether a generated implementation plan is clear or blocking by auditing unresolved ambiguity in scope, contracts, and execution handoff.

Accept either a plan file path or the exact approved plan content. A conversation-only handoff is a persistence limitation, not automatically an ambiguity in the implementation design.

## Checks

### Scope Clarity
- [ ] In-scope and out-of-scope boundaries are explicit
- [ ] The plan does not blur the current slice with other missions, intents, or deferred slices
- [ ] Deferred work is clearly named rather than implied

### Contract Clarity
- [ ] New abstractions and contract names are explicit
- [ ] Existing contracts to reuse are clearly identified
- [ ] Route, data, and ownership boundaries are understandable to downstream implementers

### Execution Preconditions
- [ ] Inputs, dependencies, targets, and acceptance criteria are verified
- [ ] Risks are mitigated or explicitly block execution
- [ ] No unresolved caveat remains in the plan

### Handoff Readiness
- [ ] Implementation steps are actionable without reopening core design decisions
- [ ] Acceptance criteria are testable
- [ ] Downstream implementers can identify what must be validated during execution
- [ ] Conversation-only handoffs identify the exact approved content and validation limitations without pretending a durable record exists

## Decision Tree

```
Does the plan contain unresolved ambiguity?
    ├─ NO  → Classify as clear
    └─ YES → Classify as blocking
```

## Output

- `ambiguity_status`: `clear` | `blocking`
- `ambiguity_findings`: list of ambiguous areas with classification and explanation
- `precondition_checks`: verified execution inputs, dependencies, targets, and acceptance criteria
- `blocking_ambiguities`: list of ambiguities serious enough to stop implementation
- `validated_input`: `file` | `supplied_content`

## Acceptance Criteria

- [ ] The plan's ambiguity status is explicitly classified
- [ ] Remaining ambiguity is separated from contradiction findings
- [ ] Every unresolved ambiguity blocks execution handoff
- [ ] Blocking ambiguity is surfaced clearly before execution begins

## Failure Handling

1. Record every ambiguous area with its classification.
2. Promote ambiguity to `blocking` when it would reopen a core design or scope decision during implementation.
3. Return the plan for correction before implementation when any ambiguity remains.
