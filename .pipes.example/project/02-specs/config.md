---
label: Specs
icon: file-text
description: Accepted requirements and design that plans implement and cite by requirement ID.
recursive: false
kanban: true
statuses:
  - id: draft
    label: Draft
  - id: accepted
    label: Accepted
  - id: superseded
    label: Superseded
default_status: draft
record_type: spec
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
