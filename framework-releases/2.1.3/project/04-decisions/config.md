---
label: Decisions
icon: gavel
description: Durable choices and their consequences.
recursive: false
kanban: false
statuses:
  - id: proposed
    label: Proposed
  - id: accepted
    label: Accepted
  - id: superseded
    label: Superseded
default_status: proposed
record_type: decision
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
---
