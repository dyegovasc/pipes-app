---
title: Source Tree Execution Context
description: Describes canonical write ownership for installed projects and staged starter maintenance.
version: 1.0
fragment_type: context
domain: framework
---
# Fragment: Source Tree Execution Context

## Background

Pipes uses two source-tree execution contexts. In `installed_project`, the current product owns canonical `.pipes/` paths and framework work writes only there. In `starter_maintenance`, `.pipes-v2/` is the staged starter source: equivalent changes are written and validated there first, then reconciled into the installed `.pipes/` tree while preserving user-owned records and unrelated drift. The staging name is repository-local and must not appear in installed generated paths.

## Structure

| Execution Context | Authoritative Write Target | Reconciliation And Validation |
| --- | --- | --- |
| `installed_project` | Canonical `.pipes/` paths only | Validate the installed project directly. |
| `starter_maintenance` | Matching `.pipes-v2/` source first | Validate staged source, reconcile the scoped equivalent into `.pipes/`, then validate canonical installed output. |

Context resolution comes from repository identity, invocation scope, and current targets. It does not authorize overwrites, protected actions, or unrelated tree reconciliation.
