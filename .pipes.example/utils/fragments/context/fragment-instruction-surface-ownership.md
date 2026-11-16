---
title: Instruction Surface Ownership
description: Describes the distinct ownership of project, architecture, and binding convention instructions.
version: 1.2
fragment_type: context
domain: codebase
---
# Fragment: Instruction Surface Ownership

## Background

Pipes separates durable repository context across complementary instruction surfaces. `project.md` owns product identity, stack summary, repository boundaries, and working commands. `architecture.md` owns system workflows, components, state, integrations, and operational boundaries. `rule-codebase-conventions.md` owns binding implementation behavior and local working conventions. These surfaces may summarize one another for orientation but should not duplicate or contradict ownership.

## Structure

| Surface | Owns | Does Not Replace |
| --- | --- | --- |
| `.pipes/ai-instructions/project.md` | Identity, stack summary, repository boundaries, and commands | Detailed system architecture or binding implementation rules |
| `.pipes/ai-instructions/architecture.md` | Workflows, components, state, integrations, and operational boundaries | Project identity or local enforcement |
| `.pipes/ai-instructions/accountability.md` (optional) | Other holders of the human roles that decide each gate, holder resolution, and separation of duties | Gate mechanics in the core contract |
| `.pipes/ai-instructions/delivery.md` (optional) | Project delivery facts: layout, protected branches, environments and their autonomy, release workflows, commands, and change tickets when an environment needs them | Gate decisions or binding implementation rules |
| `.pipes/ai-instructions/corrections.md` | Short always-on corrections for mistakes the agent repeated | Rules, conventions, or incident records |
| `.pipes/utils/rules/rule-codebase-conventions.md` | Binding implementation conventions and checks | Project or architecture description |

Missing, placeholder, stale, or contradictory content remains an evidence gap for the owning workflow; this context does not draft, validate, or write any surface.
