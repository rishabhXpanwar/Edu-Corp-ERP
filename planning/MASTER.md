# MASTER.md
# TYPE: PLANNING FILE — STATIC
# Give this file to EVERY planning chat along with the chat-specific prompt.
# This file never changes. It is the shared foundation for all planning chats.

---

## WHAT WE ARE BUILDING

We are planning a full-stack web application using a structured agentic workflow.
The planning is split across multiple focused chats. Each chat covers specific phases.
After all planning chats are done, a coding agent (Antigravity IDE)
executes the instruction files that were generated — one task at a time.

---

## TWO WORLDS — READ THIS CAREFULLY

This entire system has exactly two worlds. Never mix them.

```
WORLD 1 — PLANNING WORLD
  Who    : You (chat agent — Claude / GPT / Gemini in a chat interface)
  Job    : Produce instruction files, shared files, ROADMAP, handoffs
  Code   : ZERO — never write actual code
  When   : One time only — during planning chats
  Files  : Everything inside planning/ folder + .docs/ + shared/ + ROADMAP.md

WORLD 2 — EXECUTION WORLD
  Who    : Coding agent (OpenCode running in Antigravity terminal)
  Job    : Read instruction files and write actual code
  Code   : Everything
  When   : After Phase 13 is complete — forever
  Files  : .docs/ instruction files, shared/conventions.md, ROADMAP.md,
           TASK-ROUTER.md, AGENTS.md
```

Once Phase 13 is complete — the planning world is done.
The coding agent (OpenCode) takes over. Planning chat agents are never consulted again.

---

## FILE GEOGRAPHY

The exact backend and frontend folder structure varies per project — Chat 2A decides it.
The layout below shows only the PLANNING and EXECUTION infrastructure files.

```
project-root/
│
├── backend/                     ← EXECUTION WORLD — structure decided by Chat 2A
├── frontend/                    ← EXECUTION WORLD — structure decided by Chat 2A
│
├── shared/                      ← ROOT LEVEL — coding agent reads directly
│   ├── conventions.md           ← coding rules, response format, naming, patterns
│   ├── api-contracts.md         ← every endpoint's input/output — grows per component
│   └── socket-events.md         ← (only if real-time) — single source of truth for events
│
├── .docs/                       ← EXECUTION WORLD — instruction files only
│   ├── capsules/                ← quick-context files per component (80 lines max each)
│   ├── infra/                   ← INFRA-01, 02, 03, 04 instruction files
│   └── [comp-name]/             ← per-component instruction folder
│       ├── backend.md
│       ├── frontend.md
│       ├── backend-review.md
│       ├── frontend-review.md
│       └── integration-review.md
│
├── .docs/utils/                 ← UTIL instruction files
│
├── AGENTS.md                    ← EXECUTION WORLD — coding agent's permanent rulebook
│                                   Auto-loaded by Antigravity IDE in every session.
├── ROADMAP.md                   ← task list with [ ] / [x] status
├── TASK-ROUTER.md               ← maps task IDs to instruction files
├── DEPLOYMENT.md                ← human reference — not for coding agent
│
└── planning/                    ← PLANNING WORLD ONLY — coding agent never reads this
    ├── MASTER.md
    ├── prompts/
    │   ├── chat-1-architect.md
    │   ├── chat-2A-planner.md
    │   ├── chat-2B-planner.md
    │   ├── chat-3-instructions.md
    │   └── chat-4-finalize.md
    └── handoffs/
        ├── CHAT-1-HANDOFF.md
        ├── CHAT-2A-HANDOFF.md
        └── CHAT-2-HANDOFF.md
```

**CRITICAL**: `shared/` is at the PROJECT ROOT — not inside `.docs/`.
**CRITICAL**: `AGENTS.md` is at the PROJECT ROOT — OpenCode reads this automatically when started in the project directory.

---

## ENTERPRISE ARCHITECTURE PRINCIPLES

Every project built with this workflow follows enterprise-level architecture principles.
These are **principles, not a fixed template**. The actual folder names, file names, and
how many layers are needed — all of that is decided by Chat 2A based on the project's complexity.
A simple project may need fewer layers. A large project may need more. The principles always apply.

