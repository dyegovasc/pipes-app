---
title: Pure Markdown Writing
description: Prohibits raw HTML in renderable Pipes Markdown and requires validation at every document boundary.
version: 1.2
rule_type: validation
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
enforced_by: [model, ci]
gate_relevance:
  evaluates_gates: true
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Pure Markdown Writing

## Requirement

Every Pipes-authored Markdown document must be renderer-safe pure Markdown. Renderable Markdown content must not contain raw HTML elements or HTML-like JSX; use Markdown structure instead. Literal HTML examples are allowed only inside inline code or fenced code.

Standalone HTML artifacts are outside this Markdown syntax rule. Apply `rule-generated-html-design` to their presentation in this workspace. Keep Markdown descriptions, previews, and surrounding records under this rule.

## Enforcement

`binding`

## Checks

- Apply this rule to direct document edits and to every formatting, preview, approval, write, generation, validation, and completion boundary.
- Replace raw HTML layout or formatting with Markdown paragraphs, blank lines, headings, lists, tables, links, images, emphasis, blockquotes, or fenced blocks.
- Treat opening, closing, self-closing, custom-element, and JSX-style tags as violations when they occur outside inline or fenced code.
- Treat autolinks such as `<https://example.com>` and `<user@example.com>` as Markdown, not raw HTML.
- Allow HTML comments only as non-rendering tooling sentinels; comments must not carry user-visible content or replace Markdown structure.
- Validate an exact Markdown preview before approval and validate the unchanged payload again before writing when content may have changed.
- Re-read every written or generated Markdown target and run `.pipes/utils/scripts/validate-pure-markdown.cjs` before reporting the write or workflow complete.
- Treat any prohibited raw HTML finding as a validation failure; report its path, line, and column and correct it within scope or stop at the applicable migration or policy gate.
