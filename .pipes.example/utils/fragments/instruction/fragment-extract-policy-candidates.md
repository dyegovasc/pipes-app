---
title: Extract Policy Candidates
description: Groups the rules stated across repositories into project-wide policy candidates, conflicts, gaps, and repository-specific rules, each with sources.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Extract Policy Candidates

## Instructions

1. From the surveyed docs, collect every statement that tells an agent or developer how to build, test, secure, or deliver code. Keep the source path and line of each.
2. Group the statements by topic, for example API contracts, layering and errors, security and identity, data and persistence, dates and time, testing, and delivery.
3. For each topic, classify each rule:
   - `consistent`: stated by more than one repository, or by the only repository in `single-repo` layout, with no repository stating the opposite. It is a policy candidate.
   - `conflict`: repositories state incompatible versions. Record both sides with their paths; never choose one.
   - `repo-specific`: true for one repository only. It stays in that repository's docs.
4. Record gaps: topics that the project needs but no repository states, such as personal data handling, logging, or idempotency.
5. Record repeated mistakes that the docs warn about; they become checks in the matching policy candidate.
6. Do not promote a rule that a tool already enforces in every repository unless the policy needs to name the tool; say which tool enforces it.

## Output

- Policy candidates by topic, each rule with its source paths
- Conflicts with both positions and paths
- Gaps and repository-specific rules
