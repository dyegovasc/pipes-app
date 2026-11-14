---
title: Invoke Pipeline
description: Runs another Pipes pipeline as one step of an orchestrating pipeline, keeping its gates and returning its outputs.
version: 1.0
fragment_type: instruction
domain: framework
---
# Fragment: Invoke Pipeline

## Instructions

1. Read the named pipeline and its `## Loop Use` contract. Confirm its entry points fit the current state; when its outputs already exist and are current, record that and skip it.
2. Pass the inputs its Loop Use names, including the outputs of earlier steps.
3. Run the pipeline's phases in order with every approval gate it declares. A gate of the invoked pipeline is a gate of this step; never merge two gates into one approval.
4. Collect its outputs and validation evidence. When it stops at a blocker or a declined gate, stop this step and report the exact resume point.
5. After a pause, inspect the invoked pipeline's actual outputs and resume from its first incomplete phase; never repeat an approved write.

## Output

- Invoked pipeline, its outputs, and its validation evidence
- Skipped-as-current or resume point when applicable
