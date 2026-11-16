---
title: Capture Pipeline Incidents
description: Routes durable Pipes workflow failures to concise issue records without interrupting remediation.
version: 2.2
rule_type: safety
enforcement: advisory
enforced_by: [model]
---
# Rule: Capture Pipeline Incidents

## Requirement

When a Pipes workflow behaves incorrectly, fix or diagnose the active problem first. Record an issue only when the user asks or the incident has durable framework value that is not already captured by a decision or changed source.

## Checks

- Do not add an approval round solely for incident capture.
- If recorded, include affected surface, observed behavior, expected behavior, impact, correction, and follow-up status.
- Avoid duplicate records for the same resolved behavior.
- When the same agent mistake occurs a second time, propose one correction line in `.pipes/ai-instructions/corrections.md` with a link to the issue evidence, and one eval case that reproduces the mistake through `pipeline-add-eval`. Apply the proposal only through `loop-framework-maintenance` and the holder of gate G6 (core.md Gates).
- Keep corrections short and remove a correction when a rule, hook, or check makes it unnecessary, so the always-on instructions stay within their budget.
- A production incident or a monitoring finding, such as an alert threshold that the project defines, is triaged at gate G7 as fix now, schedule, or dismiss. A fix is delivered through an intent, never as an untracked change; an emergency fix made first gets its intent and eval case afterwards.
