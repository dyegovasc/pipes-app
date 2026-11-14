---
title: ASD-STE100 Writing
description: Requires every authored document to use clear language inspired by ASD-STE100 while preserving its requested language and technical meaning.
version: 1.1
rule_type: communication
applies_to:
  - documentation
  - document_previews
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
# Rule: ASD-STE100 Writing

## Requirement

Every authored document must follow the ASD-STE100 philosophy of clear, concise, and unambiguous writing. Preserve the requested language, technical meaning, and required structure.

Apply these principles to document drafts, previews, new documents, templates, and generated prose. During edits, apply them to newly written or rewritten passages.

## Language And Conformance

- Keep the document in the requested or established language. This rule does not require translation into English.
- In Portuguese and other languages, apply these principles as a local writing practice.
- Formal ASD-STE100 conformance requires the applicable English writing rules and controlled dictionary. Applying this philosophy alone does not establish conformance.
- Claim formal conformance only when the document was checked against the applicable official specification. State the edition and validation scope.

## Writing Principles

- Write for the intended reader and task. Include the information needed to understand or perform the work.
- Use short sentences with one main idea. Aim for at most 20 words in an instruction sentence and 25 in a descriptive sentence.
- Treat these sentence lengths as local review targets. Rewrite longer sentences when clarity improves; preserve essential conditions, qualifications, and technical meaning.
- Use familiar words and concrete verbs. Remove filler, idioms, metaphors, and unnecessary jargon.
- Use one consistent term for each concept. Define necessary technical terms and abbreviations on first use.
- Keep established domain terms, product names, interface labels, and identifiers exact. Do not introduce synonyms for stylistic variety.
- Prefer active voice and name the responsible actor when responsibility matters. Use passive voice only when it makes the technical meaning clearer.
- Make references explicit. Replace ambiguous pronouns and vague expressions with the intended object, condition, value, or result.
- Keep one topic per paragraph. Split dense explanations into short paragraphs, lists, or tables when the structure helps.
- Keep necessary words, articles, units, and qualifiers. Concision must preserve facts, uncertainty, exceptions, and evidence.

## Instructions And Procedures

- Use the imperative for direct instructions. State who acts when the responsible actor could be unclear.
- Give one instruction per sentence and normally one action per numbered step. Keep simultaneous actions together only when their relationship is necessary.
- State a condition before the action it controls. Put necessary prerequisites and warnings before the affected step.
- Present actions in execution order. State the expected result or completion criterion when the reader needs it.
- Distinguish requirements, recommendations, and options. Replace vague directions with observable criteria when the evidence supports them.

## Preservation And Scope

- Preserve code, commands, paths, identifiers, source quotations, and externally defined text. Apply the principles to the surrounding explanation.
- Preserve frontmatter, required sections, relationship paths, authority boundaries, and approval gates.
- Follow `rule-output-writing-style` and `rule-pure-markdown-writing`. Short sentences may share one physical Markdown line within a paragraph or list item.
- Do not rewrite untouched historical documents merely to introduce this rule.

## Validation

- Review the exact document before preview, approval, writing, generation, and completion. Check clarity, sentence length, terminology, actors, conditions, and action order.
- Correct unclear or unnecessarily long prose within the authorized scope. Recheck the changed document before reporting completion.
- Confirm that simplification preserved technical meaning, required evidence, and uncertainty. Never invent facts to make an instruction appear complete.
- Inspect generated prose and templates as well as manually written content. Preserve exact source material that the generator must reproduce.
- Use automated writing checks as assistance when available. Markdown checks alone do not establish clarity or ASD-STE100 conformance.

## Sources

- [ASD-STE100 official overview](https://www.asd-ste100.org/about.html)
- [ASD-STE100 Issue 9 specification](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf)
- [ASD-STE100 official FAQ](https://www.asd-ste100.org/STE_faq.html)
