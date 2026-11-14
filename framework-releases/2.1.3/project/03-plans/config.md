---
label: Plans
icon: list-checks
description: Bounded executable specifications.
recursive: false
kanban: true
statuses:
  - id: draft
    label: Draft
  - id: active
    label: Active
  - id: blocked
    label: Blocked
  - id: done
    label: Done
default_status: draft
record_type: plan
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
