---
title: Output Writing Style
description: Requires concise Pipes prose blocks to remain on one physical Markdown line.
version: 1.3
rule_type: communication
applies_to:
  - user_outputs
  - ai_instructions
  - records
  - pipelines
  - fragments
  - loops
  - rules
  - team_roles
  - generated_surfaces
enforcement: binding
enforced_by: [model]
gate_relevance:
  evaluates_gates: false
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Output Writing Style

## Requirement

Pipes writing must be useful as an operating surface: direct, concrete, structured only when structure helps, and free of performative filler. Every prose paragraph, labeled field value, list item, and numbered instruction must occupy one physical Markdown line without manual hard wrapping.

All writing also follows `rule-pure-markdown-writing`; raw HTML is not a formatting or line-wrapping mechanism.

## Enforcement

`binding`

## Checks

- Lead with the decision, result, finding, or next required action.
- Use specific nouns and concrete verbs instead of vague process language.
- Keep records concise enough to maintain while preserving the evidence needed for future work.
- Use bullets, tables, or headings when they improve scanability; avoid nesting unless hierarchy is necessary.
- Separate facts, assumptions, decisions, risks, and open questions.
- Avoid praise, apologies, motivational language, and decorative phrasing in durable records.
- Do not hide required caveats, blockers, or validation gaps in a closing note.
- Keep each prose paragraph on one physical line; use blank lines only to separate distinct paragraphs or structural blocks.
- Keep each labeled value, bullet, and numbered step on one physical line, regardless of display width.
- Keep frontmatter scalar text such as `title` and `description` on one physical line.
- Preserve line breaks required by Markdown structure, including headings, distinct list items, table rows, frontmatter arrays, and fenced code; Markdown templates inside fences follow the same one-line prose rule.
- Treat hard-wrapped prose as a validation failure before writing, generating, or approving Pipes content.
- Validate renderer safety through `rule-pure-markdown-writing` at the same formatting, approval, write, and completion boundaries.
