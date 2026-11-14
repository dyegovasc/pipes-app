# Outcomes

Outcomes record factual closure for a mission or recorded plan. Use `outcome-{number}-{slug}.md`, include the source mission or plan in `related`, and add the outcome path to that source record's `related` list only when that related-record write is explicitly approved. Both lists use unique, readable project-relative paths. State validation, deviations, residual risk, and follow-up.

A terminal recorded plan requires exactly one validated reciprocal outcome before becoming `done`; retry reuses the matching outcome and stops on multiple or contradictory candidates. Approved inline plan content has no mandatory plan outcome because no source plan record exists. Plan and mission outcomes remain distinct even when the plan executes inside a mission.

Statuses: `recorded`, `superseded`. Results: `succeeded`, `partial`, `failed`, or `cancelled`.
