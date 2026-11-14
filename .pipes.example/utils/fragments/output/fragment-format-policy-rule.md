---
title: Format Policy Rule
description: Formats a project policy rule that agents load as a skill and that cites the repositories it comes from.
version: 1.0
fragment_type: output
domain: codebase
---
# Fragment: Format Policy Rule

## Format

Produce `.pipes/utils/rules/rule-{slug}.md` for one policy topic. A policy rule belongs to the project layer (`scope: project`), so it never ships in a starter kit. `skill: true` and `skill_description` make `assemble-rule-skills.cjs` generate a `pipes.policy-{slug}` skill that points to the rule; write the description as a trigger that names the tasks the policy applies to. Declare how the rule is enforced in `enforced_by`; use `model` unless a hook, CI check, or managed setting enforces it. Include only consistent rules; keep conflicts out and name the note that lists them.

## Template

```markdown
---
title: {Policy Title}
description: {one sentence on what the policy protects}
version: 1.0
rule_type: {governance or safety}
scope: project
applies_to:
  - implementation
  - tests
  - records
enforcement: binding
enforced_by: [model]
skill: true
skill_description: {Policy name} for {project} services. Use when a spec, plan, or change {touches the topics this policy covers}.
gate_relevance:
  evaluates_gates: true
  required_for_gate_types:
    - delegated_approval
    - human_mandatory
---
## Requirement

{one paragraph: the policy in plain terms}

## Enforcement

`binding`. {what enforces it today}

## Checks

- {one concrete, testable rule}

## Sources

{repository file paths that state these rules}. Conflicts and gaps for this topic are listed in `{conflicts note path}` and are not part of this rule.
```
