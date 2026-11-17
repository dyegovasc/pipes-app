---
title: Framework Catalog
description: Generated inventory of canonical Pipes fragments, pipelines, loops, and rules.
version: 2.0
fragment_type: reference
domain: all
---
# Framework Catalog

**Total Fragments:** 110
**Total Pipelines:** 18
**Total Loops:** 5
**Total Rules:** 27

> Generated for discovery. The listed Markdown sources remain authoritative.

## Fragments By Type

### Context (2)

| Fragment | Path | Title | Domain | Description |
| --- | --- | --- | --- | --- |
| `fragment-instruction-surface-ownership` | `.pipes/utils/fragments/context/fragment-instruction-surface-ownership.md` | Instruction Surface Ownership | codebase | Describes the distinct ownership of project, architecture, and binding convention instructions. |
| `fragment-source-tree-execution-context` | `.pipes/utils/fragments/context/fragment-source-tree-execution-context.md` | Source Tree Execution Context | framework | Describes canonical write ownership for installed projects and staged starter maintenance. |

### Instruction (61)

| Fragment | Path | Title | Domain | Description |
| --- | --- | --- | --- | --- |
| `fragment-action-selection` | `.pipes/utils/fragments/instruction/fragment-action-selection.md` | Action Selection | project | Chooses the next bounded action that safely advances the mission. |
| `fragment-activate-mission` | `.pipes/utils/fragments/instruction/fragment-activate-mission.md` | Activate Mission | project | Records explicit execution approval and prepares an approved mission for its selected loop. |
| `fragment-analyze-codebase-context` | `.pipes/utils/fragments/instruction/fragment-analyze-codebase-context.md` | Analyze Codebase Context | codebase | Scans the codebase to understand its structure and identify modules relevant to the feature being planned. |
| `fragment-apply-plan-lifecycle-transition` | `.pipes/utils/fragments/instruction/fragment-apply-plan-lifecycle-transition.md` | Apply Plan Lifecycle Transition | project | Applies one authorized, evidence-backed, idempotent lifecycle transition to an executing recorded plan. |
| `fragment-assess-blast-radius` | `.pipes/utils/fragments/instruction/fragment-assess-blast-radius.md` | Assess Blast Radius | codebase | Assesses the potential impact and regression surface of the feature implementation. |
| `fragment-assess-decision-durability` | `.pipes/utils/fragments/instruction/fragment-assess-decision-durability.md` | Assess Decision Durability | project | Evaluates whether the proposed decision is durable enough to record and determines whether it overlaps with or supersedes existing decision records. |
| `fragment-assess-implementation-risks` | `.pipes/utils/fragments/instruction/fragment-assess-implementation-risks.md` | Assess Implementation Risks | codebase | Identifies implementation risks, regressions, and mitigations before any code is written. |
| `fragment-assess-plan-execution-readiness` | `.pipes/utils/fragments/instruction/fragment-assess-plan-execution-readiness.md` | Assess Plan Execution Readiness | project | Verifies exact plan approval, current fit, output routing, prior effects, blockers, and protected gates before execution. |
| `fragment-bind-team-roles-to-loop` | `.pipes/utils/fragments/instruction/fragment-bind-team-roles-to-loop.md` | Bind Team Roles To Loop | all | Assigns one owning role per loop phase and defines bounded consultation, handoff, and gate-authority relationships. |
| `fragment-capture-execution-outcome` | `.pipes/utils/fragments/instruction/fragment-capture-execution-outcome.md` | Capture Execution Outcome | project | Classifies what happened and records evidence, deviations, residual risk, and follow-up. |
| `fragment-check-existing-codebase-files` | `.pipes/utils/fragments/instruction/fragment-check-existing-codebase-files.md` | Check Existing Codebase Files | codebase | Resolves execution context and classifies existing project identity and convention contracts before drafting. |
| `fragment-check-greenfield-repository` | `.pipes/utils/fragments/instruction/fragment-check-greenfield-repository.md` | Check Greenfield Repository | codebase | Decides read-only and fail-closed whether a repository has no code yet, so that a workflow can set it up from declared choices instead of repository evidence. |
| `fragment-classify-feature-unknowns` | `.pipes/utils/fragments/instruction/fragment-classify-feature-unknowns.md` | Classify Feature Unknowns | codebase | Classifies unresolved items from feature framing so the pipeline asks the user only for what they own and defers repo-specific questions to later phases. |
| `fragment-create-decision-file` | `.pipes/utils/fragments/instruction/fragment-create-decision-file.md` | Create Decision File | project | Writes an approved durable decision without silently changing related records. |
| `fragment-create-eval-case` | `.pipes/utils/fragments/instruction/fragment-create-eval-case.md` | Create Eval Case | framework | Writes an approved eval case and runs it once to record whether it reproduces or guards the behavior. |
| `fragment-create-files` | `.pipes/utils/fragments/instruction/fragment-create-files.md` | Create Files | all | Writes an approved framework component and refreshes only its static generated surfaces. |
| `fragment-create-intent-file` | `.pipes/utils/fragments/instruction/fragment-create-intent-file.md` | Create Intent File | project | Writes an approved intent record without accepting it or creating downstream work automatically. |
| `fragment-create-mission-file` | `.pipes/utils/fragments/instruction/fragment-create-mission-file.md` | Create Mission File | project | Writes one approved draft mission record and stops without invoking its selected loop. |
| `fragment-create-outcome-file` | `.pipes/utils/fragments/instruction/fragment-create-outcome-file.md` | Create Outcome File | project | Writes an approved factual outcome for a mission or plan. |
| `fragment-create-plan-file` | `.pipes/utils/fragments/instruction/fragment-create-plan-file.md` | Create Plan File | codebase | Selects a canonical plan path and writes only the exact implementation plan approved for that target. |
| `fragment-create-spec-file` | `.pipes/utils/fragments/instruction/fragment-create-spec-file.md` | Create Spec File | project | Selects a canonical spec path and writes only the exact approved spec with a reciprocal link to its intent. |
| `fragment-create-team-member-file` | `.pipes/utils/fragments/instruction/fragment-create-team-member-file.md` | Create Team Member File | all | Creates an approved team member role file in the exact installed or starter-maintenance targets. |
| `fragment-decompose-mission-scope` | `.pipes/utils/fragments/instruction/fragment-decompose-mission-scope.md` | Decompose Mission Scope | project | Frames coherent mission delivery themes, dependencies, affected contract families, and planning classifications without producing an implementation plan. |
| `fragment-define-implementation-steps` | `.pipes/utils/fragments/instruction/fragment-define-implementation-steps.md` | Define Implementation Steps | codebase | Breaks the selected solution into a sequenced list of concrete implementation steps. |
| `fragment-define-loop-contract` | `.pipes/utils/fragments/instruction/fragment-define-loop-contract.md` | Define Loop Contract | all | Converts a distinct adaptive mission class into a readable Pipes loop. |
| `fragment-define-phases` | `.pipes/utils/fragments/instruction/fragment-define-phases.md` | Define Phases | all | Turns a deterministic workflow brief into explicit ordered phases. |
| `fragment-define-solution-architecture` | `.pipes/utils/fragments/instruction/fragment-define-solution-architecture.md` | Define Solution Architecture | codebase | Defines the architecture of the selected solution including data flow, component interactions, and a list of files to be created or modified. |
| `fragment-detect-delivery-profile` | `.pipes/utils/fragments/instruction/fragment-detect-delivery-profile.md` | Detect Delivery Profile | codebase | Derives the project's delivery facts from repository evidence so the delivery profile is evidence-backed, not invented. |
| `fragment-draft-architecture-instruction` | `.pipes/utils/fragments/instruction/fragment-draft-architecture-instruction.md` | Draft Architecture Instruction | codebase | Synthesizes confirmed architecture intent and repository evidence into a concise, factual canonical architecture draft. |
| `fragment-draft-codebase-conventions-rule` | `.pipes/utils/fragments/instruction/fragment-draft-codebase-conventions-rule.md` | Draft Codebase Conventions Rule | codebase | Drafts a binding codebase-conventions rule using the live Pipes governance schema and repository evidence. |
| `fragment-draft-project-instruction` | `.pipes/utils/fragments/instruction/fragment-draft-project-instruction.md` | Draft Project Instruction | codebase | Composes an evidence-backed project instruction while preserving established identity and ownership commitments. |
| `fragment-draft-spec-requirements` | `.pipes/utils/fragments/instruction/fragment-draft-spec-requirements.md` | Draft Spec Requirements | project | Derives numbered, testable requirements from an accepted intent and the current system context. |
| `fragment-draft-test-strategy` | `.pipes/utils/fragments/instruction/fragment-draft-test-strategy.md` | Draft Test Strategy | codebase | Documents the test coverage plan for the feature implementation. |
| `fragment-establish-scope-guardrails` | `.pipes/utils/fragments/instruction/fragment-establish-scope-guardrails.md` | Establish Scope Guardrails | codebase | Defines explicit in-scope and out-of-scope boundaries and safety constraints for the feature implementation. |
| `fragment-execute-approved-plan` | `.pipes/utils/fragments/instruction/fragment-execute-approved-plan.md` | Execute Approved Plan | project | Executes only ready approved plan steps with explicit recovery, deviation, protected-action, and validation stops. |
| `fragment-execution` | `.pipes/utils/fragments/instruction/fragment-execution.md` | Execution | project | Performs a selected action within scope while preserving evidence and user-owned changes. |
| `fragment-extract-policy-candidates` | `.pipes/utils/fragments/instruction/fragment-extract-policy-candidates.md` | Extract Policy Candidates | codebase | Groups the rules stated across repositories into project-wide policy candidates, conflicts, gaps, and repository-specific rules, each with sources. |
| `fragment-gate-evaluation` | `.pipes/utils/fragments/instruction/fragment-gate-evaluation.md` | Gate Evaluation | project | Decides whether the loop should continue or stop at a consequential boundary. |
| `fragment-generate-solution-hypotheses` | `.pipes/utils/fragments/instruction/fragment-generate-solution-hypotheses.md` | Generate Solution Hypotheses | codebase | Generates multiple distinct solution approaches for the feature, each with trade-offs assessed. |
| `fragment-identify-fragments` | `.pipes/utils/fragments/instruction/fragment-identify-fragments.md` | Identify Fragments | all | Determines which fragments to reuse and which to create. |
| `fragment-invoke-pipeline` | `.pipes/utils/fragments/instruction/fragment-invoke-pipeline.md` | Invoke Pipeline | framework | Runs another Pipes pipeline as one step of an orchestrating pipeline, keeping its gates and returning its outputs. |
| `fragment-isolate-review-worktree` | `.pipes/utils/fragments/instruction/fragment-isolate-review-worktree.md` | Isolate Review Worktree | codebase | Checks out the change under review in a temporary git worktree and finds its upstream Pipes records. |
| `fragment-map-system-boundaries` | `.pipes/utils/fragments/instruction/fragment-map-system-boundaries.md` | Map System Boundaries | codebase | Maps system boundaries, ownership, flows, integrations, and affected components at whole-system or feature scope. |
| `fragment-mission-framing` | `.pipes/utils/fragments/instruction/fragment-mission-framing.md` | Mission Framing | project | Defines the objective, scope, operating envelope, validation, and real stop conditions for adaptive work. |
| `fragment-mission-journal-contract` | `.pipes/utils/fragments/instruction/fragment-mission-journal-contract.md` | Mission Journal Contract | project | Requires real local timestamps and append-only ascending Journal chronology for mission lifecycle writes. |
| `fragment-observation` | `.pipes/utils/fragments/instruction/fragment-observation.md` | Observation | project | Gathers the smallest set of fresh facts needed to choose the next useful action. |
| `fragment-read-mission-record` | `.pipes/utils/fragments/instruction/fragment-read-mission-record.md` | Read Mission Record | project | Extracts the readable execution contract from one selected mission without changing it. |
| `fragment-read-plan-record` | `.pipes/utils/fragments/instruction/fragment-read-plan-record.md` | Read Plan Record | project | Extracts scope, work, constraints, and acceptance evidence from an approved plan. |
| `fragment-read-project-instruction` | `.pipes/utils/fragments/instruction/fragment-read-project-instruction.md` | Read Project Instruction | codebase | Loads established project, architecture, and convention instructions and identifies evidence gaps for live codebase inspection. |
| `fragment-reflection` | `.pipes/utils/fragments/instruction/fragment-reflection.md` | Reflection | project | Uses validation and new evidence to decide whether to continue, change strategy, or stop. |
| `fragment-route-supporting-artifacts` | `.pipes/utils/fragments/instruction/fragment-route-supporting-artifacts.md` | Route Supporting Artifacts | project | Decides where generated outputs should live so outcomes remain records and artifacts remain supporting attachments. |
| `fragment-select-loop` | `.pipes/utils/fragments/instruction/fragment-select-loop.md` | Select Loop | project | Selects the best of the five starter loops for a mission. |
| `fragment-select-solution` | `.pipes/utils/fragments/instruction/fragment-select-solution.md` | Select Solution | codebase | Evaluates generated solution hypotheses and selects the optimal approach based on fit, risk, and maintainability. |
| `fragment-state-update` | `.pipes/utils/fragments/instruction/fragment-state-update.md` | State Update | project | Refreshes the readable mission sections and compact journal after meaningful progress. |
| `fragment-strategy` | `.pipes/utils/fragments/instruction/fragment-strategy.md` | Strategy | project | Chooses the lightest safe route from current evidence to the mission objective. |
| `fragment-survey-workspace-repositories` | `.pipes/utils/fragments/instruction/fragment-survey-workspace-repositories.md` | Survey Workspace Repositories | codebase | Lists the repositories a workspace covers and reads their agent and architecture docs read-only as evidence. |
| `fragment-sync-record-statuses` | `.pipes/utils/fragments/instruction/fragment-sync-record-statuses.md` | Sync Record Statuses | project | Proposes conservative related-record updates after meaningful progress or closure. |
| `fragment-tally-review-findings` | `.pipes/utils/fragments/instruction/fragment-tally-review-findings.md` | Tally Review Findings | codebase | Combines verifier and reviewer findings into one severity tally and verdict without approving the change. |
| `fragment-understanding` | `.pipes/utils/fragments/instruction/fragment-understanding.md` | Understanding | project | Separates facts, assumptions, unknowns, risks, and meaningful choices. |
| `fragment-validation` | `.pipes/utils/fragments/instruction/fragment-validation.md` | Validation | project | Tests the current result against objective, acceptance, and quality criteria. |
| `fragment-write-architecture-instruction` | `.pipes/utils/fragments/instruction/fragment-write-architecture-instruction.md` | Write Architecture Instruction | codebase | Writes an exact approved architecture instruction in installed or starter-maintenance context and refreshes configured wrappers. |

