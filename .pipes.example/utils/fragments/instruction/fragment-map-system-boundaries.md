---
title: Map System Boundaries
description: Maps system boundaries, ownership, flows, integrations, and affected components at whole-system or feature scope.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Map System Boundaries

## Instructions

1. Set `mapping_scope` to `system_definition` for a canonical architecture map or `feature_change` for a bounded implementation plan.
2. Inspect current instructions, repository structure, entrypoints, packages, services, schemas, integrations, and relevant decisions before mapping.
3. Identify internal modules, layers, services, packages, and ownership boundaries at the selected scope.
4. Identify external systems, APIs, stores, queues, events, deployment surfaces, and cross-repository contracts.
5. Map the primary control and data flows across those boundaries, including where durable data and runtime state are owned.
6. Identify shared components and contracts. In `feature_change` scope, list the concrete components likely to change; in `system_definition` scope, describe each component's stable responsibility.
7. Separate current evidence, accepted constraints, planned evolution, and unresolved items. Do not invent an integration or ownership boundary.

## Output

- `mapping_scope`: `system_definition` | `feature_change`
- `internal_boundaries`: modules, layers, services, packages, and owners
- `external_boundaries`: integrations and delegated responsibilities
- `control_and_data_flows`: current workflows, state ownership, and movement
- `shared_components`: reused utilities, middleware, schemas, and contracts
- `component_responsibilities`: stable ownership for system definition
- `affected_components`: concrete change candidates for feature planning
- `evidence_sources`, `planned_evolution`, and `unresolved_boundaries`
