---
label: Outcomes
icon: check-circle-2
description: Factual closure for missions and plans.
recursive: false
kanban: false
statuses:
  - id: recorded
    label: Recorded
  - id: superseded
    label: Superseded
default_status: recorded
record_type: outcome
fields:
  - id: title
    label: Title
    type: text
  - id: description
    label: Description
    type: textarea
  - id: version
    label: Version
    type: text
  - id: created
    label: Created
    type: date
  - id: status
    label: Status
    type: text
  - id: related
    label: Related files
    type: file-selector
  - id: result
    label: Result
    type: text
---