### Output (17)

| Fragment | Path | Title | Domain | Description |
| --- | --- | --- | --- | --- |
| `fragment-format-accountability-matrix` | `.pipes/utils/fragments/output/fragment-format-accountability-matrix.md` | Format Accountability Matrix | project | Formats the accountability matrix that maps each delivery gate to the human role that decides it and where the holder is resolved. |
| `fragment-format-architecture-instruction` | `.pipes/utils/fragments/output/fragment-format-architecture-instruction.md` | Format Architecture Instruction | codebase | Formats the canonical system architecture instruction with stable sections, factual boundaries, and explicit evolution notes. |
| `fragment-format-codebase-conventions-rule` | `.pipes/utils/fragments/output/fragment-format-codebase-conventions-rule.md` | Format Codebase Conventions Rule | codebase | Template for formatting the codebase conventions rule with the shared rule frontmatter schema. |
| `fragment-format-decision-record` | `.pipes/utils/fragments/output/fragment-format-decision-record.md` | Format Decision Record | project | Formats a durable choice with context, alternatives, and consequences. |
| `fragment-format-declared-surface` | `.pipes/utils/fragments/output/fragment-format-declared-surface.md` | Format Declared Surface | codebase | Marks a project surface drafted from declared choices, cites the decision or statement it comes from, and records it in the Declared Setup table of project.md. |
| `fragment-format-delivery-profile` | `.pipes/utils/fragments/output/fragment-format-delivery-profile.md` | Format Delivery Profile | codebase | Formats the Markdown delivery profile that hooks, rules, and workflows read for project delivery facts. |
| `fragment-format-eval-case` | `.pipes/utils/fragments/output/fragment-format-eval-case.md` | Format Eval Case | framework | Formats one behavioral eval case as JSON for the Pipes eval runner. |
| `fragment-format-implementation-plan` | `.pipes/utils/fragments/output/fragment-format-implementation-plan.md` | Format Implementation Plan | codebase | Formats framing, codebase evidence, solution design, implementation work, tests, and risks into an executable Markdown plan. |
| `fragment-format-intent-record` | `.pipes/utils/fragments/output/fragment-format-intent-record.md` | Format Intent Record | project | Formats an intent record with the problem, proposed outcome, success checks, affected systems, constraints, open questions, and source. |
| `fragment-format-mission-record` | `.pipes/utils/fragments/output/fragment-format-mission-record.md` | Format Mission Record | project | Formats a compact draft mission record without starting its selected loop. |
| `fragment-format-outcome-record` | `.pipes/utils/fragments/output/fragment-format-outcome-record.md` | Format Outcome Record | project | Formats factual closure for a mission or plan. |
| `fragment-format-policy-rule` | `.pipes/utils/fragments/output/fragment-format-policy-rule.md` | Format Policy Rule | codebase | Formats a project policy rule that agents load as a skill and that cites the repositories it comes from. |
| `fragment-format-project-instruction` | `.pipes/utils/fragments/output/fragment-format-project-instruction.md` | Format Project Instruction | codebase | Defines the canonical markdown structure for `.pipes/ai-instructions/project.md`. |
| `fragment-format-release-notes` | `.pipes/utils/fragments/output/fragment-format-release-notes.md` | Format Release Notes | codebase | Formats release notes for one version from its plan, spec requirements, and merged pull requests. |
| `fragment-format-review-record` | `.pipes/utils/fragments/output/fragment-format-review-record.md` | Format Review Record | codebase | Formats a review of one change as a durable artifact record linked to its plan. |
| `fragment-format-spec-record` | `.pipes/utils/fragments/output/fragment-format-spec-record.md` | Format Spec Record | project | Formats a spec with numbered requirements, design, constraint coverage, open questions, areas of concern, and risk class. |
| `fragment-format-team-member-record` | `.pipes/utils/fragments/output/fragment-format-team-member-record.md` | Format Team Member Record | all | Defines the canonical markdown structure for a .pipes/team role file. |

