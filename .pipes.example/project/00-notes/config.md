---
label: Notes
icon: sticky-note
description: Source material, research, and exploratory context.
recursive: false
kanban: false
statuses:
  - id: draft
    label: Draft
  - id: final
    label: Final
default_status: draft
record_type: note
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
