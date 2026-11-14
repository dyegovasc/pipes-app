---
title: Tally Review Findings
description: Combines verifier and reviewer findings into one severity tally and verdict without approving the change.
version: 1.0
fragment_type: instruction
domain: codebase
---
# Fragment: Tally Review Findings

## Instructions

1. Collect the verifier evidence and the reviewer findings. Remove duplicates and keep the higher severity when two findings describe the same problem.
2. Keep only findings with a verified file and line, or a verified command result. Drop findings that the pull request checks already enforce, such as formatting or static analysis covered by the repository's tools, unless a check failed.
3. Classify each finding: `blocking` for a policy violation, a failing build or test, an acceptance criterion that is failed or not proved, or a requirement ID with no implementation; `major` for a defect or risk that should be fixed before merge; `minor` for an improvement that can wait.
4. Set the verdict: `not ready` when any blocking finding exists, `ready with findings` when only major or minor findings exist, and `ready` otherwise.
5. State that the verdict is a recommendation. The code owner from `.github/CODEOWNERS` decides gate G4; the review never approves, merges, or requests changes on its own.

## Output

- Severity tally: blocking, major, and minor counts
- Verdict and its reason
- Ordered findings with severity, file and line or command, rule or requirement, and correction