### Question (20)

| Fragment | Path | Title | Domain | Description |
| --- | --- | --- | --- | --- |
| `fragment-ask-delivery-approach` | `.pipes/utils/fragments/question/fragment-ask-delivery-approach.md` | Ask Delivery Approach | project | Captures an informed spec-driven or adaptive mission delivery choice only when both routes are valid. |
| `fragment-ask-feature-requirements` | `.pipes/utils/fragments/question/fragment-ask-feature-requirements.md` | Ask Feature Requirements | codebase | Gathers the feature description, requirements, and success criteria from the user. |
| `fragment-ask-gate-holders` | `.pipes/utils/fragments/question/fragment-ask-gate-holders.md` | Ask Gate Holders | project | Asks who holds each human role that decides a delivery gate, with evidence-based defaults. |
| `fragment-ask-greenfield-choices` | `.pipes/utils/fragments/question/fragment-ask-greenfield-choices.md` | Ask Greenfield Choices | codebase | Captures the stack, conventions, architecture direction, and policies of a repository with no code as declared choices, each with a revisit trigger. |
| `fragment-ask-loop-intent` | `.pipes/utils/fragments/question/fragment-ask-loop-intent.md` | Ask Loop Intent | all | Captures the adaptive mission class, boundaries, authority, evidence, and stop behavior a new loop must govern. |
| `fragment-ask-mission-definition` | `.pipes/utils/fragments/question/fragment-ask-mission-definition.md` | Ask Mission Definition | project | Captures only the material information missing from a new mission frame. |
| `fragment-ask-mission-selection` | `.pipes/utils/fragments/question/fragment-ask-mission-selection.md` | Ask Mission Selection | project | Identifies the single recorded mission the user wants to start or resume. |
| `fragment-ask-pipeline-intent` | `.pipes/utils/fragments/question/fragment-ask-pipeline-intent.md` | Ask Pipeline Intent | all | Captures the deterministic outcome, users, boundaries, phases, gates, and evidence a new pipeline must govern. |
| `fragment-ask-project-context` | `.pipes/utils/fragments/question/fragment-ask-project-context.md` | Ask Project Context | codebase | Resolves only project identity and ownership choices that repository evidence cannot establish. |
| `fragment-ask-stack-details` | `.pipes/utils/fragments/question/fragment-ask-stack-details.md` | Ask Stack Details | codebase | Resolves only intended stack and convention choices that remain after repository inspection. |
| `fragment-ask-system-architecture` | `.pipes/utils/fragments/question/fragment-ask-system-architecture.md` | Ask System Architecture | codebase | Captures system boundaries, workflows, components, state, integrations, operational constraints, and planned evolution for the canonical architecture instruction. |
| `fragment-ask-team-member-definition` | `.pipes/utils/fragments/question/fragment-ask-team-member-definition.md` | Ask Team Member Definition | all | Gathers the fields needed to define a reusable AI team role. |
| `fragment-capture-decision-candidate` | `.pipes/utils/fragments/question/fragment-capture-decision-candidate.md` | Capture Decision Candidate | project | Captures the core fields needed to define a durable decision record. |
| `fragment-capture-eval-source` | `.pipes/utils/fragments/question/fragment-capture-eval-source.md` | Capture Eval Source | framework | Captures the behavior an eval case must prove and the evidence it comes from. |
| `fragment-capture-intent-source` | `.pipes/utils/fragments/question/fragment-capture-intent-source.md` | Capture Intent Source | project | Captures the problem, proposed outcome, success checks, and origin needed to draft an intent record. |
| `fragment-clarify-shared-decisions` | `.pipes/utils/fragments/question/fragment-clarify-shared-decisions.md` | Clarify Shared Decisions | codebase | Asks only the remaining high-impact questions that still matter after the codebase has been inspected and a recommended approach has been selected. |
| `fragment-confirm-acceptance-criteria` | `.pipes/utils/fragments/question/fragment-confirm-acceptance-criteria.md` | Confirm Acceptance Criteria | codebase | Confirms final acceptance criteria, blockers, and execution preconditions before plan generation. |
| `fragment-reframe-intent` | `.pipes/utils/fragments/question/fragment-reframe-intent.md` | Reframe Intent | all | Presents a compact framing package so the user can confirm product intent, scope, and success before downstream work. |
| `fragment-request-approval` | `.pipes/utils/fragments/question/fragment-request-approval.md` | Request Approval | all | Requests exact approval for displayed content, target paths, and bounded creation effects. |
| `fragment-request-phase-approval` | `.pipes/utils/fragments/question/fragment-request-phase-approval.md` | Request Phase Approval | all | Requests approval from the active gate authority before the pipeline advances to the next phase. |

