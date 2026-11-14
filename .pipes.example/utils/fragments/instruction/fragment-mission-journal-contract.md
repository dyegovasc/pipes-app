---
title: Mission Journal Contract
description: Requires real local timestamps and append-only ascending Journal chronology for mission lifecycle writes.
version: 1.0
fragment_type: instruction
domain: project
---
# Fragment: Mission Journal Contract

## Instructions

1. Immediately before writing a mission Journal entry, obtain the current local wall-clock time with second precision as `YYYY-MM-DD hh:mm:ss`; never invent a timestamp or use `00:00:00` for a creation entry.
2. Use that value in exactly one `### {timestamp} — {title}` heading.
3. Preserve all existing Journal text and append the new entry after the latest existing Journal entry. Do not reorder, insert before, or rewrite history.
4. Confirm the new heading is chronologically greater than or equal to the preceding valid heading. Stop for an existing-history conflict rather than silently repairing it.
5. Re-read the written mission and validate its Markdown and Journal chronology.

## Output

- Real current local timestamp
- One append-only Journal entry in ascending chronological order
