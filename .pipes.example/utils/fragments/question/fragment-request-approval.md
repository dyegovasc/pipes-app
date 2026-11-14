---
title: Request Approval
description: Requests exact approval for displayed content, target paths, and bounded creation effects.
version: 1.5
fragment_type: question
domain: all
---
# Fragment: Request Approval

## Summary to Display

- Artifact or record type, identifier, purpose, and current status
- Complete proposed content or an exact version-bound preview
- Every target path and whether it will be created or updated
- Durable choices, approval authority, and unresolved notes
- Direct writes, direct related-record writes, and any generated or app-managed relationship effects included in approval
- Effects that remain excluded, including execution or publication when separate
- Pure-Markdown validation result for every displayed Markdown payload

## Question

Do you approve the displayed content, target paths, and listed creation effects, and want those exact writes to proceed? Any displayed Markdown must have passed pure-Markdown validation.

## Options

- approve_create: "Approve and create"
- request_changes: "Request changes"

## Capture

- **approval_status**: approved creation or requested changes
- **approval_authority**: user or other declared gate authority
- **approved_content**: exact displayed content or version
- **approved_paths**: exact create or update targets
- **approved_effects**: direct, generated, and expected app-managed effects included in approval
- **excluded_effects**: execution, related writes, or external actions not covered
- **requested_changes**: content, path, authority, or effect corrections
- **return_phase**: the current pipeline phase that owns the requested correction
- **pure_markdown_validation**: passed validation for the exact displayed Markdown or a blocking finding

## If Approved

Perform only the approved writes and effects. Re-read targets before writing, revalidate any Markdown payload that changed after preview, and validate persisted Markdown after writing. Do not infer approval for execution, direct related-record edits, version-control actions, publication, or any other excluded effect. When the package lists Pipes Local’s automatic reciprocal `related` update and `.pipes/utils/state/related-sync-state.json` refresh for an approved relationship write, treat those as expected app-managed effects rather than unexpected changes; they do not authorize additional direct edits.

## If Changes Requested

Return to the phase that owns the changed content or path, rebuild the complete preview, and request approval again. Do not use hardcoded phase numbers because this fragment serves workflows with different phase structures.
