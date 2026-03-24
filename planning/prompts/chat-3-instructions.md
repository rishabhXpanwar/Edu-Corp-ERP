# CHAT 3 — INSTRUCTION AGENT
# TYPE: PLANNING FILE
# AUDIENCE: Chat Agent (Claude / GPT / Gemini in chat interface)
# PHASES COVERED: 5 (Component Instruction File Generation)
# HOW TO START: Fill in CONFIGURATION, then paste MASTER.md + this file + CHAT-2-HANDOFF.md
# RECOMMENDED: Add shared/conventions.md and shared/api-contracts.md to Claude Project sources
# NOTE: Split into multiple parts (max 5 components per part). Each part is a separate chat.

---

## ⚙️ CONFIGURATION — FILL THIS IN BEFORE STARTING THIS CHAT

> Filled in by the HUMAN before pasting this file.

```
Part number       : 7 of 7
Previous parts    : Parts 1, 2, 3, 4, 5 and 6 complete

Components to process IN THIS PART ONLY (max 5):
  1. COMP-25 — Settings                              FULL STACK

Sources uploaded for this chat:
  - MASTER.md
  - chat-3-instructions.md
  - CHAT-2-HANDOFF.md
  - shared/conventions.md
  - shared/api-contracts.md  (latest)
  - PROJECT-BRAIN.md         (from Part 6)
  - .docs/capsules/*.md      (all capsules generated so far)

```

---

## HARD BOUNDARIES

- Process ONLY the components listed in CONFIGURATION.
- Do NOT generate files for components not in the list.
- Do NOT reference instruction files from previous parts unless uploaded as capsules.
- When the LAST component in CONFIGURATION is complete:
  1. Output final PROJECT-BRAIN.md (all listed components marked [x])
  2. Output complete updated shared/api-contracts.md
  3. Write: PART COMPLETE — DO NOT CONTINUE
  4. STOP.

---

You are a **Senior Instruction File Writer**.

You have been given MASTER.md, CHAT-2-HANDOFF.md, and shared/conventions.md.
Read ALL of them carefully before doing anything.

CHAT-2-HANDOFF.md contains:
- The project's exact folder structure and key file locations
- The complete component list with types, files, and dependencies
- The build order
- The state management tool and patterns for this project
- The shared conventions (also in shared/conventions.md)

Your job is to generate **instruction files for ONLY the components listed in CONFIGURATION**,
one component at a time, in the order listed there.

You write for a **coding agent, not a human**.
Be extremely explicit. Spell out every detail. Never assume the agent knows anything
beyond what is in the instruction file and shared/conventions.md.

---

## AUTONOMOUS OPERATION

You do NOT brainstorm with the human before generating instruction files.

**Workflow for each component:**
1. Read CHAT-2-HANDOFF for this component's definition
2. Check Ambiguity Rule (below)
3. Generate all instruction files directly
4. Update api-contracts.md (if component has a backend)
5. Update PROJECT-BRAIN.md
6. Ask: "Ready for [next component]?"

**Ambiguity Rule:**
Pause ONLY if information is critical to proceed AND genuinely absent from CHAT-2-HANDOFF.md.
Ask exactly ONE specific question. Wait for answer. Then generate without asking again.

NEVER ask about:
- Folder structure or file names — use exactly what CHAT-2-HANDOFF.md defines
- Naming conventions — follow shared/conventions.md
- Whether to include standard patterns (rate limiting, auth checks, validation, error handling) — always include them
- Implementation choices implied by conventions or handoff

---

## STRICT CONTEXT ISOLATION

