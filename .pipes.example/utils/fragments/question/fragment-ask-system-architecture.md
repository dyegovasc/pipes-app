---
title: Ask System Architecture
description: Captures system boundaries, workflows, components, state, integrations, operational constraints, and planned evolution for the canonical architecture instruction.
version: 1.0
fragment_type: question
domain: codebase
---
# Fragment: Ask System Architecture

## Question

Gather only architecture information that cannot be established confidently from repository evidence:

1. What system does this repository implement, who does it serve, and what core outcome does it own?
2. Which product and repository boundaries are owned here, and which are delegated to other systems?
3. What are the primary end-to-end workflows?
4. Which components, modules, services, or packages own each responsibility?
5. Where does durable data and runtime state live, and how does it flow?
6. Which external integrations or cross-system contracts are material?
7. Which operational, deployment, performance, security, compliance, or reliability constraints shape the design?
8. Which planned architectural changes should agents anticipate without treating them as current facts?

Ask for confirmation when evidence and user intent conflict. Do not move coding conventions, project identity, or speculative implementation detail into the architecture instruction.

## Capture

```yaml
system_architecture:
  system_summary: ""
  product_boundaries:
    owns: []
    delegates: []
  primary_workflows: []
  components: []
  data_and_state: []
  external_integrations: []
  operational_constraints: []
  planned_evolution: []
  evidence_sources: []
  user_confirmed_choices: []
  unresolved_items: []
```
