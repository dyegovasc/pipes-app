---
title: Check Greenfield Repository
description: Decides read-only and fail-closed whether a repository has no code yet, so that a workflow can set it up from declared choices instead of repository evidence.
version: 1.0
fragment_type: instruction
domain: codebase
---
# Fragment: Check Greenfield Repository

## Instructions

1. Never write, move, or delete a file during this check, and never follow a symbolic link.
2. Confirm that the root is the top of a git work tree: the root must equal the output of `git rev-parse --show-toplevel`. When the root is not a git repository, or is a subdirectory of a larger repository, the result is not greenfield.
3. List every file below the root:
   - tracked and untracked files with `git ls-files --cached --others --exclude-standard`;
   - ignored files and directories with `git ls-files --others --ignored --exclude-standard --directory`;
   - use `git check-ignore` only to confirm a single path.
4. The result is not greenfield when any of these exist:
   - a `.gitmodules` file;
   - a nested `.git` entry below the root, for example found with `find . -name .git -not -path ./.git`;
   - an ignored directory outside `.pipes/` that holds files; tell the user to remove the directory or stop ignoring it, and offer no override;
   - `.pipes/ai-instructions/delivery.md` with the `multi-repo` layout;
   - a symbolic link outside `.pipes/`, for example a `git ls-files -s` entry with mode `120000` or a `find . -type l` result;
   - a file that declares dependencies or a build, such as `package.json`, `pyproject.toml`, `Cargo.toml`, or `go.mod` (examples only; the test is what the file declares, not its name);
   - a file outside the allowed set in instruction 5;
   - a file that this check cannot classify.
5. The allowed set is:
   - README files;
   - documentation: Markdown, plain text, reStructuredText, or AsciiDoc files, and images under a top-level documentation directory such as `docs/`; code under that directory is not documentation;
   - license and notice files;
   - `.gitignore`, `.gitattributes`, and `.editorconfig`;
   - CI configuration: a file whose only purpose is to configure a CI service, for example `.github/workflows/*.yml`;
   - every file under `.pipes/`, ignored or not;
   - the generated agent surfaces `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.claude/`, and `.agents/`.
6. Under `.pipes/`, the allowed set takes precedence over instruction 4 for path classification. The `multi-repo` layout condition in instruction 4 still applies.
7. Report the files or conditions that decided the result. When the result is greenfield, report the classified file list.

## Inputs

- Repository root
- `.pipes/ai-instructions/delivery.md` when it exists

## Output

- `greenfield`: `true` | `false`
- `deciding_files`: each file or condition that made the result false, or the classified file list when it is true
- `user_action`: when false, what the user can do, such as removing an ignored directory or using `pipeline-bootstrap-workspace` for a repository with code
