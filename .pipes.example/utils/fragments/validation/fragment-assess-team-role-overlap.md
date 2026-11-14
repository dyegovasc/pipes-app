---
title: Assess Team Role Overlap
description: Checks a proposed team member against existing roles before creating a new file.
version: 1.0
fragment_type: validation
domain: all
---
# Fragment: Assess Team Role Overlap

Checks a proposed team member against existing roles before creating a new file.

## Checks

### Existing Role Scan
- [ ] Read all `.pipes/team/*.md` files except `README.md`.
- [ ] Compare role ids, titles, missions, scopes, responsibilities, outputs, and handoffs.
- [ ] Identify roles with similar ownership or duplicate deliverables.

### Boundary Assessment
- [ ] The proposed role has a distinct mission.
- [ ] The proposed role has clear non-goals.
- [ ] The proposed role does not silently take over another role's core responsibility.
- [ ] Handoffs to and from existing roles are explicit.

### Recommendation
- [ ] Recommend creating the new role when overlap is low or intentional.
- [ ] Recommend extending an existing role when overlap is high.
- [ ] Recommend revising the role when responsibilities are broad or blurry.

## Decision Tree

```text
Proposed role
  |
  +-- Strong overlap with existing role?
      |
      +-- Yes: recommend extend or revise
      +-- No: recommend create
```

## Acceptance Criteria

- [ ] Existing team files were reviewed.
- [ ] Any overlapping role is named explicitly.
- [ ] The recommendation is one of `create`, `extend_existing`, or `revise`.
- [ ] The user confirms the path when overlap is strong.

## Failure Handling

1. If team files cannot be read, report that overlap validation is incomplete.
2. If role boundaries are unclear, return to role definition before formatting.
3. If the user chooses to extend an existing role, stop before creating a new file.
