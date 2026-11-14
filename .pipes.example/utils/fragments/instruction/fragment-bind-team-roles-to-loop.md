---
title: Bind Team Roles To Loop
description: Assigns one owning role per loop phase and defines bounded consultation, handoff, and gate-authority relationships.
version: 1.0
fragment_type: instruction
domain: all
---
# Fragment: Bind Team Roles To Loop

## Instructions

1. Read `.pipes/team/` and resolve every proposed role to an installed role definition. A perspective named in prose is not a valid role binding.
2. Assign exactly one owning role to each kernel phase and one primary role to the loop.
3. Add consultation triggers only when another role's expertise can materially change strategy, validation, or gate escalation.
4. Define handoff artifacts by responsibility. Do not use handoffs to duplicate canonical mission state or imply background agents.
5. Compare each role's declared gate authority with the loop gate contract. Role recommendations cannot satisfy human-mandatory gates.
6. Identify unresolved ownership, overlapping authority, or missing role definitions as blocking findings before file creation.
7. Return the complete `team_interface` frontmatter block and a concise markdown explanation of ownership and escalation.

## Output

- `primary_role`: installed owning role
- `phase_roles`: one installed owner for every kernel phase
- `consultation_triggers`: bounded trigger-to-role mappings
- `handoff_artifacts`: responsibility-aligned handoff outputs
- `authority_findings`: resolved or blocking authority gaps
