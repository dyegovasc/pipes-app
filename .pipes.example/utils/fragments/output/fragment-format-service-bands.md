---
title: Format Service Bands
description: Formats a bands.yaml that declares a service's monitored signals, normal bands, and the agent's diagnose and act thresholds.
version: 1.0
fragment_type: output
domain: codebase
---
# Fragment: Format Service Bands

## Format

Produce `bands.yaml` for the root of one backend service repository. It declares the signals that `loop-investigation-and-recovery` watches, the normal band of each signal, and two thresholds: at `diagnose` (about 2σ outside the normal band) the agent investigates and reports; at `act` (about 3σ) the agent may propose a fix or a runbook action through the gates, never apply it on its own. Propose this file only when the signal source exists; a band without a source is not monitoring. Every signal has an owner role from `.pipes/ai-instructions/accountability.md`, which decides gate G7.

## Template

```yaml
service: {service repository name}
owner_role: {service owner role}
signals:
  - name: {signal name, for example http_server_error_rate}
    source: {metrics query, log query, or dashboard panel}
    unit: {percent, ms, count per minute}
    normal: { min: {value}, max: {value} }
    diagnose: { above: {value} }
    act: { above: {value} }
    runbook: {link to the runbook section}
```
