---
title: Define Phases
description: Turns a deterministic workflow brief into explicit ordered phases.
version: 2.2
fragment_type: instruction
domain: all
---
# Fragment: Define Phases

## Instructions

1. Give the workflow a stable phase order that matches its real deterministic dependencies; split or merge phases only when the handoff becomes clearer.
2. For every phase, declare the app-native phase contract:
   - the title in `### Phase N:`.
   - `**Objective:**` — the phase outcome, not an activity label.
   - `**Acting Role:**` — accountable team-member IDs only.
   - `**Inputs:**` and `**Outputs:**` — concrete records, files, context, or results passed through the phase.
   - `**Handoff To:**` — concrete receiving team-member IDs only.
   - `**Approval Gate:**` and `**Entry Conditions:**` — authority and evidence required to begin or continue.
   - optional `**Support Team:**` — fixed supporting team-member IDs only; omit it when the support array is empty.
   - `**Fragments:**`, `**Instructions:**`, and `**Exit Conditions:**` — exact reusable work, ordered recovery-aware actions, and observable completion facts.
   - Keep non-member or conditional routes in Instructions, Outputs, Control Rules, or Team Contract rather than in member-ID fields.
3. Make each phase output satisfy the next phase's entry conditions. Do not use hidden state, implied handoffs, or approvals carried beyond their scope.
4. Bind every declared fragment to at least one phase and declare every used fragment in frontmatter. Keep the execution order visible.
5. For delivery pipelines, add a concise `## Team Contract` naming the primary owner, conditional participants, and continuity responsibility.
6. Add `## Loop Use` with invocation inputs, returned outputs, remaining gates, protected effects, and resumption from the first incomplete phase.
7. State failure, contradiction, overwrite, and protected-action stops in the phase that can encounter them.
8. Remove ceremonial gates and repeated prose that do not change execution, validation, authority, or handoff clarity.

## Output

- Ordered detailed phase definitions with the app-native phase contract
- Connected entry, output, handoff, and exit contracts
- Exact phase-to-fragment bindings and frontmatter union
- Team contract when delivery-oriented
- Approval, protection, failure, resumption, and loop-use contracts