### Backend Principles

**1. Feature isolation**
Backend logic is organized by feature/domain, not by type.
Do not dump all controllers in one folder, all routes in another. Each feature owns its own
controllers, routes, validators — co-located in one place.

**2. API versioning**
All API routes are versioned from the start (e.g., `/api/v1/`).
A single root router file aggregates all feature routes under the version prefix.
This is the ONLY place routes are mounted.

**3. Thin controllers, fat services**
Controllers do three things: validate input, call a service, return a response.
Business logic, DB queries, and external API calls belong in service files — not in controllers.
If a controller function is doing more than ~15 lines of logic, it needs a service.

**4. Centralized middleware**
Auth, validation, rate limiting, and error handling live in a shared middleware layer.
Never duplicate middleware logic inside feature folders.

**5. Config isolation**
DB connection, env variable validation, and app-wide constants live in a config layer.
No other file connects to the DB or reads process.env directly except the config layer.

**6. Global error handling**
One error handler middleware at the bottom of the Express app catches all errors.
Controllers call next(error) — they never return error responses directly from catch blocks.
A custom AppError class is used to throw structured errors from services.

**7. Validation per feature**
Every mutation route has a dedicated validator co-located with the feature.
A shared validate middleware runs the validator and returns 400 on failure.
Controllers never manually check for missing fields.

**8. Rate limiting on every route**
Every route has rate limiting applied. Three standard tiers:
  STRICT   — 5 req/min  — auth routes, OTP, password reset
  MODERATE — 30 req/min — create, update, delete
  LIGHT    — 100 req/min — read, list, search
Never skip rate limiting.

**9. Security by default**
Helmet headers, CORS from env (never hardcoded), trimmed inputs, bcrypt for passwords,
no raw user input in DB query operators, server-generated filenames for uploads.
Secrets only on the backend — never in frontend env variables.

**10. Observability**
A health check endpoint (GET /api/v1/health) is always present — no auth required.
The server handles SIGTERM gracefully — closes DB connections before exit.
Console.log at key execution points in controllers, services, and middleware.

### Frontend Principles

**1. Feature isolation**
Frontend logic is organized by feature/domain.
Each feature owns its pages, components, state, validation schemas, and API service calls.
Components used by only one feature live inside that feature's folder.
Truly shared components (used by 2+ features) live in a common shared location.

**2. Single HTTP client**
One Axios instance with request and response interceptors — created once, imported everywhere.
Request interceptor attaches the auth token. Response interceptor handles 401 globally.
Never create a new axios instance anywhere else in the codebase.

**3. Endpoint constants**
All API URL strings are defined as named constants in one file.
Feature service files import these constants — never hardcode URL strings.

**4. Predictable global state**
Use a dedicated state management library for global state — chosen in Chat 1 based on
project complexity. Options: Redux Toolkit (recommended for complex multi-feature state),
Zustand (lighter, good for medium complexity), Context API (simple projects only).
Whichever is chosen: each feature has its own state slice/store, async operations are
handled through the state layer (not directly in components), and local useState is
reserved for pure UI state only (modal open/close, input focus, etc.).

**5. Centralized routing**
All route definitions live in one router configuration file.
ProtectedRoute wraps authenticated pages. Role-based routes have their own guard.
No routes are defined inside page components.

**6. Schema-first form validation**
Zod schemas (or equivalent, as chosen in Chat 1) define the shape and constraints of form data.
Forms validate against the schema before making any API call.
Inline errors are shown per field.

**7. Error handling layers**
  - 401: axios interceptor only — clears token, redirects to login. Never in components.
  - Other errors: caught in the async/state layer — stored in state — displayed by components.
  - Components handle: 400 (show validation errors), 403, 404, 409, 500 for their feature.

**8. No magic strings**
No URL strings, role strings, or status labels scattered in components.
All app-wide constants live in a dedicated constants file.

**9. CSS discipline**
Plain CSS with CSS variables. No inline styles. No CSS-in-JS.
No utility-class frameworks (like Tailwind) unless explicitly chosen in Chat 1.
Each component/page has a co-located CSS file.

