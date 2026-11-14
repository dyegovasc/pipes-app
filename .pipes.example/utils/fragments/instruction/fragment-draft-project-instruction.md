---
title: Draft Project Instruction
description: Composes an evidence-backed project instruction while preserving established identity and ownership commitments.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Draft Project Instruction

## Instructions

1. Use repository evidence and explicit user-confirmed choices; do not convert an unresolved guess into project identity.
2. Describe what the project is, who or what it serves, what this repository owns, and the boundaries it delegates elsewhere.
3. Summarize current runtime, frameworks, infrastructure, quality tools, and working commands in a compact `## Stack` table.
4. Summarize repository structure, ownership, and artifact locations under `## Architecture`; keep deeper workflows, state, and integration design in `.pipes/ai-instructions/architecture.md`.
5. Keep binding implementation conventions in `rule-codebase-conventions.md`, not in descriptive project prose.
6. Use `assembly: inline`. In update mode, preserve established commitments and the current title unless an exact change has been surfaced for approval.
7. Use version `1.0` for a new file or one minor increment for a substantive update. Do not increment merely to reformat unchanged content.
8. List proposed additions, corrections, and removals separately so approval can bind every lasting change.

## Inputs

- Execution context, target classification, current content, and version
- Evidence-backed identity, stack, commands, and repository boundaries
- User-confirmed choices and preserved commitments

## Output

- Complete project-instruction draft
- Preserved commitments and proposed changes
- Target path, mode, and proposed version transition
- Remaining blocking conflict or unresolved choice
