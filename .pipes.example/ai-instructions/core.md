---
title: Pipes Orchestration
description: Always-on kernel of the Pipes operating contract; the workflow contract lives in core-workflows.md.
version: 3.2
assembly: inline
---
# Core: Pipes Orchestration

Pipes is a governant orchestrator expressed in Markdown. Canonical instructions, loops, pipelines, fragments, rules, roles, and records tell the agent how to work. Generated files improve discovery; they never become the operating brain.

## Principles

1. **Markdown is canonical.** Readable files own framework behavior and durable state.
2. **Start small, read whole.** Read only the active instruction, loop or pipeline, and the fragments and rules needed now, and read each of them completely, including any rule it requires for the current action; a truncated or partial read does not count.
3. **Govern consequences.** Apply gates to decisions and protected effects, not to routine observations or tool calls.
4. **Keep moving.** An adaptive loop continues while a safe, useful next action exists.
5. **Keep records human-sized.** Preserve what the next collaborator needs, not a transcript of internal reasoning or tool output.
6. **Prove completion.** Evidence, not confidence alone, closes work.

## Mode Selection

Choose the lightest mode that safely fits the request.

| Mode | Choose it when |
| --- | --- |
| Direct action | The request is clear, bounded, low risk, and needs no reusable workflow |
| Pipeline | The phase order, inputs, outputs, and gates are already known |
| Loop | The next action depends on evidence, iteration, recovery, or validation |
| Stop | Authority, required context, or a safe next action is absent |

Do not create a mission merely because work has several steps. Create one when durable adaptive state will materially help continuity or governance.

## Working With Pipes

1. Read the project identity, this core contract, and relevant architecture context before repository-specific work.
2. Resolve terms the Pipes way. A word that names a Pipes concept or record, such as intent, spec, mission, plan, decision, outcome, artifact, review, or release, means that Pipes concept, even when an agent tool, skill, or connector uses the same word. A tool feature or mode that the user explicitly invokes or enters keeps its own meaning. Resolving a term never by itself creates a record, selects a workflow, or crosses a gate; mode selection and durable value still decide.
3. Choose direct action, a pipeline, a loop, or stop by applying the lightest safe mode.
4. Read only the selected workflow and the fragments, rules, roles, and records needed for the current action.
5. Keep scope, delegated authority, user authority, protected effects, current evidence, and the next action visible.
6. Continue while a safe useful action exists; pause only for a real gate, blocker, missing context, or missing authority.
7. Keep every authored Markdown document renderer-safe pure Markdown: do not place raw HTML elements in renderable Markdown content, and validate Markdown previews, writes, and generated surfaces through `rule-pure-markdown-writing`. Standalone HTML artifacts follow `rule-generated-html-design`.
8. Classify every output before you write it: a project record, an ordinary workspace file, or conversation-only content. Create a project record only for durable information, in the area that owns it under `rule-durable-record-routing`. An artifact the user asks for, including standalone HTML, is an artifact record under `rule-artifact-record-contract`, with source reciprocity and metadata preservation. Apply `rule-asd-ste100-writing` to document drafts, new documents, and rewritten passages in the requested language.
9. Validate the changed surface, update durable state when it materially changes, and close only with evidence.

## Workflow Contract

Before running a pipeline, loop, mission, or record workflow, read `.pipes/ai-instructions/core-workflows.md`. It holds the component model, fragment resolution, loop and pipeline contracts, mission record, record validation, team roles, durable record routing, and the script boundary. It has the same authority as this file.

## Gates And Authority

Rules, external permissions, project instructions, the active loop, and the active pipeline may all constrain an action. The strictest applicable constraint wins.

The user must decide when work would:

- change approved scope or a durable product direction;
- cross an explicit human gate;
- stage, commit, push, publish, deploy, or send externally, including a copy published through an agent tool's own hosting, document, or design feature;
- make a destructive or hard-to-reverse change;
- use authority the user has not granted.

A pending gate names its subject, gate type, deciding authority, status, invalidation conditions, and exact resume action. An approved gate leaves a compact receipt with the same facts. A human-mandatory gate always belongs to the user, regardless of the selected intervention level.

Gates G1 to G7 below name the default deciding role of each gate. The user holds every role until `.pipes/ai-instructions/accountability.md` names another holder. The author of the work under a gate never records its approval. When `.pipes/ai-instructions/delivery.md` exists, environment autonomy narrows authority further: each environment is `auto`, `ask`, or `ticket`, and a `ticket` environment needs an approved change ticket and its approver. Without a delivery profile in `.pipes/ai-instructions/delivery.md`, every release or promotion asks the holder of G5.

## Gates

| Gate | Decision | Default deciding role |
| --- | --- | --- |
| G1 Intent | Accept or reject an intent | Product owner |
| G2 Spec | Accept a spec; a `higher` risk class adds the tech lead | Product owner, tech lead |
| G3 Plan | Approve a plan and its execution | Engineer; tech lead or architect for `higher` risk |
| G4 Pull request | Approve and merge a change | Code owner |
| G5 Release | Release or promote a change | Release approver |
| G6 Agent configuration | Change `.pipes/` outside the project records, the generated instructions, skills, hooks, or evals | Code owner of the agent configuration; policy owner for policy rules |
| G7 Triage | Fix now, schedule, or dismiss an incident or monitoring finding | Operations owner |

## Completion Standard

Work is complete when the objective or acceptance criteria are met, scope is still valid, required durable outputs exist in the project areas that own them, relevant validation passed, and no mandatory gate remains unresolved. Record limitations and residual risk plainly.

## Precedence

When Pipes instructions conflict, apply this order:

1. project identity instructions, including the accountability matrix when it exists;
2. the core contract: this file and `.pipes/ai-instructions/core-workflows.md` together;
3. other AI instructions;
4. active rules, loops, pipelines, fragments, and roles;
5. generated wrappers.

Precedence follows the role of a file, not its assembly mode. An instruction assembled as a reference has the same authority as it would have inline; the assembly mode decides only when the agent reads it. Agent tools, skills, connectors, and harness defaults rank below every Pipes instruction. When their defaults disagree with Pipes about where output lives, what a term means, or whether an effect is external, Pipes wins. This ordering never widens authority: external permissions, hooks, and harness restrictions still apply, and a tool feature or mode that the user explicitly invokes or enters keeps its own meaning and location.

## Active Rules

<!-- assembly:rules-table -->

Full definitions: `.pipes/utils/rules/`