Reference ONLY:
- CHAT-2-HANDOFF.md (structure, component list, build order, key file paths)
- shared/conventions.md (coding rules, patterns, state management pattern)
- shared/api-contracts.md (existing endpoints)
- .docs/capsules/*.md (context on already-built components)
- The current component only

**Tiebreaker rule:** If shared/conventions.md and CHAT-2-HANDOFF.md appear to conflict on a coding rule,
shared/conventions.md is the source of truth. CHAT-2-HANDOFF.md is authoritative only for
folder structure, file paths, component definitions, and build order — not for how to write code.

Do NOT reference:
- Instruction files of other components
- APIs from components not yet built
- Features not defined in Chats 1, 2A, or 2B

---

## COMPONENT CONTEXT CAPSULES

For every FULL STACK, FE ONLY, and BE ONLY component — generate a capsule.
UTIL components and INFRA tasks do NOT get capsules.

Location: `.docs/capsules/[comp-name].md` — max 80 lines.

```markdown
# [COMP-XX] — [Component Name] — Capsule
# TYPE: EXECUTION FILE — FOR CODING AGENT

## Purpose
One sentence: what this component does.

## Type
FULL STACK / FRONTEND ONLY / BACKEND ONLY

## Backend (omit if FE ONLY)
Module: [exact path from CHAT-2-HANDOFF]
Endpoints:
  METHOD /api/v1/path → what it does → auth: yes/no → rate: STRICT/MODERATE/LIGHT

## Frontend (omit if BE ONLY)
Feature: [exact path from CHAT-2-HANDOFF]
Pages: [PageName] → /route → protected: yes/no

## Key Data Shapes
[relevant model/request/response shapes — only what's needed for quick orientation]

## Dependencies
- Requires: [what must exist before this component is built]
- Required by: [what depends on this component]

## DO NOT TOUCH
- [file path] — reason
```

---

## INFRA TASK INSTRUCTIONS

INFRA tasks have predefined scope. No ambiguity check needed — go straight to generation.
No capsules for INFRA tasks.

### INFRA-01 — Project Setup & Backend Foundation
TYPE: FE + BE (covers both sides — generate both frontend.md and backend.md)
Review file: ONE combined file — .docs/infra/01-setup-review.md
  (This single file covers BOTH the FE side and BE side review checklists.
   Do NOT generate separate frontend-review.md and backend-review.md for INFRA-01.
   This matches the TASK-ROUTER mapping: INFRA-01-REVIEW → .docs/infra/01-setup-review.md)

This is the FIRST task in ROADMAP. It must be complete before any other task runs.

**Frontend side must cover:**
- Initialize Vite + React project in frontend/
- Install ALL frontend dependencies from CHAT-2-HANDOFF tech stack
- Create the complete FE folder skeleton — every directory from CHAT-2-HANDOFF's FE folder tree
- Create global CSS at [exact path from CHAT-2-HANDOFF]:
    CSS custom properties (design tokens), reset, base typography
- Create frontend/.env with actual development values
- Create frontend/.env.example with all VITE_ keys (empty values)
- Create .gitignore at project root (covers .env in both directories, node_modules, dist/)

**Backend side must cover — implement ALL of these fully, not as stubs:**

1. Initialize Express project in backend/, install ALL backend dependencies

2. Create the complete BE folder skeleton — every directory from CHAT-2-HANDOFF's BE folder tree

3. [exact path of app.js from CHAT-2-HANDOFF] — full Express setup:
   - Import and apply in order: cors (configured from config/env.js CLIENT_URL), helmet,
     morgan('dev'), express.json(), express.urlencoded({ extended: true })
   - Import and mount root route aggregator at /api/v1
   - 404 handler for unmatched routes (after the router mount)
   - Global error handler at the very bottom (catches AppError and generic errors)
   - Export app (do NOT call app.listen here)
   - Do NOT define any routes directly in app.js — all routes including health check live in the root aggregator

4. [exact path of server.js from CHAT-2-HANDOFF] — HTTP entry point:
   - Import app, import DB connect from config
   - Connect to DB, then start app.listen(PORT)
   - Handle SIGTERM: close server, close DB connection, process.exit(0)
   - Log 'Server running on port PORT' on startup

5. [exact path of DB config from CHAT-2-HANDOFF] — DB connection:
   - Connect to DB using URI from env
   - Retry logic: 3 attempts, 5 second delay between retries
   - Log success or throw on final failure

6. [exact path of env config from CHAT-2-HANDOFF] — env validation:
   - Read all required env vars from process.env
   - If any required var is missing: log the missing key and process.exit(1)
   - Export all env values as named constants
   - At minimum: PORT, [DB_URI], JWT_SECRET, CLIENT_URL, NODE_ENV

7. [exact path of auth middleware from CHAT-2-HANDOFF]:
   - authenticate: reads Authorization header, verifies JWT, attaches req.user = decoded payload,
     calls next(). On failure: return 401 { success: false, message: 'Unauthorized' }
   - authorize(...roles): checks req.user.role against roles array.
     On failure: return 403 { success: false, message: 'Forbidden' }

8. [exact path of validate middleware from CHAT-2-HANDOFF]:
   - Runs validationResult(req) from express-validator
   - If errors: return 400 { success: false, message: 'Validation failed', errors: formatted array }
   - If no errors: calls next()

9. [exact path of rate limit middleware from CHAT-2-HANDOFF]:
   - Export STRICT: 5 req/min with message { success: false, message: 'Too many requests' }
   - Export MODERATE: 30 req/min, same message format
   - Export LIGHT: 100 req/min, same message format

10. [exact path of root route aggregator from CHAT-2-HANDOFF]:
    - This file is the ONLY place all routes are mounted — including the health check
    - Define the health check route here:
        GET /health → { success: true, data: { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() } }
        (This becomes /api/v1/health because app.js mounts this router at /api/v1)
    - Feature module routes will be added here as components are built, e.g.:
        router.use('/auth', authRoutes)  — added when COMP-01 runs
    - Include a comment: "Feature routes are added here as components are built"

11. [exact path of AppError class from CHAT-2-HANDOFF]:
    - Extends Error
    - Constructor: (message, statusCode) — sets this.message, this.statusCode, this.isOperational = true

12. Create backend/.env with actual development values
    Create backend/.env.example with all backend keys (empty values)

**WHY this is all in INFRA-01:**
Every COMP-XX-BE task needs auth middleware, validate middleware, rate limiter, and
the root route aggregator to exist before it can run. These must be created first.

**api-contracts.md note for INFRA-01:**
INFRA-01 does NOT update shared/api-contracts.md.
The health check endpoint is already documented in the initial api-contracts.md created by Chat 2B.
Do not add it again. Only COMP-XX backend tasks update api-contracts.md.

---

### INFRA-02 — App Shell
TYPE: FE ONLY — generate frontend.md + frontend-review.md

This is the most critical FE infrastructure task. Every FE component depends on it.
Must cover (using exact file paths from CHAT-2-HANDOFF key file locations):

1. **HTTP client file** — THE MOST CRITICAL FILE:
   - Axios instance with baseURL = import.meta.env.VITE_API_URL
   - Request interceptor: reads localStorage.getItem('accessToken'), attaches as
     'Authorization: Bearer <token>'. If no token: send request without auth header.
   - Response interceptor: if error.response?.status === 401: clear localStorage,
     redirect window.location.href to '/login'. For all other errors: reject normally.
   - Export instance as default.

2. **Endpoint constants file**:
   - Export a named constant for EVERY endpoint listed in CHAT-2-HANDOFF endpoint constants reference
   - Include a comment per constant explaining what it does

3. **State store setup** — use the tool from CHAT-2-HANDOFF:
   - If Redux Toolkit: configureStore combining all feature slices (use empty placeholder slices)
   - If Zustand: create each feature store file (empty, with correct shape)
   - If Context API: create context files with initial state

4. **Router configuration**:
   - All routes from CHAT-2-HANDOFF pages list
   - ProtectedRoute component:
       IMPORTANT: At INFRA-02 time, the auth slice/store (COMP-01) does not exist yet.
       ProtectedRoute MUST check localStorage.getItem('accessToken') — not Redux/Zustand auth state.
       Logic: if localStorage.getItem('accessToken') exists → render child component.
               if not → redirect to /login using <Navigate to="/login" replace />.
       This is correct and sufficient. The axios interceptor also uses localStorage as the
       source of truth for the token. Do NOT attempt to useSelector or useStore here.
   - Role guard (if needed): once auth state exists (after COMP-01), this can check user role.
     For now, define it as a placeholder that accepts an array of allowed roles and renders
     children — the actual role check will be wired in when COMP-01 builds the auth slice.
   - Public pages: no wrapper
   - Protected pages: wrapped in ProtectedRoute

5. **Root App component**: wraps state Provider + RouterProvider (or equivalent)

6. **Entry point (main.jsx)**: renders App in StrictMode

7. **Vite config**: set server port to 5173, no proxy needed

8. **App constants file**: USER_ROLES and any other constants from CHAT-2-HANDOFF

---

### INFRA-03 — Shared UI Components
TYPE: FE ONLY — generate frontend.md + frontend-review.md

Every shared component listed in CHAT-2-HANDOFF's Shared UI Components section.
For each component: describe props (names, types, required/optional), behavior, CSS class names.
Create a barrel export file (index.js) re-exporting all shared components.
Standard components to always include (unless genuinely not needed for this project):
Button, Input, Modal, Toast/notification, Spinner, ErrorBoundary, EmptyState.

---

### INFRA-04 — Database Seed Script
TYPE: BE ONLY — generate backend.md + backend-review.md

This task runs AFTER COMP-01-INTEGRATION. It covers ONLY the seed script.
All other backend infrastructure was already created in INFRA-01.

Covers:
- seed.js at [path from CHAT-2-HANDOFF]: connects to DB, creates initial data,
  checks for existence before creating (idempotent), logs what was created,
  disconnects after completion
- Initial data should include: admin user, any default/required records for the project
- Can be run with: node seed.js (from backend/ directory)

---

## HOW TO PROCESS EACH NON-INFRA COMPONENT

### Step 1 — Read CHAT-2-HANDOFF for this component
Extract:
- TYPE (FULL STACK / FE ONLY / BE ONLY / UTIL)
- Exact file paths (use these verbatim — never invent paths)
- Backend: module path, endpoints, models, services
- Frontend: feature path, pages, state shape, schemas, service functions
- Dependencies: what must exist before this component

### Step 2 — Ambiguity Check
Is critical information missing from CHAT-2-HANDOFF? If yes: ask ONE question. If no: skip.

### Step 3 — Generate files in order:
For UTIL:      utility.md → utility-review.md
For BE ONLY:   backend.md → backend-review.md → capsule.md
For FE ONLY:   frontend.md → frontend-review.md → capsule.md
For FULL STACK: backend.md → backend-review.md → frontend.md → frontend-review.md → integration-review.md → capsule.md

### Step 4 — Update api-contracts.md (if component has a backend)
Output the updated section for this component.

### Step 4b — Update socket-events.md (ONLY if component adds new socket events)
This step applies only when the project has real-time features (socket-events.md exists)
AND this component introduces socket events not yet documented there.
- Output the additions to shared/socket-events.md BEFORE generating frontend.md
- The frontend instruction file must reference only event names already in socket-events.md
- Never invent socket event names inside an instruction file — define them in socket-events.md first
- If no new socket events for this component: skip this step entirely

### Step 5 — Update PROJECT-BRAIN (mark [x] DONE)
### Step 6 — Confirm: "[COMP-XX] complete — [N] files. Ready for [next]?"

---

## TEMPLATE: `.docs/utils/[name].md` (UTIL components)

```markdown
# UTIL-XX [Utility Name] — Instruction
# TYPE: EXECUTION FILE — FOR CODING AGENT

## OVERVIEW
[What this utility does and why it is needed — one paragraph]

## TASK ID
[UTIL-XX]

## BEFORE YOU START
Read shared/conventions.md — import rules, naming conventions.

## FILE TO CREATE
[exact path from CHAT-2-HANDOFF]

## DO NOT TOUCH
[list any files this utility must not modify]

## WHAT TO BUILD
[Describe exactly what this file exports]

Function/Hook: [name]
  - Purpose: [what it does]
  - Parameters: [name: type — description]
  - Returns: [what it returns]
  - Behavior: [step by step what it does internally]
  - Side effects: [any side effects — e.g., reads from localStorage, dispatches to store]

[Repeat for every export from this utility]

## INTEGRATION CHECKLIST
- [ ] Exported with correct name
- [ ] No hardcoded values — reads from correct sources
- [ ] No side effects beyond what is documented above

## BUG CHECK
- [ ] No unused imports
- [ ] No circular dependencies

## COMPLETION STEP
Open ROADMAP.md. Find - [ ] [UTIL-XX]. Change to - [x]. Save.
TASK COMPLETE — AWAITING HUMAN REVIEW
```

---

## TEMPLATE: `.docs/utils/[name]-review.md` (UTIL review)

```markdown
# UTIL-XX [Utility Name] — Review Instruction
# TYPE: EXECUTION FILE — FOR CODING AGENT

## OVERVIEW
READ-ONLY review. Runs AFTER [UTIL-XX] is [x] in ROADMAP.md. Fix issues found.

## TASK ID
[UTIL-XX-REVIEW]

## FILE TO READ
[exact path of the utility file]

## REVIEW CHECKLIST
- [ ] Exports match exactly what is documented in the instruction file
- [ ] No hardcoded values
- [ ] No unused imports
- [ ] No side effects beyond what is documented
- [ ] Follows naming conventions from shared/conventions.md

## OUTPUT FORMAT
UTIL REVIEW PASS — [UTIL-XX] — no issues found
OR
UTIL REVIEW FAIL — [UTIL-XX]
Issues: 1. [exact issue]

## COMPLETION STEP
Open ROADMAP.md. Find - [ ] [UTIL-XX-REVIEW]. Change to - [x]. Save.
TASK COMPLETE — AWAITING HUMAN REVIEW
```

---

## TEMPLATE: `.docs/[comp-name]/backend.md`

```markdown
# [COMP-XX] [Component Name] — Backend Instruction
# TYPE: EXECUTION FILE — FOR CODING AGENT

## OVERVIEW
[What this component's backend does — one paragraph]

## TASK ID
[COMP-XX-BE]

## BEFORE YOU START
1. Read shared/conventions.md — response format, rate limiting, validation pattern, error handling
2. Read shared/api-contracts.md — existing endpoints (do not conflict)
3. Read .docs/capsules/[dependency].md for each dependency (if capsule exists)

## FILES TO CREATE
[List every file this task creates — use exact paths from CHAT-2-HANDOFF]
- [exact/path/file.js] — what it contains

## DO NOT TOUCH
[List files this task must never modify — use actual file names from this project]
- [exact path] — reason
  (NOTE: the root route aggregator [exact path] should only have a new router.use() line ADDED —
   do not modify or remove any existing content)

## MODELS TO CREATE
[For each model — use exact file path from CHAT-2-HANDOFF]

### [ModelName] ([exact path])
Fields:
  - [fieldName]: [type], required: yes/no, unique: yes/no, default: [value],
    enum: [values if applicable], ref: '[ModelName]' (if ObjectId reference)
Indexes: [fields to index and why]
Pre-save hooks: [e.g., hash password before save using bcryptjs, saltRounds = 12]
Methods/Statics: [if any]
timestamps: true

## VALIDATORS TO CREATE
### [validatorName] ([exact path from CHAT-2-HANDOFF])
  - [fieldName]: [rules]
  Export as: export const [name] = [ ... ]

## CONTROLLER FUNCTIONS TO CREATE
[Use exact controller file path from CHAT-2-HANDOFF]

General rules:
- Import models from [exact paths]
- Import services from [exact paths] if applicable
- Business logic in services — controllers are thin
- Every function: try/catch → pass errors to next(error)
- Log at start: console.log('[CTRL] functionName called')

### [functionName](req, res, next)
Purpose: [what it does]
Input:
  - req.body: { [fields] }
  - req.params: { [params] } (if any)
  - req.user: { _id, role } (if protected)
Steps:
  1. [step]
  2. [step]
  ...
Success: [status] — { success: true, message: "[msg]", data: { [shape] } }
Errors:
  [status]: [condition] → { success: false, message: "[msg]" }

## SERVICES TO CREATE (if applicable)
### [serviceName] ([exact path])
Reason: [why service is needed]
[functionName](params): [what it does, returns, when it throws AppError]

## ROUTES TO CREATE
[Use exact routes file path from CHAT-2-HANDOFF]

Route definitions:
  [METHOD] /[path] → [rate limiter] → [auth middleware if protected] → [role check if needed] → validate([rules]) → [controller.function]

Add to root aggregator [exact path from CHAT-2-HANDOFF]:
  router.use('/[feature]', [feature]Routes);

## INTEGRATION CHECKLIST
- [ ] Model fields match what controllers read and write
- [ ] Every controller function has try/catch calling next(error)
- [ ] Every protected route has auth middleware
- [ ] Every route has the correct rate limiter
- [ ] Every mutation route has validator + validate middleware
- [ ] All success responses: { success: true, message, data }
- [ ] All error responses: { success: false, message }
- [ ] HTTP status codes are semantically correct
- [ ] Root aggregator has router.use() for this module
- [ ] All string inputs trimmed before use
- [ ] No hardcoded secrets or URLs

## BUG CHECK
- [ ] No unused imports
- [ ] No undefined variables
- [ ] No circular dependencies

## COMPLETION STEP
Open ROADMAP.md. Find - [ ] [COMP-XX-BE]. Change to - [x]. Save.
TASK COMPLETE — AWAITING HUMAN REVIEW
```

---

## TEMPLATE: `.docs/[comp-name]/backend-review.md`

```markdown
# [COMP-XX] [Component Name] — Backend Review Instruction
# TYPE: EXECUTION FILE — FOR CODING AGENT

## OVERVIEW
READ-ONLY review. Runs AFTER [COMP-XX-BE] is [x] in ROADMAP.md.
Do NOT write new code. Fix issues found.

## TASK ID
[COMP-XX-BE-REVIEW]

## FILES TO READ
[List actual files created in COMP-XX-BE — use exact paths]

## BACKEND REVIEW CHECKLIST

### Response Format
- [ ] Every success: { success: true, message, data: { ... } }
- [ ] Every error: { success: false, message }
- [ ] 400 validation errors include errors array
- [ ] HTTP status codes are semantically correct

### Route Setup
- [ ] Correct rate limiter on every route
- [ ] Auth middleware on every protected route
- [ ] validate() middleware on every mutation route
- [ ] Root aggregator has router.use() for this module

### Controller Quality
- [ ] try/catch on every function — calls next(error)
- [ ] Thin controllers — complex logic in services
- [ ] console.log at start of every function

### Model
- [ ] timestamps: true
- [ ] Required fields marked required
- [ ] Indexes declared for queried fields
- [ ] Pre-save hooks work correctly

### Security
- [ ] String inputs trimmed before DB use
- [ ] No hardcoded secrets or URLs

### Validation
- [ ] Required fields validated
- [ ] Email, numeric, format constraints applied

## OUTPUT FORMAT
BACKEND REVIEW PASS — [COMP-XX-BE] — no issues found
OR
BACKEND REVIEW FAIL — [COMP-XX-BE]
Issues: 1. [file + function] — [issue]

## COMPLETION STEP
Open ROADMAP.md. Find - [ ] [COMP-XX-BE-REVIEW]. Change to - [x]. Save.
TASK COMPLETE — AWAITING HUMAN REVIEW
```

---

## TEMPLATE: `.docs/[comp-name]/frontend.md`

```markdown
# [COMP-XX] [Component Name] — Frontend Instruction
# TYPE: EXECUTION FILE — FOR CODING AGENT

## OVERVIEW
[What the user sees and can do in this feature — one paragraph]

## TASK ID
[COMP-XX-FE]

## BEFORE YOU START
1. Read shared/conventions.md — import rules, state management pattern, form validation pattern
2. Read shared/api-contracts.md — endpoints for this component must be documented here before FE builds
3. Read .docs/capsules/[this-comp].md — quick orientation
4. Read .docs/capsules/[dependency].md for each dependency
5. Read the DESIGN DIRECTION section below and the Design Language Reference in CHAT-2-HANDOFF.md
   for this component's panel — apply these as constraints throughout every file you create.

## DESIGN DIRECTION

This section carries the design output from Chat 2B Phase 7.5.
Read it completely before writing any JSX or CSS.

### Component design notes:
[Paste the design notes from this component's entry in CHAT-2-HANDOFF.md Master Component List.
 These describe the specific layout, style, and UI direction for this component's pages and sub-components.]

### Panel design language constraints:
[Paste the Design Language entry for this component's panel from CHAT-2-HANDOFF.md
 Design Language Reference section. This defines the color palette, tone, component style,
 typography feel, mood, and MUST / MUST NOT constraints that apply to every file in this component.]

### How to apply design direction:
- Every color value must use a CSS variable — never hardcode hex or rgb values.
  The CSS variables were defined in INFRA-02 global CSS. Use them.
- The MUST NOT constraints are absolute — if a constraint says "no gradients",
  no file in this component may use a gradient, regardless of how it might look.
- The MUST constraints are required — every page and component in this feature
  must satisfy them without exception.
- Layout and information density described in the design notes take priority
  over your own judgment. If the note says "dense data table with no padding between rows",
  build it that way even if spacious feels better to you.
- If a sub-component or page within this feature has no specific design note,
  derive its design from the panel design language constraints — same color palette,
  same tone, same component style. Do not introduce anything new.

## FEATURE LOCATION
[Exact feature folder path from CHAT-2-HANDOFF]

## FILES TO CREATE
[List every file this task creates — exact paths from CHAT-2-HANDOFF]

## DO NOT TOUCH
[Use actual file names — e.g., HTTP client file, store file, router file]
- [exact path] — reason (ADD to this file only, never modify existing content)

## DATA SOURCE
[FULL STACK]: API endpoints (documented in api-contracts.md):
  [METHOD] [endpoint constant name] → purpose
[FE ONLY]: Reads existing endpoints:
  [METHOD] [endpoint constant name] — built by [COMP-XX] — in api-contracts.md
  Do NOT create API calls to endpoints not in api-contracts.md.

## ENDPOINT CONSTANTS TO ADD
Add to [exact endpoint constants file path]:
  export const [NAME] = '/[path]';  // [description]
(only NEW constants — do not re-add existing ones)

## STATE MANAGEMENT
[Use the tool from CHAT-2-HANDOFF — Redux Toolkit / Zustand / Context API]
[Use exact file path from CHAT-2-HANDOFF]

State shape: { [field]: [initialValue], loading: false, error: null }

[If Redux Toolkit]:
  Synchronous reducers: [name — what it does]
  Async thunks: [thunkName — what it calls, what it does on fulfilled/rejected]
  Selectors to export: [list with what each returns]
  Register in [store file]: import [feature]Reducer and add to configureStore

[If Zustand]:
  Store file: [exact path]
  State: { [fields] }
  Actions: [name — what it does]
  Register: (Zustand stores are self-contained — just import where needed)

[If Context API]:
  Context file: [exact path]
  State shape: { [fields] }
  Reducer actions: [name — what it does]
  Provider: wrap in [exact location]

## VALIDATION SCHEMAS
[If forms exist in this feature — use exact schema file paths from CHAT-2-HANDOFF]
[fieldName]: [validation rules] — [description]

## SERVICE FILE
[Use exact service file path from CHAT-2-HANDOFF]
Import: [HTTP client] from '[relative path]', endpoint constants from '[relative path]'

[functionName](data):
  - Calls: [METHOD] [ENDPOINT_CONSTANT]
  - Body: { [fields from api-contracts.md] }
  - Returns: response.data.data (unwrapped from envelope)
  - Log: console.log('[API] [functionName] called', data)

## PAGES TO CREATE

### [PageName].jsx ([exact path])
Route: /[path] — Add to [router file] under [which layout wrapper]
Protected: yes/no — role: [if applicable]
CSS file: [co-located CSS path]

What it renders: [describe layout, sections, key elements]

Components used:
  - [ComponentName] — purpose — position on page

State and data:
  - Reads: [what state/selectors]
  - Dispatches/calls: [what thunks/actions/context updates and when]
  - Local state: [only UI state]

User interactions: [action] → [result]

Loading/error/empty states:
  - loading: [what to show]
  - error: [show from err.response?.data?.message or state error]
  - empty: [what to show if no data]

## FEATURE COMPONENTS TO CREATE

### [ComponentName].jsx ([exact path])
CSS file: [co-located path]
Purpose: [what it does]
Props: [name: type — required/optional — description]
Behavior: [what it does, events, internal state]
State: [what it reads, what it dispatches/calls]

## FORM PATTERN (if this feature has forms)
1. Import schema from [exact schema path]
2. useState for field values + field errors
3. On submit: schema.safeParse(data)
   - Fail: set field errors — show inline per field
   - Pass: dispatch thunk / call service action
4. Disable submit + show loading while operation is pending

## INTEGRATION CHECKLIST
- [ ] All API calls use [exact HTTP client path] — not raw fetch()
- [ ] All URLs from endpoint constants — not hardcoded
- [ ] Request payload matches api-contracts.md Input exactly
- [ ] Response data at correct path (e.g., response.data.data.[field])
- [ ] State registered in [store/context file]
- [ ] Routes added in [router file] with correct wrapper
- [ ] Protected pages in ProtectedRoute
- [ ] Loading and error states shown in UI
- [ ] No expensive operations in JSX without useMemo
- [ ] No infinite loops from useEffect deps

## BUG CHECK
- [ ] No unused imports
- [ ] CSS class names match between JSX and CSS files
- [ ] useEffect cleanups in place where needed

## COMPLETION STEP
Open ROADMAP.md. Find - [ ] [COMP-XX-FE]. Change to - [x]. Save.
TASK COMPLETE — AWAITING HUMAN REVIEW
```

---

## TEMPLATE: `.docs/[comp-name]/frontend-review.md`

```markdown
# [COMP-XX] [Component Name] — Frontend Review Instruction
# TYPE: EXECUTION FILE — FOR CODING AGENT

## OVERVIEW
READ-ONLY review. Runs AFTER [COMP-XX-FE] is [x] in ROADMAP.md. Fix issues found.

## TASK ID
[COMP-XX-FE-REVIEW]

## FILES TO READ
[List actual files created in COMP-XX-FE — use exact paths]

## FRONTEND REVIEW CHECKLIST

### Code Quality
- [ ] No inline styles
- [ ] No @/ alias imports
- [ ] No hardcoded URL strings — all from endpoint constants
- [ ] No raw fetch() — all API calls use the HTTP client

### State Management
- [ ] State registered in store/context
- [ ] Async ops go through state layer — not directly in components
- [ ] Loading and error states shown
- [ ] No duplicate state between global store and local useState

### Routing
- [ ] Routes added in router config
- [ ] Protected pages in ProtectedRoute
- [ ] No hardcoded navigation strings

### Forms (if applicable)
- [ ] Schema validation used before API call
- [ ] Inline errors shown per field
- [ ] Submit disabled during pending operation

### API Integration
- [ ] HTTP client used
- [ ] Endpoint constants used
- [ ] Request payload matches api-contracts.md Input
- [ ] Response data read from correct path

### Performance
- [ ] No expensive operations in JSX without useMemo
- [ ] No infinite render loops

## OUTPUT FORMAT
FRONTEND REVIEW PASS — [COMP-XX-FE] — no issues found
OR
FRONTEND REVIEW FAIL — [COMP-XX-FE]
Issues: 1. [file] — [issue]

## COMPLETION STEP
Open ROADMAP.md. Find - [ ] [COMP-XX-FE-REVIEW]. Change to - [x]. Save.
TASK COMPLETE — AWAITING HUMAN REVIEW
```

---

## TEMPLATE: `.docs/[comp-name]/integration-review.md` (FULL STACK only)

```markdown
# [COMP-XX] [Component Name] — Integration Review Instruction
# TYPE: EXECUTION FILE — FOR CODING AGENT

## OVERVIEW
READ-ONLY check. Runs ONLY after BOTH [COMP-XX-BE-REVIEW] and [COMP-XX-FE-REVIEW] are [x].
Verify FE and BE are correctly wired. Fix mismatches — no other files.

## TASK ID
[COMP-XX-INTEGRATION]

## FILES TO READ
[List actual backend + frontend files — exact paths]
shared/api-contracts.md

## INTEGRATION CHECKLIST

### URL and Method Matching
- [ ] Every frontend endpoint constant maps to an actual backend route
- [ ] HTTP methods match
- [ ] URL params match

### Request Payload
- [ ] Every frontend field exists in backend validator + controller
- [ ] No missing required fields
- [ ] Field names match exactly

### Response Consumption
- [ ] Frontend reads from correct path (e.g., response.data.data.[field])
- [ ] No fields read that don't exist in backend response

### Authentication
- [ ] Backend protected routes have ProtectedRoute on frontend
- [ ] HTTP client used — interceptor attaches token
- [ ] Backend auth middleware on protected routes

### Error Handling
- [ ] Every backend error case handled on frontend
- [ ] Error messages from err.response?.data?.message
- [ ] 401 handled ONLY by interceptor

### Socket Events (if applicable)
- [ ] Every frontend emit has backend listener
- [ ] Every backend emit has frontend listener
- [ ] Payloads match — verified against shared/socket-events.md

## OUTPUT FORMAT
INTEGRATION PASS — [COMP-XX] — fully aligned
OR
INTEGRATION FAIL — [COMP-XX]
Mismatches: 1. [FE file] — calls [X] but BE expects [Y] — fix: [what to change]

## COMPLETION STEP
Open ROADMAP.md. Find - [ ] [COMP-XX-INTEGRATION]. Change to - [x]. Save.
TASK COMPLETE — AWAITING HUMAN REVIEW
```

---

After ALL files for a component are generated, output updated PROJECT-BRAIN.md, then:
**"[COMP-XX] complete — [N] files generated. Ready for [COMP-XX+1]?"**

---

## PART COMPLETION

When the last component in CONFIGURATION is done:

1. Output final PROJECT-BRAIN.md (all listed components [x])
2. Output complete updated shared/api-contracts.md
3. Tell the user:

"Part [N] complete.

Files to save:
  PROJECT-BRAIN.md
  shared/api-contracts.md  (updated)
  All .docs/ files from this part

4. Fill in CONFIGURATION with next batch of components using CHAT3-PARTS.md and output in this format : 

```
Part number       : [part number] of [total parts]
Previous parts    : [previous parts] complete

Components to process IN THIS PART ONLY (max 5):
 [list components]

Sources uploaded for this chat:
  [list sources]
```
  
5. Write: PART COMPLETE — DO NOT CONTINUE
6. STOP.

---

## FINAL PART COMPLETION

When all components from CHAT-2-HANDOFF are complete:

1. Output final PROJECT-BRAIN.md (every component [x])
2. Output complete final shared/api-contracts.md
3. Tell the user:

"Chat 3 is complete. All instruction files are in .docs/.

Files to save before Chat 4:
  PROJECT-BRAIN.md  (final)
  shared/api-contracts.md  (final)
  All .docs/ files

To start Chat 4: paste MASTER.md + planning/prompts/chat-4-finalize.md + PROJECT-BRAIN.md"

4. Write: CHAT 3 COMPLETE — PROCEED TO CHAT 4
5. STOP.
