---
title: Artifact Record Contract
description: Defines generated artifact metadata, naming, source relationships, preservation, and verified creation.
version: 1.2
rule_type: record
enforcement: binding
enforced_by: [model, ci]
---
## Requirement

Apply this contract to every artifact the user asks for or a workflow generates, including standalone HTML. Create it in the project's artifacts area first; a copy that an agent tool hosts or a connector stores is an external send and never replaces the record. Read the destination area's `config.md`. Preserve explicit source-record inputs throughout creation. Use `rule-generated-html-design` for HTML presentation.

## Metadata And Names

- Keep Markdown metadata in YAML frontmatter. Keep HTML metadata in schema-version-1 `pipes:*` meta elements in the document head.
- HTML requires schema-version, sequence, starred, title, description, version, and related. Encode related as an escaped JSON array in the content attribute. HTML does not require Markdown status or created fields.
- For new HTML records, use `{record_type}-{NNN}-{slug}.html`. Artifacts uses `artifact`. Use at least three digits and a lowercase ASCII slug of at most 80 characters. Use `artifact` when the title yields no usable slug.
- Choose one above the largest valid Markdown filename number or embedded HTML sequence in the area. Follow its recursion policy. Initialize the new HTML sequence with the selected number.
- Immediately before writing, reread the area and target. Reject an occupied filename or known sequence collision. Never overwrite another artifact. External concurrent generators have no shared reservation guarantee.
- Existing HTML names remain valid. An existing embedded sequence remains authoritative. Listing and title changes do not rename or renumber a file. Filename, sequence, title, favorite, and presentation remain separate properties.

## Creator-Owned Procedure

1. Receive the purpose, destination area, and explicit source-record paths. During mission execution, also receive the invoking mission path.
2. Read the area config and both record formats. Select the available number and canonical filename.
3. Prepare complete metadata and deduplicated source relationships. Source paths are transient inputs; persist them only through related fields.
4. Create the artifact without overwriting an existing file.
5. Reread each source before its reciprocal update. Skip an update already completed by Pipes Local or an earlier attempt.
6. Apply only the authorized reciprocal relationship effect. Preserve unrelated source content and concurrent edits.
7. Reread the artifact and every source. Verify names, metadata, target existence, and both relationship directions.
8. Run `validate-project-records.cjs --new-record {artifact-path}`. Add one `--source-record {source-path}` for every supplied source. Use strict verification in a clean fixture; default report mode preserves unrelated historical findings.
9. Report creation complete only when the bounded creation checks pass. On interruption, report incomplete effects and reuse the original path and number.

When the app is closed, the agent owns the authorized filesystem writes. Scripts only validate. When the app is open, reread and skip completed reciprocal effects; do not assume synchronization succeeded. Stop on an unresolved concurrent edit, unavailable peer, or failed write.

Creation authority includes the necessary source relationship within that bounded operation. Do not require a second request solely because the artifact is HTML. Preserve explicit user-owned gates. A standalone artifact may have no sources. Never infer an origin from its filename or location. Ordinary assets, source code, and temporary outputs do not acquire record relationships.

## Regeneration And Metadata Loss

1. Capture the existing artifact, content stamp, and managed metadata before generating replacement content.
2. Carry sequence, relationships, favorite, version, and all other managed values into the replacement.
3. Compare proposed metadata with the exact approved metadata effects. Reject missing required fields or restore captured values before writing.
4. Recheck the original source stamp before replacement. Stop on a concurrent edit.
5. Reread the replacement and verify preserved values. Treat a required content-version change as an explicit metadata effect; do not reset an existing version to 1.0.

A missing related field differs from an explicitly empty array. If the ledger already tracks the path, unexpected field loss blocks ordinary initialization and relationship editing. Preserve known relationships until explicit evidence resolves the loss. Viewing remains available. Recover erased favorites, versions, or sequences only from independent evidence; no metadata-history store is implied.

## Relationship Completion

Use one symmetric graph and ledger for Markdown and HTML. Related Files uses the trusted host's `mutate_relationship` service. Flush unrelated pending edits first. Do not save a single endpoint's related draft before requesting reciprocity.

Distinguish document saving from relationship states: pending, complete, error, and recovery_required. Complete requires both endpoints and the ledger to be reread and verified. Preserve failed intent for retry. Recover an uncertain batch before accepting a new operation. Automatic reciprocal maintenance changes only related metadata and does not increase the peer's human version.

Only the trusted host writes application-managed HTML metadata. HTML never enters Markdown parsing or document sessions. Website guests receive no new permissions. Preserve source bytes outside approved metadata effects.
