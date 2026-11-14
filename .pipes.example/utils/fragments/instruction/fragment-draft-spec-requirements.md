---
title: Draft Spec Requirements
description: Derives numbered, testable requirements from an accepted intent and the current system context.
version: 1.1
fragment_type: instruction
domain: project
---
# Fragment: Draft Spec Requirements

## Instructions

1. Read the accepted intent's problem, proposed outcome, How Do We Know It Works checks, affected users and systems, constraints, and open questions.
2. Derive the smallest set of requirements that delivers the proposed outcome. Each requirement states one observable behavior or quality, names the affected service when it is service-specific, and can be proved by a test or check.
3. Derive the requirements and their acceptance checks from the intent's `## How Do We Know It Works` checks. Cover every intent check with at least one requirement, and end each requirement that derives from a check with a trace to it, for example `(intent check 2)`, where the number is the position of the check in the intent's list, starting at 1. The requirement statement and its trace together are its acceptance check. A requirement that no intent check covers is allowed only when the proposed outcome or a constraint needs it; mark it `(no intent check)`. When the intent has no such section or no known checks, derive requirements from the proposed outcome and record the missing checks as an open question for the product owner.
4. Number the requirements `R1`, `R2`, and so on, without gaps. Write each one as `- **R{n}** {requirement}`.
5. Map every intent constraint to the requirements and design elements that meet it. Surface a constraint that no requirement covers as an open question or an area of concern.
6. Carry each unanswered intent question forward. Answer it from evidence when the repositories or records can answer it; otherwise keep it open and name the owner role.
7. Record security, privacy, compliance, performance, and data concerns as areas of concern, each with an owner role from the Accountability Matrix.
8. Classify the risk as `higher` when the change touches money, bookings, personal data, authentication, a shared contract used by more than one service, or a data migration; otherwise classify it as `routine`.
9. Do not add requirements outside the intent's proposed outcome. Surface them as a scope question for the product owner.

## Output

- Numbered requirements, each traced to its intent check
- Constraint coverage
- Open questions and areas of concern with owner roles
- Risk class with reason
