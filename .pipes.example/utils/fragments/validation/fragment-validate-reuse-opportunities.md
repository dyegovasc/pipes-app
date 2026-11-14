---
title: Validate Reuse Opportunities
description: Check that the proposed fragments maximize reuse and avoid duplication.
version: 1.1
fragment_type: validation
domain: all
---
# Fragment: Validate Reuse Opportunities

Check that the proposed fragments maximize reuse and avoid duplication.

## Checks

### 1. No Duplicate Functionality
- [ ] Does any proposed new fragment duplicate an existing fragment?
- [ ] Could the new fragment be a configuration/parameter of an existing one?
- [ ] If similar to existing, have you considered reusing + documenting variations?

### 2. Atomicity
- [ ] Is each new fragment focused on a single purpose?
- [ ] Could it be reused by other pipelines (not just this one)?
- [ ] Is the scope clear and bounded?

### 3. Reuse Across Phases
- [ ] Are any fragments repeated across multiple phases?
- [ ] If yes, is that intentional or could they be consolidated?

### 4. Fragment Type Appropriateness
- [ ] Is each fragment assigned the correct type (question/instruction/validation/output/context)?
- [ ] Are related operations grouped logically by type?

## Questions to Ask

For each proposed NEW fragment, ask:

1. **"What existing fragment is closest to this?"**
   - If answer exists, review whether reuse is possible

2. **"Will this fragment be useful in other pipelines?"**
   - If "probably not," consider if it could be more generic

3. **"Could this be a variant/parameter of an existing fragment?"**
   - If yes, favor reuse over creation

4. **"Is this fragment atomic or could it be split further?"**
   - Smaller, focused fragments are more reusable

## Decision Tree

```
New Fragment Proposed
    ↓
Does similar fragment exist?
    ├─ YES → Can we reuse it? (80%+ match)
    │   ├─ YES → Reuse + document any variations
    │   └─ NO → Create new fragment + review why
    └─ NO → Is it atomic and potentially reusable?
        ├─ YES → Create new fragment
        └─ NO → Break into smaller fragments
```

## Output

After validation, provide:
- **Fragments to Reuse:** List with phase assignments
- **Fragments to Create:** List with justification for each
- **Summary:** How many existing vs. new fragments in final pipeline?

## Acceptance Criteria

- [ ] All new fragments have no close existing equivalent
- [ ] All new fragments are atomic (single responsibility)
- [ ] All new fragments are potentially reusable
- [ ] Reuse is maximized (>70% of phase functionality from existing fragments where possible)
