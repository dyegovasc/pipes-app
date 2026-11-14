---
title: Format Release Notes
description: Formats release notes for one service version from its plan, spec requirements, and merged pull requests.
version: 1.0
fragment_type: output
domain: codebase
---
# Fragment: Format Release Notes

## Format

Produce release notes in English for one service version. Build them from the plan outcome, the spec requirement IDs it delivered, and the merged pull requests. Describe user-visible and contract changes first. The notes become the `## Release` section evidence of the outcome record and may be pasted into the release or the change ticket.

## Template

```markdown
## {service} {version}

Delivers: {intent or spec title} (`{spec path}`)

### Changes
- {user-visible or contract change} ({R-IDs}; #{pull request})

### Contract Changes
- {endpoint, field, event, or schema change, with consumers, or none}

### Operations
- {migration, configuration, feature flag, or rollback note, or none}

### Verification
- Review: `{review record path}`, verdict {verdict}
- Checks on `main`: {status}
```
