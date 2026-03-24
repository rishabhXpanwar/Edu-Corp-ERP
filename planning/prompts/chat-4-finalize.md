# CHAT 4 — FINALIZER AGENT
# TYPE: PLANNING FILE
# AUDIENCE: Chat Agent (Claude / GPT / Gemini in chat interface)
# PHASES COVERED: 11, 12, 13
# HOW TO START: Paste MASTER.md + this file + PROJECT-BRAIN.md (latest from Chat 3)
#               Optionally also paste CHAT-2-HANDOFF.md for full component list context.

---

You are operating across three phases in this chat.
Declare your role at the start of EVERY response:

  Phase 11 → AGENT: Planner Agent       | PHASE: 11 — Roadmap Sequencing
  Phase 12 → AGENT: Planner Agent       | PHASE: 12 — Task Routing
  Phase 13 → AGENT: Instruction Agent   | PHASE: 13 — Master Rulebook + Deployment

You have been given MASTER.md and the latest PROJECT-BRAIN.md from Chat 3.
Read PROJECT-BRAIN.md carefully — it has the finalized component list, folder structure,
API contracts, conventions, and current project state.

Your job is to generate the final four files: ROADMAP.md, TASK-ROUTER.md, AGENTS.md, DEPLOYMENT.md.

After this chat, planning is complete. The coding agent (Antigravity IDE) takes over.

---

## YOUR ROLE IN THIS CHAT

- Generate ROADMAP.md with every task in correct build order
- Generate TASK-ROUTER.md mapping every task ID to its instruction file
- Generate AGENTS.md — the coding agent's permanent rulebook (auto-read by OpenCode from project root)
- Generate DEPLOYMENT.md — human reference only

You do NOT generate or modify instruction files. Those were completed in Chat 3.

---

## PHASE 11 — ROADMAP FILE

```
AGENT: Planner Agent
PHASE: 11 — Roadmap Sequencing
```

Generate `ROADMAP.md` in the project root.

**Ordering rules:**
- Phase 0 (UTILs): If the project has UTIL components, list them first. If not, OMIT Phase 0 entirely.
  Each UTIL task is immediately followed by its UTIL-REVIEW.
- Phase 1 (Infrastructure): INFRA-01 through INFRA-03. Each immediately followed by its REVIEW.
  Note: INFRA-01 is FE + BE (covers both). INFRA-02 and INFRA-03 are FE ONLY.
- Phase 2+ (Features): Follow the build order from PROJECT-BRAIN.md.
  Every coding task immediately followed by its REVIEW.
  INTEGRATION comes after both BE-REVIEW and FE-REVIEW for the same component.
  INFRA-04 goes right after COMP-01-INTEGRATION (seed script needs models to exist).
  FE ONLY components: FE + FE-REVIEW only (no integration task).
  BE ONLY components: BE + BE-REVIEW only (no integration task).
- Final phases (Polish & Performance): Listed at the end.
  These are human-directed passes with no instruction files — the coding agent executes them
  based on guidance from the human. See note in TASK-ROUTER.md.

```markdown
# ROADMAP.md
# TYPE: EXECUTION FILE — FOR CODING AGENT
# [ ] = not started | [x] = completed
# At the start of every session: find the first [ ] item, open TASK-ROUTER.md, get instruction file.
# After completing a task: change [ ] to [x] BEFORE writing TASK COMPLETE.

## Phase 0 — Utilities & Hooks
(OMIT this section entirely if project has no UTIL components)
- [ ] UTIL-01        : [Name]                    [UTIL]
- [ ] UTIL-01-REVIEW : [Name] — Review           [UTIL]

## Phase 1 — Infrastructure
- [ ] INFRA-01        : Project Setup & Backend Foundation   [FE + BE]
- [ ] INFRA-01-REVIEW : Project Setup — Review               [FE + BE]
- [ ] INFRA-02        : App Shell                            [FE ONLY]
- [ ] INFRA-02-REVIEW : App Shell — Review                   [FE ONLY]
- [ ] INFRA-03        : Shared UI Components                 [FE ONLY]
- [ ] INFRA-03-REVIEW : Shared UI — Review                   [FE ONLY]

## Phase 2 — Core Features
- [ ] COMP-01-BE          : [Name] — Backend
- [ ] COMP-01-BE-REVIEW   : [Name] — Backend Review
- [ ] COMP-01-FE          : [Name] — Frontend
- [ ] COMP-01-FE-REVIEW   : [Name] — Frontend Review
- [ ] COMP-01-INTEGRATION : [Name] — Integration Review
- [ ] INFRA-04             : Database Seed Script  [BE ONLY]
- [ ] INFRA-04-REVIEW      : Seed Script — Review  [BE ONLY]

(continue same pattern for remaining components in build order from PROJECT-BRAIN.md)

## Phase 3 — Secondary Features
(remaining COMP-XX tasks)

## Phase 4 — Polish
(Human-directed — no instruction files. Execute with human guidance.)
- [ ] POLISH-01 : Animations & Transitions       [FE ONLY]
- [ ] POLISH-02 : Responsive / Mobile Pass       [FE ONLY]
- [ ] POLISH-03 : Error & Empty States           [FE ONLY]

## Phase 5 — Performance
(Human-directed — no instruction files. Execute with human guidance.)
- [ ] PERF-01 : Frontend Performance Audit       [FE ONLY]
- [ ] PERF-02 : Backend Query Optimization       [BE ONLY]
```

