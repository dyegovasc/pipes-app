---
title: Validate Architecture Instruction
description: Checks that a proposed architecture instruction is complete, evidence-aware, correctly scoped, internally consistent, and safe to assemble.
version: 1.1
fragment_type: validation
domain: codebase
---
# Fragment: Validate Architecture Instruction

## Checks

### Structure And Ownership
- [ ] Frontmatter includes title, description, semantic version, and `assembly: reference`
- [ ] Every canonical architecture section is present and non-placeholder
- [ ] Project identity and coding conventions remain in their owning files
- [ ] Component and boundary ownership is understandable to a downstream agent

### Evidence And Consistency
- [ ] Current claims are supported by repository evidence or confirmed user input
- [ ] Facts, assumptions, and planned evolution are distinguishable
- [ ] Workflows, components, state, and integrations do not contradict each other
- [ ] Update mode preserves or explicitly proposes changes to established commitments

### Operational Readiness
- [ ] `installed_project` mode targets only canonical `.pipes/ai-instructions/architecture.md`
- [ ] `starter_maintenance` mode targets the approved `.pipes-v2/` source first and its `.pipes/` mirror second
- [ ] Staged and installed proposals are equivalent and generated output contains no staging-root path
- [ ] Wrapper regeneration, source context, and validation steps are identified
- [ ] Idempotency is based on inspecting current content and exact approved text, not on a second persisted workflow-state contract
- [ ] No unresolved contradiction would misdirect implementation or validation

## Acceptance Criteria

- [ ] `architecture_validation_status` is `valid` or `blocking`
- [ ] Execution context, exact targets, write order, and version transition are valid
- [ ] Every blocking finding includes an exact correction or user-owned choice
- [ ] The draft can replace a placeholder or update established content without losing unapproved commitments or leaking unrelated content
- [ ] Generated wrappers can be refreshed and validated after the approved write