### The Key Distinction
The above principles are always applied.
What changes per project:
- How many feature modules exist
- Whether a service layer is needed for all features or only complex ones
- Whether RBAC needs a dedicated middleware or a simple role check is enough
- Which state management tool is used (decided in Chat 1)
- The exact file names — derived from the project's domain
- How deeply nested the feature structure needs to be

**Chat 2A is responsible for translating these principles into the right structure for each project.**
It does not copy a template — it designs the structure from scratch for the project at hand.

---

## EXECUTION SETUP

After all planning chats are done, two agents execute the instruction files.
This section defines who does what and what tools they use.

### Agent Split

```
Backend tasks  (COMP-XX-BE, BE-REVIEW, INFRA-01, INFRA-04, UTIL)
  → OpenCode running in Antigravity terminal
  → Model: Claude Sonnet 4.6
  → MCP: Context7 only (configured in ~/.opencode/config.json)

Frontend tasks (COMP-XX-FE, FE-REVIEW, INFRA-02, INFRA-03)
  → Antigravity Agent
  → Model: Gemini 3.1 Pro (High for complex tasks, Low for simpler ones)
  → MCPs: Context7 + Stitch + Sequential Thinking (auto via .antigravity/rules.md)

Review + Integration tasks (BE-REVIEW, FE-REVIEW, INTEGRATION)
  → OpenCode
  → Model: Claude Sonnet 4.6
  → MCP: Context7 only

POLISH + PERF tasks
  → Antigravity Agent
  → MCPs: Context7 + Stitch + Sequential Thinking + Playwright
```

### MCP Rules Per Task

| ROADMAP Task | Agent | Context7 | Stitch | Seq.Thinking | Playwright |
|---|---|---|---|---|---|
| INFRA-01 | OpenCode | ✅ | ❌ | ❌ | ❌ |
| INFRA-02 | Antigravity | ✅ | ❌ | ✅ | ❌ |
| INFRA-03 | Antigravity | ✅ | ✅ | ✅ | ❌ |
| INFRA-04 | OpenCode | ✅ | ❌ | ❌ | ❌ |
| COMP-XX-BE | OpenCode | ✅ | ❌ | ❌ | ❌ |
| COMP-XX-BE-REVIEW | OpenCode | ✅ | ❌ | ❌ | ❌ |
| COMP-XX-FE | Antigravity | ✅ | ✅ | ✅ | ❌ |
| COMP-XX-FE-REVIEW | Antigravity | ✅ | ❌ | ✅ | ❌ |
| COMP-XX-INTEGRATION | OpenCode | ✅ | ❌ | ❌ | ❌ |
| POLISH-01/02/03 | Antigravity | ✅ | ✅ | ✅ | ✅ |
| PERF-01/02 | Antigravity | ✅ | ❌ | ✅ | ✅ |

### MCP Behavior

- **Context7**: Antigravity mein automatic (rules.md se). OpenCode mein manual config.
- **Sequential Thinking**: Automatic — enable karo, explicitly bolna nahi padta.
- **Stitch**: rules.md se automatic Frontend tasks mein. Explicitly bolna nahi padta.
- **Playwright**: rules.md se automatic POLISH/PERF phase mein. Normal dev mein OFF.

### Key Rule

Both agents MUST work in the same project root directory.
Integration-review tasks OpenCode se run hoti hain — woh backend aur frontend dono padhta hai.

---

## CHAT ROLE MAPPING

| Chat    | Phases  | Role             | Output                                                               |
|---------|---------|------------------|----------------------------------------------------------------------|
| Chat 1  | 1 – 4   | Architect Agent  | Project Brief, Tech Stack, Architecture, Pages/Routes                |
|         |         |                  | → planning/handoffs/CHAT-1-HANDOFF.md                                |
| Chat 2A | 5 – 7   | Planner Agent    | Folder structure, backend module design, frontend feature topology   |
|         |         |                  | → planning/handoffs/CHAT-2A-HANDOFF.md                               |
| Chat 2B | 7.5 – 9 | Planner Agent    | Design interview, Component list with design notes, shared files     |
|         |         |                  | → planning/handoffs/CHAT-2-HANDOFF.md                                |
| Chat 3  | 10      | Instruction Agent| All .docs/ instruction files, review files, capsules per component   |
|         |         |                  | → .docs/ folder is the output                                        |
| Chat 4  | 11 – 13 | Finalizer Agent  | ROADMAP.md, TASK-ROUTER.md, AGENTS.md, DEPLOYMENT.md                 |

