---
title: Format Delivery Profile
description: Formats the Markdown delivery profile that hooks, rules, and workflows read for project delivery facts.
version: 1.3
fragment_type: output
domain: codebase
---
# Fragment: Format Delivery Profile

## Format

Produce the optional `.pipes/ai-instructions/delivery.md` when the user opts in. It holds project delivery facts as Markdown sections with plain tables, so people read it as a document and `utils/scripts/delivery-profile.cjs` parses it. Keep every section heading and table header row exactly as in the template; change only the rows. Wrap literal values such as branch names, environment names, commands, and patterns in backticks. Validate the result with `node .pipes/utils/scripts/delivery-profile.cjs`.

Autonomy values: `auto` deploys without an agent dispatch; `ask` needs a human confirmation of the exact dispatch; `ticket` needs an approved change ticket that matches the pattern and its approver. The `*` row applies to every environment that is not listed; use `ask` for it unless the user decides otherwise. Include the Change Tickets section only when an environment uses `ticket`.

The Evals section is optional. Include it when the project runs behavioral evals: an Evals table with at least one row makes eval results required at gate G6 and names the model of each eval tier, where `default` means the agent tool's own default model. Omit the whole section, heading included, when the project does not run evals yet; eval runs are then recommended but not required.

## Template

```markdown
---
title: Delivery Profile
description: Project facts that Pipes workflows, hooks, and scripts read: repository layout, protected branches, environments, change tickets, release workflows, and commands.
version: 1.0
assembly: reference
---
# Delivery Profile

This file is part of the project identity and has project-identity precedence even though it is assembled as a reference. Framework files stay generic and read these facts from here; `utils/scripts/delivery-profile.cjs` parses the tables below, and the protected-action hook enforces them. Keep each table's header row as it is; change the rows.

## Layout

| Key | Value |
| --- | --- |
| Mode | `{single-repo or multi-repo}` |
| Services root | `{path, . for the workspace root}` |

## Protected Branches

| Branch | Rule |
| --- | --- |
| `{branch}` | Changes arrive only through a reviewed pull request |

## Environments

| Environment | Autonomy | Dispatch |
| --- | --- | --- |
| `{environment}` | `{auto, ask, or ticket}` | {how it deploys, or the dispatch command} |
| `*` | `ask` | {dispatch command for any other environment} |

## Change Tickets

| Key | Value |
| --- | --- |
| Pattern | `{regular expression, for example {KEY}-\d+}` |
| Approver | {approver role} |

## Release Workflows

| Workflow | Purpose |
| --- | --- |
| `{workflow file}` | {what it releases or promotes} |

## Commands

| Purpose | Command | Healthy output |
| --- | --- | --- |
| Build and verify | `{command}` | {what success prints} |

## Issue Tracker

| Key | Value |
| --- | --- |
| Key pattern | `{regular expression, for example {KEY}-\d+}` |
| Branch names | {branch naming convention} |

## Evals

| Key | Value |
| --- | --- |
| Routine model | `{model for targeted and starter-scope runs, or default}` |
| Milestone model | `{model for milestone runs, or default}` |
```
