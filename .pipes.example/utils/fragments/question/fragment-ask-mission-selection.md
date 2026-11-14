---
title: Ask Mission Selection
description: Identifies the single recorded mission the user wants to start or resume.
version: 2.1
fragment_type: question
domain: project
---
# Fragment: Ask Mission Selection

## Question

Which mission should be executed? Provide its canonical `.pipes/project/03-missions/mission-{number}-{slug}.md` path or an unambiguous title.

Ask only when the execution request does not already identify exactly one mission. When useful, present concise `draft` and `active` candidates. Do not offer a `done` mission, or a `blocked` mission whose blocker is unresolved, as ready to execute.

## Capture

- `mission_path`: canonical path of the selected mission
- `selection_basis`: supplied path, exact title, or confirmed candidate
- `requested_mode`: `start` for a draft or `resume` for an active mission
- `selection_notes`: ambiguity, status concern, or none