---

## HOW TO START EACH CHAT

```
Chat 1:
  Paste: MASTER.md + planning/prompts/chat-1-architect.md

Chat 2A:
  Paste: MASTER.md + planning/prompts/chat-2A-planner.md + CHAT-1-HANDOFF.md

Chat 2B:
  Paste: MASTER.md + planning/prompts/chat-2B-planner.md + CHAT-1-HANDOFF.md + CHAT-2A-HANDOFF.md

Chat 3:
  Paste: MASTER.md + planning/prompts/chat-3-instructions.md + CHAT-2-HANDOFF.md
  If using Claude Projects — also add: shared/conventions.md, shared/api-contracts.md

Chat 4:
  Paste: MASTER.md + planning/prompts/chat-4-finalize.md + PROJECT-BRAIN.md (from Chat 3)
  Optionally also paste CHAT-2-HANDOFF.md for full component list context.
```

---

## FILE OWNERSHIP TABLE

| File / Folder                        | Produced by               | Read by                                      |
|--------------------------------------|---------------------------|----------------------------------------------|
| planning/MASTER.md                   | You (manual, one time)    | All planning chats                           |
| planning/prompts/chat-X.md           | You (manual, one time)    | That specific chat only                      |
| planning/handoffs/CHAT-1-HANDOFF.md  | Chat 1 agent              | Chat 2A agent                                |
| planning/handoffs/CHAT-2A-HANDOFF.md | Chat 2A agent             | Chat 2B agent                                |
| planning/handoffs/CHAT-2-HANDOFF.md  | Chat 2B agent             | Chat 3 agent                                 |
| PROJECT-BRAIN.md                     | Any planning chat         | Same chat (emergency rescue only)            |
| shared/conventions.md                | Chat 2B agent             | Chat 3, Chat 4, Coding agent                 |
| shared/api-contracts.md              | Chat 2B (init)            | Chat 3 (updates), Coding agent               |
|                                      | Chat 3 (updates per comp) |                                              |
| shared/socket-events.md              | Chat 2B (if real-time)    | Chat 3, Coding agent                         |
| .docs/infra/*.md                     | Chat 3 agent              | Coding agent                                 |
| .docs/utils/*.md                     | Chat 3 agent              | Coding agent                                 |
| .docs/[comp]/*.md                    | Chat 3 agent              | Coding agent                                 |
| .docs/capsules/*.md                  | Chat 3 agent              | Coding agent                                 |
| ROADMAP.md                           | Chat 4 agent              | Coding agent                                 |
| TASK-ROUTER.md                       | Chat 4 agent              | Coding agent                                 |
| AGENTS.md                            | Chat 4 agent              | Coding agent (OpenCode reads from project root) |
| DEPLOYMENT.md                        | Chat 4 agent              | Human only                                   |

---

## PROJECT-BRAIN — EMERGENCY RESCUE FILE

If a planning chat becomes too long, slow, or starts drifting context:

1. Ask the current chat: "Output the latest PROJECT-BRAIN.md"
2. Open a fresh new chat
3. Paste: MASTER.md + same chat prompt file + PROJECT-BRAIN.md
4. Say: "Continue from PROJECT-BRAIN.md — same phase, same chat role."

PROJECT-BRAIN is NOT for handoffs between chats. It is for emergency restarts within the SAME chat.

### PROJECT-BRAIN.md format:
```markdown
# PROJECT-BRAIN.md
# Emergency rescue file — paste into a NEW CHAT of the SAME PHASE if current chat drifts.

## Project
Name: ...
One-liner: ...
Tech stack: (key choices — 6-8 lines)
User roles: ...

## Finalized Conventions
(10-15 key rules from shared/conventions.md)

## Folder Structure
(the actual backend and frontend folder tree — as decided in Chat 2A)

## Pages & Routes
- /path → PageName → access: [roles] → [FE ONLY / FULL STACK]

## Component Status
- [x] INFRA-01: done
- [x] COMP-01: Auth — done — POST /api/v1/auth/login → { accessToken, user }
- [ ] COMP-02: pending
- ...

## API Contracts
(grows as components complete in Chat 3)

## Key Decisions & Reasons
- (significant decisions and why)

## Current State
Currently on: Phase [N] — Chat [X]
Last completed: [name]
Next step: [what to do next]

## Open Questions / Blockers
- (anything unresolved)
```

---

## GLOBAL BEHAVIOR RULES

These apply to ALL planning chats unless a chat's own prompt file overrides them.

**Rules that apply to every chat:**
- You are a PRODUCER. You generate files for the coding agent. You never write code.
- One phase at a time. Never combine two phases in one response.
- At the start of EVERY response, declare your role and phase:
  ```
  AGENT: Architect Agent
  PHASE: 2 — Tech Stack Decision
  ```
- Never skip phases. Never jump ahead.
- Write instruction files for a code agent, not a human. Be extremely explicit.
- Never generate actual code in instruction files. Describe what to build, not how to write it.
- Instruction files should be as long and detailed as needed. Never compress for brevity.
- Split instruction files into Part A / Part B if they cross ~400 lines naturally.
  Each part must be self-contained. Add both parts to ROADMAP.md and TASK-ROUTER.md.

**Rules that apply to Chat 1 only (interactive brainstorm):**
- Ask the human one question at a time. Wait for each answer.
- If any decision is unclear — ask the human. Do not guess or invent.
- At the end of each phase, ask: "Ready to move to Phase [N]?" and wait for confirmation.
- When the human says "next" or "approved" — move to the next step.

**Rules that apply to Chats 2A, 2B, 3, and 4 (autonomous operation):**
- These chats do NOT brainstorm interactively. The human's role is APPROVAL ONLY.
- Generate each phase output completely, then wait for approval or change requests.
- Exception: Chat 2B Phase 7.5 (Design Interview) is interactive by design —
  the human provides design references panel by panel. All other phases in Chat 2B
  are autonomous. Each chat's prompt file defines its own rules precisely.
- Each chat's prompt file defines its own autonomous operation rules — follow those.

---

## AGENT ROLE MAPPING

| Phase / Task  | Agent Role        | Mindset                                                  |
|---------------|-------------------|----------------------------------------------------------|
| Phase 1       | Architect Agent   | Explore, question, discover scope                        |
| Phase 2       | Architect Agent   | Evaluate tools, justify every choice                     |
| Phase 3       | Architect Agent   | System design, security, scale, patterns                 |
| Phase 4       | Architect Agent   | UX flow, access control, layout                          |
| Phase 5       | Planner Agent     | Design project-specific folder structure (Chat 2A)       |
| Phase 6       | Planner Agent     | Backend domain modeling, route design (Chat 2A)          |
| Phase 7       | Planner Agent     | Frontend feature topology (Chat 2A)                      |
| Phase 7.5     | Planner Agent     | Design interview — interactive (Chat 2B)                 |
| Phase 8       | Planner Agent     | Component breakdown + design notes (Chat 2B)             |
| Phase 9       | Planner Agent     | Establish conventions, contracts (Chat 2B)               |
| Phase 10      | Instruction Agent | Write precise agent instructions, no code                |
| Phase 11      | Planner Agent     | Sequencing, dependency ordering                          |
| Phase 12      | Planner Agent     | Task routing and file mapping                            |
| Phase 13      | Instruction Agent | Master agent rulebook + deployment doc                   |
| *-REVIEW      | Reviewer Agent    | Read code, verify checklist, no edits                    |
| *-INTEGRATION | Integrator Agent  | Verify FE/BE contracts match end-to-end                  |
| UTIL-XX       | Instruction Agent | Write utility/hook instruction file                      |