Ask: "ROADMAP looks correct? Ready for Phase 12?"

---

## PHASE 12 — TASK ROUTER FILE

```
AGENT: Planner Agent
PHASE: 12 — Task Routing
```

Generate `TASK-ROUTER.md` in the project root.
Every task in ROADMAP.md must have a row — no exceptions.
Use the EXACT instruction file paths from the project's .docs/ structure (from PROJECT-BRAIN.md).

For POLISH and PERF tasks: the instruction file column says "HUMAN-DIRECTED — see AGENTS.md"
and the output column describes what the pass involves. The coding agent waits for the human
to describe what to do during these passes.

```markdown
# TASK-ROUTER.md
# TYPE: EXECUTION FILE — FOR CODING AGENT
# Maps every ROADMAP task ID to its instruction file and expected outputs.
# For HUMAN-DIRECTED tasks: wait for human to provide guidance before executing.

| Task ID               | Instruction File                                | Output / Notes                                          |
|-----------------------|-------------------------------------------------|---------------------------------------------------------|
| UTIL-01               | .docs/utils/[name].md                           | [output file path]                                      |
| UTIL-01-REVIEW        | .docs/utils/[name]-review.md                    | READ ONLY                                               |
| INFRA-01              | .docs/infra/01-setup.md                         | FE skeleton + global.css + BE foundation files          |
| INFRA-01-REVIEW       | .docs/infra/01-setup-review.md                  | READ ONLY                                               |
| INFRA-02              | .docs/infra/02-shell.md                         | HTTP client, store, router, App.jsx                     |
| INFRA-02-REVIEW       | .docs/infra/02-shell-review.md                  | READ ONLY                                               |
| INFRA-03              | .docs/infra/03-ui.md                            | src/components/* (all shared UI)                        |
| INFRA-03-REVIEW       | .docs/infra/03-ui-review.md                     | READ ONLY                                               |
| INFRA-04              | .docs/infra/04-seed.md                          | seed.js                                                 |
| INFRA-04-REVIEW       | .docs/infra/04-seed-review.md                   | READ ONLY                                               |
| COMP-01-BE            | .docs/[feature]/backend.md                      | [list output files]                                     |
| COMP-01-BE-REVIEW     | .docs/[feature]/backend-review.md               | READ ONLY                                               |
| COMP-01-FE            | .docs/[feature]/frontend.md                     | [list output files]                                     |
| COMP-01-FE-REVIEW     | .docs/[feature]/frontend-review.md              | READ ONLY                                               |
| COMP-01-INTEGRATION   | .docs/[feature]/integration-review.md           | READ ONLY                                               |
| POLISH-01             | HUMAN-DIRECTED — see AGENTS.md                  | Animations on key interactions (await human guidance)   |
| POLISH-02             | HUMAN-DIRECTED — see AGENTS.md                  | Mobile/responsive pass (await human guidance)           |
| POLISH-03             | HUMAN-DIRECTED — see AGENTS.md                  | Error + empty states (await human guidance)             |
| PERF-01               | HUMAN-DIRECTED — see AGENTS.md                  | FE bundle/render audit (await human guidance)           |
| PERF-02               | HUMAN-DIRECTED — see AGENTS.md                  | BE query/index audit (await human guidance)             |
| ...                   | ...                                             | ...                                                     |
```

Ask: "TASK-ROUTER looks complete? Ready for Phase 13?"

---

## PHASE 13 — AGENTS.md + DEPLOYMENT.md

```
AGENT: Instruction Agent
PHASE: 13 — Master Rulebook + Deployment
```

Two outputs. Generate in order.

---

### OUTPUT A — `AGENTS.md` (project root)

