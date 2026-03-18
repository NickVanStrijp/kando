# AGENTS.md

## Kando Overview

Kando is a local-first desktop application for AI-assisted product development and software delivery.

Kando helps users move from product idea to implementation through a structured workflow:

- Workspace creation
- Product overview capture
- Stack selection and stack lock
- Tech implementation decision lock (state management, API architecture, data validation, authentication strategy, UI component libraries, styling conventions, and testing patterns)
- PRD creation
- Epic creation
- Story creation and story detail expansion
- Dev task and test task creation
- Planning before execution
- Repo-aware implementation workflows
- Git review and worktree-based task isolation
- Context-aware chat with agents
- Multi-model routing by workflow step

Kando is not a generic chatbot. It is a structured workspace-based product development workstation.

---

## Core Product Principles

1. **Artifacts are the source of truth**
   - Product Overview
   - Tech Implementation Locks
   - PRDs
   - Epics
   - Stories
   - Tasks
   - Implementation Plans
   - Execution records

2. **Planning before coding**
   No code execution should happen before an implementation plan exists and is approved. Tests should be written before feature code. 

3. **Local-first architecture**
   Kando should work without a required cloud backend. Local filesystem and local database are primary.

4. **Workspace-first information architecture**
   The top-level unit is a workspace, not a repo.

5. **Repo-aware execution**
   Repos are attached to workspaces and used for planning, file exploration, and code execution.

6. **Human approval gates**
   Artifacts must be reviewed and approved by a human before downstream work can be completed.

7. **Safe agent operation**
   Agents must run with constrained permissions, isolation, and clear auditability.

8. **Model-agnostic orchestration**
   Different workflow stages may use different models.

---

## Product Hierarchy

Kando should be organized like this:

Workspace
-> Repositories
-> Tech Implementation Locks
-> Product Overview
   -> PRDs
      -> Epics
         -> Stories
            -> Tasks
               -> Implementation Plans
-> Execution Records
-> Settings

All features should reinforce this hierarchy.

---

## Technical Stack Defaults

Unless the task says otherwise, prefer:

- Electron for desktop shell
- Vue 3
- shadCN for UI components
- Vite for renderer tooling
- TypeScript throughout
- Pinia for state
- SQLite for structured local persistence
- Drizzle for ORM
- Local filesystem for markdown/json artifacts and logs

If a repo already exists and the task is about extending it, align with the existing stack where practical.

---

## Architecture Preferences

### Workspace-first
The app should open into a workspace-oriented experience.

Primary navigation should generally support:
- ProductOverview
- PRDs
- Epics
- Stories
- Tasks
- Repos
- Settings / Models

### Local-first persistence
Use:
- SQLite for metadata/state/queryable records
- filesystem for markdown/json artifacts and larger logs

### Artifact persistence
Where appropriate, persist both:
- structured database records
- durable filesystem artifacts

### Service boundaries
Business logic should not be embedded deeply in UI components.
Prefer service/domain layers for:
- workspace management
- repo management
- Git operations
- stack management
- model routing
- artifact persistence
- execution policy
- chat/session handling

### Git abstraction
All Git behavior should go through a Git service layer.
Do not scatter raw Git logic through UI components.

---

## Workspace Data Expectations

A workspace should support:

- workspace metadata
- attached repos
- product overview
- tech implementation lock
- model routing
- PRDs
- epics
- stories
- tasks
- chat sessions
- execution history

Suggested local shape:

.workspace/
  app.db
  workspace.json
  stack.json
  models.json
  cache/
  executions/

docs/
  product-overview.md
  prds/
  epics/
  stories/

This can be refined, but keep the structure clean and inspectable.

---

## AI Workflow Expectations

Kando should support distinct workflow stages such as:

- product_overview_refinement
- prd_creation / epic_creation
- story_creation
- story_detail_creation
- dev_task_creation
- test_case_generation
- planning
- execution
- diff_review

These stages should be represented explicitly in code and persistence.

Do not collapse everything into one generic "ask AI" flow.

---

## Model Routing Expectations

Kando must support multiple providers/models in architecture.

Implement model routing as a first-class concept.

Routing should support:
- provider definitions
- model definitions
- workflow-stage assignments
- optional fallback models
- per-workspace overrides where relevant

Even if provider execution is stubbed in v1, the system architecture for model routing should be real.

---

## Chat Expectations

Kando requires a chat interface, but chat is not the source of truth.

Chat should be:
- context-aware
- scoped to current artifact or workspace
- able to create or update structured artifacts
- persisted locally

Preferred chat scopes:
- workspace
- PRD
- story
- task
- execution
- repo

Artifacts remain authoritative. Chat is an interaction layer.

---

## Safety Expectations

Assume agents can make mistakes. Design to minimize blast radius.

At minimum, agent-related architecture should support:

- plan approval before execution
- worktree-based isolation architecture
- command restrictions
- path restrictions
- sensitive file awareness
- audit logging
- human review before merge
- no direct execution on main/default branch

