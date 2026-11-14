---
title: Define Solution Architecture
description: Defines the architecture of the selected solution including data flow, component interactions, and a list of files to be created or modified.
version: 1.2
fragment_type: instruction
domain: codebase
---
# Fragment: Define Solution Architecture

Defines the architecture of the selected solution including data flow, component interactions, and a list of files to be created or modified.

## Instructions

1. **Describe the solution architecture** — how the components interact to deliver the feature
2. **Define data flow** — how data enters, transforms, and exits the system for this feature
3. **List impacted files** — for each file: path, action (create / modify / delete), and brief description of change
4. **Flag architectural decisions** — any decisions made that deviate from existing patterns and why
5. **Record verified architecture preconditions** — name inputs, dependencies, targets, and acceptance facts the implementation plan relies on
6. **Identify new abstractions** — any new interfaces, types, or contracts being introduced

## Output
- `architecture_description`: narrative description of the solution design
- `data_flow`: step-by-step data flow description
- `impacted_files`: list of `{ path, action, description }` objects
- `architectural_decisions`: list of notable decisions with rationale
- `architecture_preconditions`: list of verified facts the architecture depends on
- `deviation_from_existing_patterns`: list of deliberate deviations and why they are justified
- `new_abstractions`: list of new interfaces or contracts introduced
