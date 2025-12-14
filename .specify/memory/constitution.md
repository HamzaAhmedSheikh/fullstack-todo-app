<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0 (MAJOR: Complete constitution replacement with hackathon requirements)
Modified principles: All 6 principles completely replaced with hackathon constitution principles
Added sections: Accuracy & Verification, Specification First, Professional Code Quality, Clean Code, Test-First Development, Evolutionary Architecture, User Experience First, Development Workflow
Removed sections: Template placeholder sections
Templates requiring updates:
- .specify/templates/plan-template.md ⚠ pending
- .specify/templates/spec-template.md ⚠ pending
- .specify/templates/tasks-template.md ⚠ pending
- .specify/templates/commands/*.md ⚠ pending
Runtime docs: README.md ⚠ pending
Deferred items: RATIFICATION_DATE marked as TODO
-->

# AI-Native Todo System Constitution

## Core Principles

### Accuracy & Verification
All features MUST work exactly as specified. All APIs MUST be verified through testing. All code MUST run without errors. All AI tool-calls MUST be validated and logged.

### Specification First (Spec-Driven Development)
Before any code is written: A complete specification MUST exist. Specs MUST define intent, constraints, and success criteria. All implementation MUST align with the approved spec. No "code-first" development is allowed.

### Professional Code Quality
Clean folder structure. Meaningful commit messages. Modular and readable code. No unnecessary complexity. All environment variables MUST be secured.

### Clean Code (Mandatory for All Phases)
Code MUST comply with PEP 8. All functions & classes MUST include type hints. All public functions/classes/modules MUST have docstrings. Variable/function names MUST be descriptive. Maximum line length: 100 characters. Imports MUST be organized in standard library, third-party, local modules order.

### Test-First Development (TDD Is Non-Negotiable)
All implementation MUST follow the Red → Green → Refactor cycle. Tests MUST be written before implementation. Tests MUST fail before implementation (Red phase). Code MUST be minimal to pass tests (Green phase). Refactor while keeping tests passing (Refactor phase). Tests MUST cover unit tests, edge cases, and error conditions. pytest MUST be used.

### Evolutionary Architecture
The architecture MUST support future phases while implementing only the requirements of the current phase. Use abstractions so components can evolve without rewrites. Phase I uses in-memory storage, but MUST define interfaces that later map to DB. Avoid premature optimization. Follow YAGNI (You Aren't Gonna Need It). Document all major architectural decisions (ADR). Storage, logic, and interaction layers MUST be swappable.

### User Experience First
All user-facing interactions—CLI, UI, chatbot—MUST prioritize clarity and helpfulness. Prompts MUST clearly state expected input. Error messages MUST guide the user toward fixing input. Menu options MUST be numbered and consistent. Destructive actions MUST require confirmation. Success/error feedback MUST be immediate. Input validation MUST be explicit and helpful.

## Development Workflow (Mandatory)
The following Spec-Driven Development Workflow MUST be followed: 1. Constitution → /sp.constitution (Define or update governing principles). 2. Specify → /sp.specify (Write the feature specification). 3. Clarify → /sp.clarify (Clear ambiguities and refine understanding). 4. Plan → /sp.plan (Create technical implementation plan). 5. Tasks → /sp.tasks (Break work into testable tasks). 6. Implement → /sp.implement (Execute using Red-Green-Refactor). 7. Document → /sp.adr (Record architectural decisions). 8. Record → /sp.phr (Maintain Prompt History Records for traceability). Quality Gates: Specifications MUST be approved before implementation. All tests MUST pass before marking a task complete. PHR MUST be created after significant interactions.

## Governance
Specifications MUST be approved before implementation. All tests MUST pass before marking a task complete. PHR MUST be created after significant interactions. Reviewers MUST reject work that violates the Constitution. Participants MUST fix violations before approval. Specifications MUST be updated if conflict with Constitution. When conflicts arise: The Constitution overrides all other documents.

**Version**: 1.1 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-12-12