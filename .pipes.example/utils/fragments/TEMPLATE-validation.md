---
title: "{Validation Title}"
description: "{One-sentence description of the contract this fragment validates.}"
version: 1.0
fragment_type: validation
domain: "{all-or-domain-name}"
---
{One-sentence description of the contract this fragment validates.}

## Checks

### {Check Category}

- [ ] {Concrete condition that can be inspected or tested.}
- [ ] {Concrete condition that can be inspected or tested.}

### {Check Category}

- [ ] {Concrete condition that can be inspected or tested.}

## Decision Tree

```text
Does the evidence satisfy every required check?
    YES -> Mark validation as passed.
    NO  -> Record the finding and required correction.
```

## Acceptance Criteria

- [ ] {Observable criterion required for a passing result.}
- [ ] {Observable criterion required for a passing result.}

## Failure Handling

1. {Record the failed check and concrete evidence.}
2. {Correct the in-scope issue or stop at the governing gate.}
3. {Re-run affected checks before reporting completion.}

## Atomicity

Keep this fragment focused on one reusable validation contract. Route corrective work and multi-phase recovery through instructions, pipelines, or loops.