### Validation (10)

| Fragment | Path | Title | Domain | Description |
| --- | --- | --- | --- | --- |
| `fragment-assess-mission-execution-readiness` | `.pipes/utils/fragments/validation/fragment-assess-mission-execution-readiness.md` | Assess Mission Execution Readiness | project | Determines whether a recorded mission can safely start or resume under an explicit execution approval. |
| `fragment-assess-mission-readiness` | `.pipes/utils/fragments/validation/fragment-assess-mission-readiness.md` | Assess Mission Readiness | project | Verifies that a compact draft mission is complete and safe to record without starting execution. |
| `fragment-assess-team-role-overlap` | `.pipes/utils/fragments/validation/fragment-assess-team-role-overlap.md` | Assess Team Role Overlap | all | Checks a proposed team member against existing roles before creating a new file. |
| `fragment-audit-plan-ambiguity` | `.pipes/utils/fragments/validation/fragment-audit-plan-ambiguity.md` | Audit Plan Ambiguity | codebase | Classifies whether a generated implementation plan is clear or blocking by auditing execution ambiguity. |
| `fragment-check-existing-architecture-instruction` | `.pipes/utils/fragments/validation/fragment-check-existing-architecture-instruction.md` | Check Existing Architecture Instruction | codebase | Determines whether the canonical architecture instruction is missing, placeholder, or established and identifies safe create or update boundaries. |
| `fragment-lint-feature-questions` | `.pipes/utils/fragments/validation/fragment-lint-feature-questions.md` | Lint Feature Questions | codebase | Validates follow-up feature questions so agents ask only user-owned questions during early framing. |
| `fragment-validate-architecture-instruction` | `.pipes/utils/fragments/validation/fragment-validate-architecture-instruction.md` | Validate Architecture Instruction | codebase | Checks that a proposed architecture instruction is complete, evidence-aware, correctly scoped, internally consistent, and safe to assemble. |
| `fragment-validate-loop-contract` | `.pipes/utils/fragments/validation/fragment-validate-loop-contract.md` | Validate Loop Contract | all | Verifies that a proposed loop is distinct, adaptive, readable, resolvable, and safe. |
| `fragment-validate-plan-consistency` | `.pipes/utils/fragments/validation/fragment-validate-plan-consistency.md` | Validate Plan Consistency | codebase | Checks whether an approved implementation plan matches its readable record contract, current project lineage, and live codebase before execution. |
| `fragment-validate-reuse-opportunities` | `.pipes/utils/fragments/validation/fragment-validate-reuse-opportunities.md` | Validate Reuse Opportunities | all | Check that the proposed fragments maximize reuse and avoid duplication. |

