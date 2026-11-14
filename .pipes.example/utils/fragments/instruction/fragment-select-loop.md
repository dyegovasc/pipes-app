---
title: Select Loop
description: Selects the best of the five starter loops for a mission.
version: 2.1
fragment_type: instruction
domain: project
---
# Fragment: Select Loop

## Instructions

1. Read `.pipes/utils/loops/README.md` and the candidate loop definitions, including each loop's declared `pipelines`.
2. Match the dominant mission need:
   - ideas and direction: `loop-concept-development`
   - feature implementation: `loop-feature-delivery`
   - diagnosis and recovery: `loop-investigation-and-recovery`
   - Pipes changes: `loop-framework-maintenance`
   - documents or other bounded artifacts: `loop-artifact-production`
3. Prefer one loop that can own the whole mission; pipelines can handle deterministic subroutines.
4. Treat declared pipelines as available capabilities rather than obligations or an automatic execution queue. Do not invoke a pipeline during loop selection.
5. Ask the user only when two loop choices imply materially different scope or authority.

## Output

- Selected loop
- One-sentence fit rationale
- Primary role and likely consultations
- Declared pipeline capabilities relevant to later delivery routing
