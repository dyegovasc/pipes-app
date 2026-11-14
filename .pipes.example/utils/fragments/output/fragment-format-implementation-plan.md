---
title: Format Implementation Plan
description: Formats framing, codebase evidence, solution design, implementation work, tests, and risks into an executable Markdown plan.
version: 2.5
fragment_type: output
domain: codebase
---
# Fragment: Format Implementation Plan

## Format

Produce one complete plan preview that another capable implementer can execute without reopening material product or architecture choices. The plan may be approved in conversation or written to `.pipes/project/04-plans/plan-{number}-{slug}.md` after the exact content and target are approved.

Keep the plan title in frontmatter only; begin the body with `## Outcome`.

Serialize `related` as a YAML list: use `related: []` when no files apply; otherwise use unique, readable project-relative paths. A plan that implements a spec lists the spec path in `related`, and the spec lists the plan in return.

When the plan implements a spec, fill `## Spec Traceability` with every requirement ID the plan covers and cite only IDs that exist in the related spec. Course plan sections map to this template as follows: Files that change is `### Impacted Files`, Order of work is `## Implementation`, Risks is `## Risks And Preconditions`, and Proof is `## Test Strategy` together with `## Acceptance Criteria`. When implementation diverges from the approved plan, update the plan in the same commit as the divergent change.

## Template

```markdown
---
title: {plan title}
description: {one-line outcome}
version: 1.0
created: {YYYY-MM-DD}
status: draft
related: []
---
## Outcome

{Desired user-visible or system result.}

## Users And Requirements

Users:
- {Affected user or consumer.}

Requirements:
- {Functional or non-functional requirement, prefixed with its spec R-ID when a spec exists.}

## Spec Traceability

Spec: `{.pipes/project/02-specs/spec file, or Not applicable}`

| Requirement | Implementing steps | Proof |
| --- | --- | --- |
| R1 | {step numbers} | {test, check, or evidence that proves it} |

Deferred requirements: {R-IDs deferred to another plan with reason, or none}

## Scope

In scope:
- {Included behavior or surface.}

Out of scope:
- {Excluded or deferred work.}

Protected constraints:
- {Surface or action requiring special care or approval.}

## Context Evidence

- Stack and architecture: {established context with source paths.}
- Existing patterns: {patterns the implementation should reuse.}
- Relevant files and boundaries: {current paths and ownership boundaries.}
- Dependencies and integrations: {internal or external dependencies.}
- Blast radius: {low, medium, or high with rationale.}

## Recommended Approach

### Selected Solution

{Approach and how it satisfies the requirements.}

### Rationale

{Why this approach best fits current evidence, constraints, and risk.}

### Alternatives Considered

| Alternative | Advantages | Why Not Selected |
| --- | --- | --- |
| {Alternative} | {Benefits} | {Trade-off or evidence against it} |

## Solution Architecture

### Components And Interactions

{Components, responsibilities, and interaction boundaries.}

### Data Flow

1. {How data or control enters, changes, and exits the system.}

### Impacted Files

| Path | Action | Planned Change |
| --- | --- | --- |
| `{path}` | create, modify, or delete | {Expected change.} |

### Contracts And Deviations

- New or changed contract: {interface, schema, event, route, or none.}
- Pattern deviation: {deviation, rationale, and consequence, or none.}

## Implementation

1. **{Step title}**
   - Files: `{path}`
   - Depends on: {prior step or none}
   - Work: {specific bounded change}
   - Expected result: {observable intermediate outcome}
   - Validation: {check proving this step worked}

## Test Strategy

- Unit: {modules and cases.}
- Integration: {boundaries and interactions.}
- End to end: {user flows or not applicable.}
- Regression: {existing behavior and suites to protect.}
- Edge cases and test data: {cases, fixtures, mocks, or seeds.}

## Risks And Preconditions

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| {Risk} | low, medium, or high | low, medium, or high | {Mitigation} |

Execution Preconditions:
- {Verified input, dependency, target, or acceptance criterion needed before execution.}

Blockers:
- {Blocking dependency or none identified.}

Reversibility:
- {Rollback or migration implications.}

## Acceptance Criteria

- [ ] {Observable criterion.}

## Deferred Work And Handoff

- Deferred: {Explicit later work or none.}
- Protected actions: {Approval needed during execution or none.}
- Execution readiness: {All preconditions verified; no unresolved caveat.}
```

Populate every section from verified phase outputs. Use `None identified` or `Not applicable` instead of leaving a section ambiguous. Cite concise file paths for codebase claims, use only the frontmatter fields allowed by the plans area config, and do not write the file from this fragment. Do not present a plan for execution until every input, dependency, target, and acceptance criterion is verified and no unresolved caveat remains.