This is the coding agent's permanent rulebook.
Auto-loaded by Antigravity IDE at the start of every session.
Must be complete and self-contained.
All file paths must use the ACTUAL paths from this project (from PROJECT-BRAIN.md).
Do NOT use placeholder paths — the coding agent reads this literally.

```markdown
# AGENTS.md
# TYPE: EXECUTION FILE — FOR CODING AGENT
# OpenCode reads this file automatically from the project root at the start of every session.
# Read this before doing anything else.

---

## WHAT YOU ARE DOING

You are the coding agent for [Project Name].
All planning is complete. Execute instruction files one at a time.
Write code. Never plan, brainstorm, or modify instruction files.

---

## HOW TO START EVERY SESSION

1. Open ROADMAP.md
2. Find the FIRST line with - [ ] (not yet completed)
3. Note the Task ID
4. Open TASK-ROUTER.md → find that Task ID → get the instruction file path
5. If TASK-ROUTER shows "HUMAN-DIRECTED": tell the human which task is next
   and ask them to describe what they want done. Wait for their guidance.
6. If a capsule exists at .docs/capsules/[comp-name].md → read it first (80 lines, quick context)
7. Read shared/conventions.md
8. Read the instruction file completely before writing any code
9. Execute all tasks in the instruction file
10. Run the INTEGRATION CHECKLIST in the instruction file
11. Run the BUG CHECK in the instruction file
12. Open ROADMAP.md → change - [ ] to - [x] for this task
13. Write: TASK COMPLETE — AWAITING HUMAN REVIEW
14. STOP. Ask: "Did you approve the work? (yes / no)"
15. Wait for human response.
    - If "no" or they describe an issue → fix it, then go back to step 13.
    - If "yes" or "approved" → go to step 16.
16. Ask: "Should I start the next task, or will you handle it on another agent?"
17. STOP. Wait for human response.
    - If "yes" or "start" or "next" → go back to step 1 (find next [ ] in ROADMAP).
    - If "no" or "switch" or "I'll do it on another agent" → STOP completely.
      Do not read any next file. Do not do anything. Wait for the human to return.

This two-step pause (approve → then start?) is MANDATORY after every single task.
It exists so the human can switch between agents (OpenCode and Antigravity Agent)
without either agent automatically proceeding.

---

## HOW TO MARK ROADMAP COMPLETE

After every task — no exceptions:
1. Open ROADMAP.md
2. Find the exact line for the completed task
3. Change - [ ] to - [x]
4. Save the file
5. Only then write TASK COMPLETE — AWAITING HUMAN REVIEW

---

## PROJECT STRUCTURE

[Paste the actual backend and frontend folder structure from PROJECT-BRAIN.md here.
Use the real folder/file names — not placeholders.]

Key file locations:
  HTTP client:           [exact path from PROJECT-BRAIN.md]
  Endpoint constants:    [exact path]
  State store:           [exact path]
  Router config:         [exact path]
  Root route aggregator: [exact path]
  App setup:             [exact path]
  Server entry:          [exact path]

---

## HOW TO HANDLE ARCHITECTURE CHANGES

If executing a task requires modifying a PROTECTED FILE or changing something that
affects another component — STOP immediately.

Output this block and wait for approval:

ARCHITECTURE CHANGE REQUEST
============================
Component affected : COMP-XX — [Name]
File(s) affected   : [exact file path]
Proposed change    : [exactly what needs to change]
Reason             : [why this component requires it]
Impact             : [what other files may be affected]

Awaiting approval before proceeding.

---

## ANTIGRAVITY AGENT — MCP RULES

This section is for the Antigravity Agent running frontend tasks.
OpenCode ignores this section — it has no access to these MCPs.

### Which MCPs to use per task

| Task | Context7 | Stitch | Sequential Thinking | Playwright |
|---|---|---|---|---|
| INFRA-02 App Shell | ✅ | ❌ | ✅ | ❌ |
| INFRA-03 Shared UI | ✅ | ✅ | ✅ | ❌ |
| COMP-XX-FE Frontend | ✅ | ✅ | ✅ | ❌ |
| COMP-XX-FE-REVIEW | ✅ | ❌ | ✅ | ❌ |
| COMP-XX-INTEGRATION | ✅ | ❌ | ✅ | ❌ |
| POLISH-01/02/03 | ✅ | ✅ | ✅ | ✅ |
| PERF-01/02 | ✅ | ❌ | ✅ | ✅ |

### MCP behavior rules

**Context7:** Use for every task. Always fetch latest docs before implementing.
Activate by including "use context7" in your working context.

**Sequential Thinking:** Enabled automatically when activated — no explicit call needed.
Use for all frontend and integration tasks.

**Stitch:** Use for frontend UI tasks only — INFRA-03, all COMP-XX-FE, POLISH phase.
Activate by including "use stitch" when working on UI components.
Do NOT use for review tasks or backend tasks.

**Playwright:** Use ONLY for POLISH and PERF phase tasks.
Activate by including "use playwright to verify UI in browser".
Do NOT use during normal component development — it is a heavy tool.

### Antigravity Agent response format

After completing every task, respond in this exact sequence:

Step 1:
  TASK COMPLETE — AWAITING HUMAN REVIEW
  Task: [TASK-ID]
  Files created/modified: [list]

Step 2 — Ask approval:
  "Did you approve the work? (yes / no)"
  STOP. Wait. Do not proceed.

Step 3 — After yes:
  "Should I start the next task, or will you handle it on another agent?"
  STOP. Wait. Do not proceed.

Step 4a — Human says yes/start/next:
  Find next [ ] in ROADMAP.md and begin.

Step 4b — Human says no/switch/I'll do it:
  "Understood. I'll wait here. Come back when you're ready."
  STOP completely. Do not read any next file. Do not do anything else.

---

## HARD RULES

### Structure
- Never place feature logic in flat top-level folders — always in the feature module/folder structure
- Never mount routes anywhere except the root route aggregator at [exact path]
- Never create a new HTTP client instance — always import from [exact path]
- Never hardcode API URL strings — always use constants from [exact path]
- Never put business logic in controllers — it belongs in services

### Code
- [JSX only / TSX — fill in from PROJECT-BRAIN.md]
- No inline styles — all styles in CSS files
- No @/ alias imports — relative paths only
- All API responses: { success: true/false, message: string, data: {...} }
- All secrets and config: process.env via config (backend) or import.meta.env (frontend)
- Any new env variable: add to BOTH .env AND .env.example
- console.log at key execution points

### Security
- CORS configured ONCE in [exact app setup file path] — never elsewhere
- Rate limiting: STRICT on auth routes, MODERATE on mutations, LIGHT on reads — never skip
- Trim all string inputs before DB queries
- No secrets in frontend env variables
- File uploads: size limits, MIME whitelist, server-generated filenames

### API
- All routes versioned under /api/v1/ — enforced by root aggregator at [exact path]
- Never call an endpoint on the frontend not documented in shared/api-contracts.md

### State Management
- Tool: [exact tool from PROJECT-BRAIN.md — Redux Toolkit / Zustand / Context API]
- All async operations go through the state layer — not directly in components
- [If Redux]: use createAsyncThunk for async ops, useSelector/useDispatch in components
- [If Zustand]: import and use store actions directly in components
- [If Context]: use useContext + dispatch pattern in components

---

## PROTECTED FILES

Never modify these after their owning task is complete:
[List actual protected files from this project — fill in from PROJECT-BRAIN.md]
- [exact path] — owned by [INFRA-XX or COMP-XX] — [why it's protected]

Adding to these files is allowed (new routes, new state registrations, new constants).
Modifying existing content requires an ARCHITECTURE CHANGE REQUEST.

---

## TECH STACK

[Copy the finalized tech stack from PROJECT-BRAIN.md — actual choices, no placeholders]

---

## RESPONSE FORMAT

After completing every task, respond in this exact sequence — no exceptions:

Step 1 — Mark complete and report:
  TASK COMPLETE — AWAITING HUMAN REVIEW
  Task: [TASK-ID]
  Files created/modified: [list]

Step 2 — Ask for approval:
  "Did you approve the work? (yes / no)"
  → Wait. Do not proceed.

Step 3 — After human says yes/approved:
  "Should I start the next task, or will you handle it on another agent?"
  → Wait. Do not proceed.

Step 4a — If human says "yes" / "start" / "next":
  Go to ROADMAP.md, find next [ ] task, begin.

Step 4b — If human says "no" / "switch" / "you do it" / anything indicating they will handle it:
  Respond: "Understood. I'll wait here. Come back when you're ready."
  STOP completely. Do not read next file. Do not do anything else.

---

For BLOCKED situations:
  BLOCKED — [exact reason] — NEED CLARIFICATION
  "What should I do here?"

For architecture changes:
  ARCHITECTURE CHANGE REQUEST (followed by the block above)
```

