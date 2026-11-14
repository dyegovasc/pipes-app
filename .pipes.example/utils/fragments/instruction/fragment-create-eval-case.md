---
title: Create Eval Case
description: Writes an approved eval case and runs it once to record whether it reproduces or guards the behavior.
version: 1.0
fragment_type: instruction
domain: framework
---
# Fragment: Create Eval Case

## Instructions

1. Confirm that the exact case content and path are approved.
2. Stop if `.pipes/utils/scripts/fixtures/evals/{id}.json` exists with different content.
3. Write the case and run `node --test .pipes/utils/scripts/run-evals.test.cjs` to prove that it is well formed.
4. Run `node .pipes/utils/scripts/run-evals.cjs --case {id}` once. Record whether the case passes, which means it guards behavior that works today, or fails, which means it reproduces a mistake that a later fix must make pass.
5. Report the run cost and the result file path under `.pipes/utils/state/evals/`. Do not change rules, instructions, or other cases in this step.

## Output

- Eval case path
- Format test result
- First run result: guards or reproduces, with the failing checks
- Result file path and cost
