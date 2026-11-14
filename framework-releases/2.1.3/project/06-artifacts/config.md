---
label: Artifacts
icon: package
description: Supporting evidence, exports, and generated assets.
recursive: true
supported_extensions: [md, html]
kanban: false
statuses:
  - id: draft
    label: Draft
  - id: final
    label: Final
default_status: draft
record_type: artifact
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
