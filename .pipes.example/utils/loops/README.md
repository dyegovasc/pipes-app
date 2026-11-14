# Loops

Loops are adaptive Markdown orchestration contracts. They tell an agent how to keep making governed progress when the next action depends on evidence.

The starter kit ships exactly five loops:

- `loop-concept-development`
- `loop-feature-delivery`
- `loop-investigation-and-recovery`
- `loop-framework-maintenance`
- `loop-artifact-production`

Each loop defines its mission class, roles, operating envelope, cycle, Mission Integration, available pipelines, gates, validation, and real stop conditions. A generated skill points to each loop; the Markdown definition remains authoritative.

Mission Integration keeps reusable loop behavior separate from one recorded run. It defines how a selected mission is read and refreshed, how its existing autonomy profile and intervention level govern pipeline gates, how immediate approvals resume the recorded next action, the shared non-terminal phase vocabulary, and when lightweight loop use does not need a mission record. For a delivery-aware mission, the loop follows the persisted current theme and `spec-driven` or `adaptive` route while treating declared pipelines as optional capabilities rather than an automatic queue. Every recorded terminal mission produces exactly one approved, validated related outcome after validation and reflection but before `done`; resumable missions remain open, retries reuse an existing matching outcome, and lightweight runs without a mission do not create one.
