---
title: Format Service Claude Guide
description: Formats a short CLAUDE.md for a backend service repository that imports AGENTS.md and adds only Claude Code specifics.
version: 1.0
fragment_type: output
domain: codebase
---
# Fragment: Format Service Claude Guide

## Format

Produce `CLAUDE.md` for the root of one backend service repository. It imports `AGENTS.md` so that the rules have one source, and adds only Claude Code specifics, such as declared plugins or MCP servers that the repository already configures. When there are no Claude Code specifics, the file contains only the import and one sentence.

## Template

```markdown
@AGENTS.md

This file adds only Claude Code specifics; the rules for every agent tool are in `AGENTS.md`.

## Claude Code

- {plugin, MCP server, or setting that this repository declares, or none}
```