Do not assume directory scoping alone is sufficient isolation.

---

## Git / Worktree Expectations

Kando should be designed around repo-safe execution.

Important:
- support repo registration
- detect whether a repo is Git-controlled
- show basic branch/status information where practical
- define clean interfaces for future worktree operations

Examples of future-facing Git service responsibilities:
- get status
- get current branch
- list worktrees
- create worktree
- remove worktree
- get diff

For v1, implement what is practical and clearly scaffold the rest.

---

## UI / UX Preferences

Kando should feel like a real desktop developer product. Use a light background color. Clean design. And shadcn Vue for components. Design tasteful, modern, and usable experiences. 

Prefer:
- clean multi-pane layouts
- workspace-oriented navigation
- forms plus detail views
- right-side contextual chat where useful
- repo pages that feel like the beginning of an IDE-style experience

Avoid:
- overstuffed screens
- giant undifferentiated forms
- chat-only experiences
- burying core workflow objects behind settings-like UI

---

## UI system rules

- Use shadcn components by default for all app UI.
- Do not create custom buttons, inputs, modals, dropdowns, tables, or badges unless no Nuxt UI component exists.
- Reuse existing wrapper components from `components/ui/` before introducing new patterns.
- Use only approved tokens from `app.config.ts` and Tailwind theme for color, spacing, radius, and typography.
- Do not hardcode hex colors, box shadows, spacing values, or font sizes in feature components.
- Prefer composition of existing primitives over one-off styled markup.
- Keep visual patterns consistent with existing pages.

## Design workflow

Before coding UI:
1. Inspect related screens and existing components.
2. List the components/patterns to reuse.
3. Only then implement.

## Definition of done for UI changes

- Uses shadcn Vue primitives where applicable
- Uses shared tokens only
- Supports loading, empty, error, and disabled states
- Responsive on mobile and desktop
- No duplicate component patterns introduced

--

## Coding Standards

1. Use TypeScript consistently.
2. Keep functions and modules small and focused.
3. Prefer clear names over clever abstractions.
4. Avoid unnecessary dependencies.
5. Prefer composition over tightly coupled monoliths.
6. Keep UI components presentational where possible.
7. Move persistence, Git, and domain logic into dedicated services/modules.
8. Do not introduce major architectural patterns without clear need.
9. Keep diffs narrow and reviewable.
10. Follow existing project conventions before inventing new ones.

---

## File and Package Boundaries

If using a monorepo structure, prefer clear boundaries such as:

- `apps/desktop` for Electron app shell and renderer integration
- `packages/ui` for shared UI primitives/components
- `packages/core` for domain logic/application logic
- `packages/db` for SQLite schema and data access
- `packages/git` for Git/repo/worktree services
- `packages/shared` for shared types and utilities

Refine as needed, but do not let responsibilities blur.

---

## Testing Expectations

Add meaningful tests for core logic.

Prioritize tests around:
- workspace creation and loading
- artifact persistence
- stack lock persistence
- model routing persistence
- PRD/story/task creation flows
- repo metadata detection
- critical domain services

Do not overinvest in fragile UI tests for early scaffolding.
Use component tests only where they add clear value.

---

## Implementation Process Rules

When asked to implement a feature:

1. inspect the relevant existing code first
2. identify the smallest coherent slice
3. produce a concise plan if the change is non-trivial
4. implement only the requested scope
5. add or update tests where valuable
6. run relevant checks
7. summarize what changed and any remaining risks

Do not silently implement adjacent future features unless needed for a clean foundation.

---

## Planning Rules

For larger features:
- separate planning from execution
- identify affected files/modules first
- call out risks and assumptions
- preserve room for later expansion

No large speculative rewrites unless explicitly requested.

---

## Diff Discipline

Keep changes:
- narrow
- understandable
- reversible
- aligned with approved scope

Avoid:
- sweeping renames
- unnecessary file churn
- opportunistic refactors unrelated to the task

If a broader refactor is truly necessary, state that clearly.

---

## Persistence Rules

Whenever possible, ensure user-created artifacts survive restart.

Core user work should not live only in in-memory store state.

If a feature edits:
- workspace metadata
- product overview
- stack config
- model routes
- PRDs
- stories
- tasks
- chat sessions

then it should be persisted appropriately.

---

## Product Voice

Kando should feel:
- structured
- calm
- capable
- trustworthy
- developer-oriented

Avoid gimmicky or overly playful implementation decisions unless explicitly requested.

---

## If You Need to Make a Tradeoff

Prefer, in this order:

1. correct architecture direction
2. local persistence
3. coherent UX flow
4. testable domain logic
5. polished visuals
6. speculative extensibility

---

## Summary

Kando is a local-first, workspace-based AI product development desktop app.

It should help users move from product context to PRDs, epics, stories, tasks, implementation plans, and repo-aware execution through structured workflows, model routing, and safe agent interaction.

When implementing features, preserve that structure.