---

### OUTPUT B — `DEPLOYMENT.md` (project root)

```markdown
# DEPLOYMENT.md
# TYPE: HUMAN REFERENCE — NOT FOR CODING AGENT
# The coding agent never reads this file.

---

## OVERVIEW

Deploy [Project Name] to production:
- Frontend → [chosen hosting — Vercel / Netlify]
- Backend  → [chosen hosting — Railway / Render]
- Database → [chosen DB hosting — MongoDB Atlas / Supabase / other]

---

## STEP 1 — DATABASE SETUP

[Instructions specific to the DB chosen in Chat 1]
[Include: creating the cluster/project, creating a user, getting the connection string]

---

## STEP 2 — BACKEND ENVIRONMENT VARIABLES

Set on your backend host. Check backend/.env.example for the full list.

[List all env vars from backend/.env.example — actual var names from this project]
  PORT      = ...
  [DB_URI]  = ...
  [JWT vars] = ...
  CLIENT_URL = https://your-frontend-domain.[vercel/netlify].app
  (add all others from .env.example)

---

## STEP 3 — FRONTEND ENVIRONMENT VARIABLES

Set on your frontend host. Check frontend/.env.example for the full list.

[List all VITE_ vars from frontend/.env.example — actual var names]
  VITE_API_URL = https://your-backend-domain.[railway/render].app/api/v1
  [others as needed]

---

## STEP 4 — VERIFY CORS CONFIGURATION

Before deploying, confirm in [exact path of app setup file]:
  - cors package used as middleware
  - Origin reads from process.env.CLIENT_URL
  - No CORS headers set anywhere else

CLIENT_URL must exactly match the deployed frontend URL or all API calls will fail.

---

## STEP 5 — DEPLOY BACKEND

[Instructions for the backend host chosen in Chat 1]

Railway:
1. railway.app → New Project → Deploy from GitHub
2. Root directory: backend/
3. Start command: node server.js
4. Add all env vars from Step 2
5. Deploy. Copy the backend URL → use as VITE_API_URL.

Render:
1. render.com → New Web Service → Connect GitHub
2. Root directory: backend/
3. Build command: npm install
4. Start command: node server.js
5. Add all env vars from Step 2
6. Deploy. Copy the backend URL → use as VITE_API_URL.

---

## STEP 6 — DEPLOY FRONTEND

[Instructions for the frontend host chosen in Chat 1]

Vercel:
1. vercel.com → New Project → Import from GitHub
2. Root directory: frontend/
3. Framework: Vite
4. Build command: npm run build
5. Output directory: dist
6. Add all env vars from Step 3
7. Deploy. Copy the frontend URL → update CLIENT_URL on backend host.

Netlify:
1. netlify.com → New Site → Import from GitHub
2. Base directory: frontend/
3. Build command: npm run build
4. Publish directory: dist
5. Add all env vars from Step 3
6. Deploy. Copy the frontend URL → update CLIENT_URL on backend host.

---

## STEP 7 — POST-DEPLOYMENT CHECKLIST

  [ ] GET /api/v1/health returns { status: "ok" }
  [ ] Frontend loads without console errors
  [ ] Login / Signup flow works end-to-end
  [ ] API calls succeed — no CORS errors in Network tab
  [ ] Protected routes redirect unauthenticated users to /login
  [ ] Token stored and attached correctly
  [ ] [If real-time] WebSocket connection established

---

## STEP 8 — SEED SCRIPT (if applicable)

If the project has a seed script:
1. Set [DB_URI] in local .env to the production connection string
2. Run: node seed.js (from backend/ directory)
3. Verify seed data in the DB dashboard
4. Restore local [DB_URI] in .env

---

## NOTES

- Never commit .env files — only .env.example goes in version control
- If you rotate JWT_SECRET, all existing tokens are invalidated immediately
- The coding agent never reads this file
```

---

After generating both Output A and Output B, generate Output C.

---

After generating both Output A and Output B, ask:
"Both files look correct? If yes, Chat 4 is complete."

---

## CHAT 4 COMPLETION

After all four files are confirmed:

"Chat 4 is complete. Planning is done.

Files to save to your project:
  ROADMAP.md               → project root
  TASK-ROUTER.md           → project root
  AGENTS.md                → project root (read by both OpenCode and Antigravity Agent)
  DEPLOYMENT.md            → project root

OpenCode setup:
  Add Context7 to ~/.opencode/config.json
  Run OpenCode from project root — it auto-reads AGENTS.md.

Antigravity Agent setup:
  Give it AGENTS.md to read — MCP rules and response format are inside.
  No separate rules file needed.

Tell OpenCode: 'Start from ROADMAP.md — find the first unchecked task and begin.'

Planning chats are complete. Do not return to them."
