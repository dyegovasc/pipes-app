---
title: Isolate Review Worktree
description: Checks out the change under review in a temporary git worktree and finds its upstream Pipes records.
version: 1.0
fragment_type: instruction
domain: codebase
---
# Fragment: Isolate Review Worktree

## Instructions

1. Resolve the target service repository and the pull request number or branch. Read the pull request title, description, and existing review threads with read-only `gh pr view` when a pull request exists.
2. Fetch the change into a local ref, for example `git -C {repo} fetch origin pull/{number}/head:review/{number}`, and add a temporary worktree outside the repository, for example `git -C {repo} worktree add {temp-dir} review/{number}`. Never check out the change in the developer's working copy and never change its branch.
3. Find the upstream records in `.pipes/project/`: the plan that names this repository or pull request, its spec with requirement IDs, and the intent. Record a missing upstream record as a finding, not as a reason to stop.
4. Collect the checks the pull request already ran, such as build, secret scan, SCA, and Semgrep, from `gh pr checks` when available.
5. After the review ends, remove the worktree and the local ref with `git worktree remove` and `git branch -D`. Leave the developer's repository state as it was.

## Output

- Worktree path, base and head commits, and the changed files
- Upstream plan, spec, and intent paths, or the missing-record finding
- Pull request checks and their status
