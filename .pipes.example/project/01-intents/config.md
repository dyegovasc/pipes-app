---
label: Intents
icon: target
description: Problem statements and proposed outcomes accepted for design.
recursive: false
kanban: true
statuses:
  - id: draft
    label: Draft
  - id: accepted
    label: Accepted
  - id: rejected
    label: Rejected
  - id: done
    label: Done
  - id: superseded
    label: Superseded
default_status: draft
record_type: intent
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
