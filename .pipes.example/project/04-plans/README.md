# Plans

Plans are bounded executable specifications. Use `plan-{number}-{slug}.md`, relate relevant mission or source records by path, and make acceptance criteria testable.

When a delivery-aware mission invokes New Feature Planning, bind the plan to exactly one mission theme, preserve its classification and dependencies, and return the validated plan to the mission's recorded post-plan action. The plan owns executable file-level steps; the mission's Delivery section owns only high-level theme routing.

Execute Plan distinguishes this recorded source from inline approved content. After current execution approval and readiness, a recorded plan becomes `active` immediately before its first remaining effect, becomes `blocked` before a resumable blocker pause, resumes `active` only with resolved evidence and authority, and becomes `done` only after exactly one validated related outcome links reciprocally. Status records lifecycle; the outcome records `succeeded`, `partial`, `failed`, or `cancelled`.

Statuses: `draft`, `active`, `blocked`, `done`.
