---
title: Durable Record Routing
description: Places durable information in the record type that owns it.
version: 2.5
rule_type: record
enforcement: binding
enforced_by: [model]
---
# Rule: Durable Record Routing

## Requirement

Create or update a project record only when information has lasting value, put it in the surface that owns that kind of truth, and ensure every durable project record created during active mission execution directly and reciprocally links its invoking mission before the creating phase completes.

## Checks

- Classify every output before writing it as a project record, an ordinary workspace file, or conversation-only content. An agent tool's hosted copy or a connector's copy never replaces the project record.
- Notes own sources and exploration.
- Intents, stored in `01-intents`, own one problem and its proposed outcome.
- Specs own accepted requirements (R1..Rn) and design that plans cite.
- Missions own adaptive current state and next actions.
- Plans own executable specifications and their recorded execution lifecycle.
- Decisions own lasting choices.
- Outcomes own factual closure, terminal result, and residual risk; a plan outcome and mission outcome remain distinct records.
- Artifacts own supporting files and evidence. Apply `rule-artifact-record-contract` to generated artifact naming, metadata, creation, and regeneration.
- Carry explicit source-record paths into context-bound artifact creation, including work outside missions. Creation includes the necessary reciprocal effects and verification. Do not infer missing origins.
- Link by path instead of copying the same state or inventing parallel identity systems.
- For a durable note, plan, decision, outcome, artifact, or other configured project record created under mission execution, carry the invoking mission path into the creator, include both reciprocal `related` effects in the approval package, and re-read the record and mission before reporting completion.
- Refuse or pause mission-bound record creation when the target area cannot persist a valid `related` list, relationship authority is absent, either write or target is invalid, or reciprocity cannot be verified. Pipes Local may apply the approved reciprocal write automatically, but the workflow must verify it.
- Do not invent project-record relationships for ordinary source files, framework contracts, generated discovery surfaces, configs, temporary files, or conversation-only content.
- Keep raw logs and private reasoning out of durable records.
