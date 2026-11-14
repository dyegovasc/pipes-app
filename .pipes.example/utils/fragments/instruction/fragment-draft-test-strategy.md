---
title: Draft Test Strategy
description: Documents the test coverage plan for the feature implementation.
version: 1.0
fragment_type: instruction
domain: codebase
---
# Fragment: Draft Test Strategy

Documents the test coverage plan for the feature implementation.

## Instructions

1. **Unit tests** — identify which new functions, classes, or modules need unit tests and what cases to cover
2. **Integration tests** — identify which component interactions need integration tests
3. **End-to-end tests** — identify which user flows need e2e coverage, if applicable
4. **Regression tests** — based on `blast_radius_rating`, identify which existing tests must pass or be updated
5. **Edge cases** — list non-obvious edge cases that tests must cover
6. **Test data requirements** — flag any fixtures, seeds, or mocks needed

## Output
- `unit_tests`: list of functions/modules to test with cases
- `integration_tests`: list of component interactions to test
- `e2e_tests`: list of user flows to test (or `none`)
- `regression_tests`: list of existing tests to verify
- `edge_cases`: list of edge cases to cover
- `test_data_requirements`: required fixtures or mocks