## Pipelines

| Pipeline | Title | Category | Domain | Description |
| --- | --- | --- | --- | --- |
| `pipeline-add-eval` | Add Eval | record | framework | Turns an incident, a repeated agent mistake, or a new contract into a behavioral eval case for this repository's agent configuration. |
| `pipeline-bootstrap-greenfield` | Bootstrap Greenfield | definition | framework | Sets up a repository with no code from declared choices, marks each surface as declared with a revisit trigger, and leaves the workspace ready for its first intent and spec, keeping every gate. |
| `pipeline-bootstrap-workspace` | Bootstrap Workspace | definition | framework | Sets up a new Pipes workspace in order, from project identity and an optional delivery profile to policies, architecture, generated surfaces, and evals, keeping every gate of the pipelines it runs. |
| `pipeline-capture-intent` | Capture Intent | record | project | Turns an idea, ticket, or incident into one intent record that the product owner accepts or rejects before design starts. |
| `pipeline-create-loop` | Create Loop | creation | framework | Designs and creates a distinct adaptive Pipes loop and refreshes its generated discovery surfaces. |
| `pipeline-create-pipeline` | Create Pipeline | creation | framework | Designs and creates a deterministic fragment-driven Pipes workflow. |
| `pipeline-create-team-member` | Create Team Member | creation | team | Defines a reusable Pipes role with clear ownership, boundaries, consultation, and handoffs. |
| `pipeline-define-codebase-stack` | Define Codebase Stack | definition | codebase | Establishes evidence-backed project identity, repository boundaries, working stack, binding local conventions, and, when the user opts in, a delivery profile and gate accountability. |
| `pipeline-define-policies` | Define Policies | definition | codebase | Derives project policy rules from the rules the repositories already state, keeps conflicts and gaps out as recorded open points, and delivers each policy as a skill. |
| `pipeline-define-system-architecture` | Define System Architecture | definition | architecture | Builds or refreshes an evidence-backed architecture instruction with explicit ownership, write context, and preservation gates. |
| `pipeline-design-spec` | Design Spec | planning | project | Turns one accepted intent into a spec with numbered requirements and a design grounded in the affected repositories. |
| `pipeline-execute-mission` | Execute Mission | delivery | project | Loads a recorded mission, validates readiness, obtains explicit execution approval, and starts its selected loop. |
| `pipeline-execute-plan` | Execute Approved Plan | delivery | project | Executes a bounded approved plan, validates the result, and reports factual closure. |
| `pipeline-plan-new-feature` | New Feature Implementation Plan | planning | codebase | Frames a feature, grounds it in live codebase evidence, selects a solution, and produces a validated executable plan before implementation begins. |
| `pipeline-record-decision` | Record Decision | record | project | Captures an approved durable choice with context, alternatives, and consequences. |
| `pipeline-release-change` | Release Change | delivery | codebase | Releases or promotes a reviewed and merged change through its environments and release workflows, behind gate G5, and records the release in the outcome. |
| `pipeline-review-change` | Review Change | delivery | codebase | Reviews one pull request or branch against its plan, spec, and project policies with a verifier and a non-author reviewer, and hands a recommendation to the code owner. |
| `pipeline-start-mission` | Start Mission | orchestration | project | Frames and records a compact draft mission without starting its execution. |

