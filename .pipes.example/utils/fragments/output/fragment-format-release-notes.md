---
title: Format Release Notes
description: Formats release notes for one version from its plan, spec requirements, and merged pull requests.
version: 1.1
fragment_type: output
domain: codebase
---
# Fragment: Format Release Notes

## Format

Produce release notes in the project's documentation language for one version of a component. Build them from the plan outcome, the spec requirement IDs it delivered, and the merged pull requests. Describe user-visible and contract changes first. The notes become the `## Release` section evidence of the outcome record and may be pasted into the release, or into a change ticket when the environment uses one.

## Template

```markdown
## {component} {version}

Delivers: {intent or spec title} (`{spec path}`)

### Changes
- {user-visible or contract change} ({R-IDs}; #{pull request})

### Contract Changes
- {endpoint, field, event, or schema change, with consumers, or none}

### Operations
- {migration, configuration, feature flag, or rollback note, or none}

### Verification
- Review: `{review record path}`, verdict {verdict}
- Checks on the default branch: {status}
```
