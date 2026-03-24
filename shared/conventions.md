# shared/conventions.md
# TYPE: EXECUTION FILE — FOR CODING AGENT
# Read this before every task. Every rule here is non-negotiable.

## Project Overview
Name: EduCore ERP | Stack: React+Vite(JSX), Redux Toolkit, Axios, Socket.io-client, Recharts
      Node+Express, MongoDB+Mongoose, JWT, Socket.io, Cloudinary, Twilio, Nodemailer, pdfkit
Multi-tenancy: Shared MongoDB. schoolId on every school doc. scopeToSchool injects req.schoolId.

## API Response Format
Success: { "success":true, "message":"...", "data":{...} }
Error:   { "success":false, "message":"...", "errors":[...] }
Paginated data: { "items":[...], "total":N, "page":N, "limit":N, "totalPages":N }
HTTP codes: 200 ok | 201 created | 400 bad req | 401 unauth | 403 forbidden | 404 not found | 409 conflict | 422 validation | 500 server

## Axios Instance Rules
Single instance at frontend/src/services/axiosInstance.js — NEVER create another.
Request interceptor: read accessToken from localStorage (appConfig.ACCESS_TOKEN_KEY) → Authorization: Bearer.
Response interceptor (401 ONLY): POST /auth/refresh → store new token + retry OR dispatch clearAuth() → redirect /login.

## CORS: app.js ONCE — origin: process.env.CLIENT_URL, credentials: true. Never in route files.

## Rate Limiting
STRICT 5/min — /auth/* | MODERATE 30/min — POST/PUT/PATCH/DELETE | LIGHT 100/min — GET
Route order: rateLimiter → validate(schema) → controller. Never skip.

## Token Rules
Access: localStorage appConfig.ACCESS_TOKEN_KEY, 15min. Refresh: httpOnly cookie, 7d, NEVER readable by JS.
JWT: { userId, role, schoolId } — schoolId null for superAdmin.
mustChangePassword: amber banner on ProfilePage, NOT a redirect block.

## Backend Validation Pattern
express-validator in feature validators file. validate() middleware → 422 + errors array if invalid.
Controllers NEVER manually check fields. ALL inputs trimmed in validators.

## Frontend Form Pattern
Zod + React Hook Form + @hookform/resolvers/zod. Schema in featureSchemas.js.
Field-level errors (var(--danger)). NEVER call API without Zod validation.

## State Management Pattern
ALL async ops via createAsyncThunk. NEVER call axiosInstance from components.
Standard slice: { items:[], selectedItem:null, loading:false, error:null, pagination:{page:1,limit:20,total:0,totalPages:0} }
toast.success() in fulfilled. toast.error() for network errors. Local useState: modal/tab/sort only.

## Import Rules
Relative paths only. No @/ alias. No barrel index.js files.
Order: React → third-party → Redux → local feature → shared components → CSS.

## Naming Conventions
PascalCase.jsx components | PascalCase.css co-located | camelCase.js hooks/utils
camelCase+Slice.js Redux | camelCase+Schemas.js Zod | PascalCase.js BE models
SCREAMING_SNAKE_CASE constants | kebab-case CSS classes | BEM: .block__element--modifier

## Security Rules
No hardcoded secrets. Trim all inputs. MIME whitelist uploads. UUID server filenames.
bcrypt BCRYPT_ROUNDS=12. OTPs bcrypt-hashed, deleted on first use.
ALL school-scoped queries use req.schoolId — NEVER req.body schoolId for scoping.

## Env Management
BE env vars: PORT MONGO_URI JWT_ACCESS_SECRET JWT_REFRESH_SECRET CLIENT_URL
  CLOUDINARY_* TWILIO_* NODEMAILER_*
FE env vars: VITE_API_URL
config/env.js validates all BE vars. process.exit(1) if any missing. Only config/ reads process.env.

## Logging Convention
console.log('[Controller] method — userId: X') | console.log('[Service] op starting')
console.log('[Cloudinary] upload success') | console.log('[Socket] emitted — room: X')
console.error('[GlobalErrorHandler] ', err.stack) — ONLY here. Never log passwords/tokens/PII.

## Error Handling
BE: asyncHandler wraps controllers (no try/catch). Services throw AppError. globalErrorHandler formats all.
FE: 401 → interceptor only. Others → rejectWithValue → inline. Network → toast.error. Success → toast.success.

## Protected Files (add to, never restructure)
backend/src/routes/v1.js — each COMP-BE adds one router.use() line
frontend/src/store/rootReducer.js — each COMP-FE adds one slice key
frontend/src/router/AppRouter.jsx — each COMP-FE adds route entries

## Design Language Rule
No hardcoded colors in component CSS. CSS variables only.
.school-panel: --school-primary:#0B9ADB, --school-bg:#EAF5FF
.sa-panel: --sa-primary:#00C37F, --sa-bg:#F4F5F7
Shared: --font-family:'Inter',sans-serif | --border-radius-md:8px
  --text-primary:#1A1D23 | --danger:#EF4444 | --warning:#F59E0B | --success:#22C55E
Inter from Google Fonts in index.html. No system fonts ever.

---