## Loops

| Loop | Title | Type | Primary Role | Description |
| --- | --- | --- | --- | --- |
| `loop-artifact-production` | Artifact Production Loop | artifact | roadmapper | Produce, inspect, revise, and deliver a bounded artifact with source fidelity. |
| `loop-concept-development` | Concept Development Loop | concept | visionaire | Turn ambiguous source material into a coherent, evidence-aware direction. |
| `loop-feature-delivery` | Feature Delivery Loop | delivery | full-stack-tech-lead | Plan, implement, and validate a bounded feature through adaptive delivery. |
| `loop-framework-maintenance` | Framework Maintenance Loop | maintenance | roadmapper | Evolve Pipes Markdown contracts and keep their generated discovery surfaces current. |
| `loop-investigation-and-recovery` | Investigation And Recovery Loop | recovery | full-stack-tech-lead | Diagnose failures, test hypotheses, recover safely, and prove the result. |

## Rules

| Rule | Title | Type | Enforcement | Description |
| --- | --- | --- | --- | --- |
| `rule-area-config-compliance` | Area Config Compliance | governance | binding | Requires project records to follow the small contract declared by their area. |
| `rule-artifact-record-contract` | Artifact Record Contract | record | binding | Defines generated artifact metadata, naming, source relationships, preservation, and verified creation. |
| `rule-asd-ste100-writing` | ASD-STE100 Writing | communication | binding | Requires every authored document to use clear language inspired by ASD-STE100 while preserving its requested language and technical meaning. |
| `rule-authority-precedence` | Authority Precedence | governance | binding | Applies the strictest relevant permission, rule, loop, pipeline, and user gate. |
| `rule-auto-update-catalog` | Auto Update Catalog | record | binding | Requires the generated fragment, pipeline, loop, and rule catalog to match the live starter-kit inventory. |
| `rule-capture-decision-candidates` | Capture Decision Candidates | record | advisory | Detects durable choices and routes them to decision capture instead of leaving them only in conversation or implementation notes. |
| `rule-capture-pipeline-incidents` | Capture Pipeline Incidents | safety | advisory | Routes durable Pipes workflow failures to concise issue records without interrupting remediation. |
| `rule-codebase-conventions` | Codebase Conventions | governance | binding | Setup-required project rule that binds implementation work to the repository's actual stack, architecture, and local conventions. |
| `rule-commit-guardrails` | Commit Guardrails | safety | binding | Protects staging, commits, pushes, publishing, and deployments from happening without explicit scope and approval. |
| `rule-deterministic-enforcement` | Deterministic Enforcement | governance | binding | Requires every rule to declare how it is enforced and backs protected effects with hooks, CI checks, or managed settings. |
| `rule-durable-record-routing` | Durable Record Routing | record | binding | Places durable information in the record type that owns it. |
| `rule-evidence-and-validation` | Evidence And Validation | validation | binding | Requires completion claims to be supported by relevant concrete checks. |
| `rule-framework-provenance` | Framework Provenance | governance | binding | Defines deterministic framework release metadata, ownership, versioning, and installed-provenance safety. |
| `rule-frontmatter-title-only` | Frontmatter-Only Title | record | binding | Requires every Pipes-generated project record, AI instruction, and project-configured rule to keep its title solely in frontmatter, with no restated title in the body. |
| `rule-generated-html-design` | Generated HTML Design | validation | binding | Requires generated HTML artifacts to follow the app design tokens, typography, shadcn component patterns, and light and dark themes. |
| `rule-local-pipeline-invocation` | Local Pipeline Invocation | governance | binding | Makes canonical Markdown pipelines the deterministic workflow source inside and outside loops. |
| `rule-mission-state-integrity` | Mission State Integrity | governance | binding | Keeps mission state concise, readable, current, and useful for the next action. |
| `rule-output-writing-style` | Output Writing Style | communication | binding | Requires concise Pipes prose blocks to remain on one physical Markdown line. |
| `rule-plan-state-integrity` | Plan State Integrity | record | binding | Keeps recorded plan lifecycle state accurate and requires one validated outcome before terminal closure. |
| `rule-pure-markdown-writing` | Pure Markdown Writing | validation | binding | Prohibits raw HTML in renderable Pipes Markdown and requires validation at every document boundary. |
| `rule-question-options-format` | Question Options Format | question | binding | Keeps selectable questions concise, distinct, and easy to answer. |
| `rule-record-versioning` | Record Versioning | record | binding | Uses one simple semantic version for substantive Markdown record changes. |
| `rule-recovery-and-idempotency` | Recovery And Idempotency | safety | binding | Prevents interrupted or retried work from duplicating effects or hiding uncertainty. |
| `rule-scope-control` | Scope Control | governance | binding | Prevents silent scope expansion and requires out-of-scope work, deferred work, and protected changes to remain explicit. |
| `rule-separation-of-duties` | Separation Of Duties | governance | binding | Keeps the author of an intent, spec, plan, or diff from approving it and requires a non-author reviewer pass before human gates. |
| `rule-starter-kit-integrity` | Starter Kit Integrity | validation | binding | Keeps canonical Markdown and its small generated discovery surfaces coherent. |
| `rule-validate-fragment-types` | Validate Fragment Types | validation | binding | Enforces fragment frontmatter, directory, naming, and required-section contracts before reuse. |
