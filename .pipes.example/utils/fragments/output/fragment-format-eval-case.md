---
title: Format Eval Case
description: Formats one behavioral eval case as JSON for the Pipes eval runner.
version: 1.2
fragment_type: output
domain: framework
---
# Fragment: Format Eval Case

## Format

Produce a complete preview for `.pipes/utils/scripts/fixtures/evals/{id}.json`. The file name equals the `id`, which is lowercase words joined by hyphens. The runner copies the workspace into a disposable directory, writes the `setup` files, runs the `prompt` through the agent adapter, and applies every check to the result.

Write the prompt as a real user request. When the task needs approval to write files, state that approval in the prompt, and say which human decision has not been made, so that the case can prove the agent does not take that decision itself.

Use only these check types: `file_exists`, `file_absent`, `file_matches`, `file_not_matches`, `frontmatter`, `unchanged`, `only_changed`, `validator_clean`, `validator_has`, `tool_called`, `tool_not_called`, `tool_result_matches`, `result_matches`, `script_passes` (a script under `.pipes/utils/scripts`, by file name, with an optional `args` array, that must exit with status 0), `file_count` (the files of a `glob`, optionally only those whose content matches `pattern`, between `min` and `max`), and `any`. Limit `tool_called` and `tool_not_called` patterns to the tool that acts, for example `^Bash .*`, because the pattern also sees file content in `Write` and `Edit` inputs. Add `why` to a check when its purpose is not obvious.

Every case declares `scope` (`starter` or `project`) and `covers` (globs of the files whose change can affect it). Optional fields: `workspace: "starter"` runs the case in a fresh starter install with only the `setup` files beside it, instead of a copy of this workspace; `max_budget_usd` caps the agent cost of the case; `milestone_only: true` keeps an expensive case out of every run except a milestone run or an explicit `--case`; `timeout_seconds` extends the default of 600. The runner hides the case's own file from the agent and refuses nested eval runs other than `--dry-run`.

A starter case names a framework contract path, such as a rule or a pipeline, as its `source`, because project records do not ship with the starter. A project case can name a project record.

A copied workspace can already hold real project records, so make every case independent of them. Number `setup` records from 901, so they never collide with real records. `frontmatter`, `file_matches`, and `file_absent` test every file that their glob matches; do not point them at a whole project area. To check a record that the agent creates, use `file_count` with a `pattern` that only this case's record can match, such as a term from the prompt or a `setup` path, and set `min` and `max`. Pattern checks accept regular-expression `flags`; the default is `m`.

## Template

```json
{
  "id": "{id}",
  "source": "{issue, incident, correction, or contract path}",
  "setup": {
    "{project-relative path}": "{file content}"
  },
  "prompt": "{real user request, with the approvals that are and are not given}",
  "may_change": ["{glob of a path the agent may change}"],
  "checks": [
    { "type": "{check type}", "glob": "{glob}", "pattern": "{regular expression}", "why": "{purpose}" },
    { "type": "only_changed" }
  ]
}
```
