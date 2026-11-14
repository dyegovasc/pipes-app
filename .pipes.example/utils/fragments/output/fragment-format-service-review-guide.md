---
title: Format Service Review Guide
description: Formats a REVIEW.md for a backend service repository that tells human and agent reviewers what blocks a merge.
version: 1.0
fragment_type: output
domain: codebase
---
# Fragment: Format Service Review Guide

## Format

Produce `REVIEW.md` for the root of one backend service repository. It is short, written in English, and focused on judgment that the pull request checks do not already enforce. It points to the org policies in the orchestration repository instead of copying them, and it adds only rules that are specific to this service. List under "Do Not Comment On" only conventions that the service's own tool configuration enforces; verify each one in its linter, formatter, or build configuration, and treat a convention the tools cannot check as a review topic. `pipeline-review-change` reads it when present; `pipeline-onboard-service-repo` proposes it.

## Template

```markdown
# Review Guide: {service}

Reviews check the change against its plan and spec in the orchestration repository (`.pipes/project/`) and against the org policies in `.pipes/utils/rules/`: {policy rules with `skill: true`, by title}.

## Blocks A Merge

- A failing build, test, or pull request check.
- An acceptance criterion or spec requirement that the change does not prove.
- A violation of an org policy or of a service rule below.
- A contract change without its consumers named in the spec.

## Service Rules

- {rule specific to this service, with its reason}

## Do Not Comment On

- {only what this service's tools really enforce, named with the tool and check, for example the import rules that the linter checks}
- Dependency versions and locks: the build enforces them.

## Severity

- Blocking: must be fixed before merge.
- Major: should be fixed before merge; the code owner may accept it with a reason.
- Minor: can be fixed later.

## Approval

The code owners in `.github/CODEOWNERS` approve. Agent reviews are recommendations and never approve.
```
