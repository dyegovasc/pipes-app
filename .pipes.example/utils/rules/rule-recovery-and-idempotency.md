---
title: Recovery And Idempotency
description: Prevents interrupted or retried work from duplicating effects or hiding uncertainty.
version: 2.2
rule_type: safety
enforcement: binding
enforced_by: [model]
---
# Rule: Recovery And Idempotency

## Requirement

After interruption, failure, or uncertain external behavior, inspect actual state before retrying or moving on.

## Checks

- Classify whether the prior action completed, did not complete, or remains uncertain.
- Reuse existing outputs when they match the intended result.
- Before retrying recorded-plan closure, inspect source status, related paths, reciprocal outcome records, and version evidence; reuse one matching transition and outcome and stop on multiple or contradictory matches.
- Retry only when duplicate effects are prevented or acceptable.
- Do not repeat completed pipeline phases or protected external actions blindly.
- Change strategy or stop when repeated attempts make no progress or add no evidence.
- Treat compensation, rollback, and destructive recovery as separate protected actions when applicable.
