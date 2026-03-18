
**Kando** Kando is a local-first desktop application for AI-assisted product development and software delivery.Kando helps users move from product idea to implementation through a structured workflow.

Kando uses Artifact Driven Development which combines AI enabled context creation, product planning, and repo-aware execution into a structured development environment.

Instead of using AI as a free-form chatbot, Kando organizes work through:

- Workspaces
- Tech Implementation Locks
- Product Overviews
- PRDs
- Epics
- Stories
- Tasks
- Implementation Plans
- Repo-aware execution

Kando is designed for **solo developers, AI-assisted development, and modern engineering teams**.

---

# Core Idea

Most AI coding tools operate like this:


prompt → code


Kando operates like this:


Product Overview
↓
PRD
↓
Epics
↓
Stories
↓
Tasks
↓
Implementation Plan
↓
Execution
↓
Diff Review


This structure allows AI to operate with **product context, engineering constraints, and approval gates**, making development safer and more reliable.

---

# Key Principles

### Local-First

Kando works without requiring cloud service.

All core functionality runs locally.

### Workspace-First

Projects are organized by **workspaces**, not individual repos.

### Artifact-Driven Development

Artifacts are the source of truth:

- Product Overview
- Tech Implementation Locks
- PRDs
- Epics
- Stories
- Tasks
- Implementation Plans
- Execution records

Chat is an interaction layer, not the system of record.

Artifacts are version controlled and require approval before downstream work can be completed. 

### Planning Before Execution

No agent should modify code without an approved plan.

### Repo-Aware Agents

Agents operate with:

- repo context
- tech stack lock
- planning artifacts
- scoped execution environments

### Model-Agnostic

Different models can be used for different workflow steps.

---

# Product Architecture

## Workspace Structure


Workspace
├ Tech Implementation Locks
├ Settings
├ Product Overview
├ PRDs
├ Epics
├ Stories
├ Tasks
├ Repositories
├ Implementation Plans
└ Execution History


Workspaces may contain **one or multiple repositories**.

---

# Workspace Lifecycle

1. Create workspace
2. Attach repository
3. Define product overview
4. Lock tech stack
5. Create PRDs
6. Generate stories
7. Create dev/test tasks
8. Generate plans
9. Execute code changes
10. Review diffs
11. Merge

---

# Core Features

## Workspaces

Workspaces are where artifacts and settings live.


---

## Product Overview

Each workspace begins with product context. This context informs all AI operations.

---

## Tech Implementation Locks

Kando locks technical stack and implementation decisions early.

Example:


frontend: nuxt
language: typescript
database: postgres
testing: vitest


Stack drift detection prevents accidental framework mixing.

Kando also locks implementation decisions regarding topics like state management, API architecture, data validation, authentication strategy, UI component libraries, styling conventions, and testing patterns.

---

# PRDs

Major features must have a PRD.

PRDs generate epics.

---

# Epics

Epics represent major units of implementation work derived from a PRD.

A single PRD may generate multiple Epics, each representing a large component or subsystem required to deliver the feature.

Epics generate stories.

---

# Stories

Stories describe user-level functionality.

Example:


Search jobs by keyword
Filter jobs by specialty
Pagination for results

Stories generate tasks.

---

# Tasks

Tasks represent actionable engineering work.

Types:


Dev
Test


Task workflow:


todo → planning → in_progress → review → done


Each task includes:

- implementation plan
- execution logs
- diff review

---

# AI Workflow Stages

Kando supports multiple AI workflow stages:


product_overview_refinement
prd_creation
story_creation
story_detail_creation
dev_task_creation
test_case_generation
planning
execution
diff_review


Each stage may use a different model.

---

# Model Routing

Kando supports multiple model providers.

Examples:

- OpenAI
- Anthropic
- local models
- custom APIs

Example:


PRD creation → model A
Story generation → model B
Planning → model A
Execution → model C
Diff review → model B


---

# Chat Interface

Kando includes a contextual chat interface.

Chat is scoped to the current object.

Scopes:


workspace
PRD
story
task
execution
repo


Chat can perform actions:

- create PRDs
- create stories
- generate tasks
- refine plans
- summarize diffs
- update artifacts

Artifacts remain the source of truth.

---

# Repo Integration

Repositories can be attached to a workspace.

Capabilities:

- repo metadata
- Git status
- file explorer
- diff viewer
- execution context

---

# Execution Model

Each task execution should use a **git worktree**.

Example:


repo/
.ai-worktrees/
task-101
task-102


Benefits:

- isolated changes
- parallel tasks
- safer agent execution

---

# Safety Architecture

Agent safety uses defense-in-depth.

Minimum protections:

- worktree isolation
- command allowlists
- path sandboxing
- secret filtering
- approval gates
- audit logging
- human review before merge

Agents should be treated as **untrusted collaborators**.

---

# Chat Safety

Chat interactions must not automatically execute code.

High-risk actions require approval:

- execution
- dependency changes
- merges

---

# Local-First Architecture

Kando runs locally.

Storage uses:

### SQLite

Stores:

- workspace metadata
- PRDs
- stories
- tasks
- chat sessions
- model routing

---

# Contributing

Contributions are welcome.

Please read:


AGENTS.md
CONTRIBUTING.md


before submitting changes.

---