# Metro Connect - Implementation Tracker

## Project Overview
- **Product:** Metro Connect (Metro Sathi)
- **Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase + shadcn/ui
- **Current State:** Phase 8 complete (MVP DONE). All 8 phases implemented: auth, profile, trips, search, connections, chat, reporting, dashboard & polish.

---

## Implementation Plan

### Phase 1: Foundation Setup
- [x] 1.1 Install shadcn/ui core components (button, input, badge, avatar, dialog, dropdown-menu, select, tabs, toast, separator, card, label, textarea, radio-group, checkbox, popover, command, sheet, sonner, tooltip, scroll-area)
- [x] 1.2 Set up custom Tailwind theme tokens (colors from design doc: primary blue, accent orange, gender colors, semantic colors)
- [x] 1.3 Create Delhi Metro station data file (all 12 lines, 300+ stations with sequences, interchange data)
- [x] 1.4 Set up app layout with mobile bottom navigation + desktop sidebar
- [x] 1.5 Update metadata (title, description, viewport, theme-color)
- [x] 1.6 Set up Supabase client (install @supabase/supabase-js, @supabase/ssr, client + server helpers)
- [x] 1.7 Create database schema SQL (profiles, trips, connections, messages, reports + RLS + triggers + storage)
- [x] 1.8 Set up Supabase auth with Google OAuth (auth callback route, onboarding redirect)
- [x] 1.9 Create auth middleware for protected routes
- [x] 1.10 (Added) Create TypeScript types for all entities
- [x] 1.11 (Added) Create landing page with Google sign-in (moved from Phase 2)
- [x] 1.12 (Added) Create dashboard page with "How it Works" and empty states
- [x] 1.13 (Added) Create placeholder pages for all routes (search, trips, connections, profile, onboarding)
- [x] 1.14 (Added) Create .env.local.example template

### Phase 2: Auth & Profile
- [x] 2.1 Build landing/onboarding page (hero, Gmail sign-in button) -- done in Phase 1
- [x] 2.2 Implement Google OAuth flow with Supabase Auth -- done in Phase 1
- [x] 2.3 Build profile setup page (multi-step: basic info, confirm, done)
- [x] 2.4 Build profile page (/profile) with view and edit functionality
- [x] 2.5 Profile picture upload to Supabase Storage
- [x] 2.6 Auth state management (context/provider)
- [x] 2.7 (Added) Zod validation schemas for profile
- [x] 2.8 (Added) Switch component for phone visibility toggle

### Phase 3: Trip Management
- [x] 3.1 Build StationPicker component (searchable, grouped by metro line, with color dots and interchange labels)
- [x] 3.2 Build TripForm component (start/end station, date, time, trip type, weekday toggles)
- [x] 3.3 Build Add Trip page (/trips/new)
- [x] 3.4 Build My Trips page (/trips) with grouped list view (Today/Tomorrow/date), edit dialog, delete
- [x] 3.5 Trip CRUD API routes (GET /api/trips, POST /api/trips, PUT /api/trips/[id], DELETE /api/trips/[id])
- [x] 3.6 Trip form validation (Zod schema with start!=end refinement)

### Phase 4: Search & Discovery
- [x] 4.1 Build search page (/search) with search form
- [x] 4.2 Implement matching algorithm (+-5 stations, +-30 min, gender filter)
- [x] 4.3 Build TripCard component for search results
- [x] 4.4 Build profile modal (view other user's profile)
- [x] 4.5 Search API route with filtering and sorting
- [x] 4.6 Loading skeletons and empty states
- [x] 4.7 (Added) Connection sending from search results

### Phase 5: Connection System
- [x] 5.1 Build connection request flow (send, accept, decline)
- [x] 5.2 Build Connections page (/connections) with Requests + My Connections tabs
- [x] 5.3 Connection API routes (GET list, POST send, PATCH accept/decline)
- [x] 5.4 Connection status on search results (none/pending/connected) -- done in Phase 4
- [x] 5.5 Notification badge on connections tab (polling every 30s)
- [x] 5.6 (Added) Sent requests section in Requests tab
- [x] 5.7 (Added) ConnectionCard component with avatar, gender badge, time ago
- [x] 5.8 (Added) Profile modal on connection cards
- [x] 5.9 (Added) Duplicate connection check in POST API

### Phase 6: In-App Chat
- [x] 6.1 Build ChatWindow component (header, messages, input, auto-resize textarea)
- [x] 6.2 Build chat message bubbles (sent blue/received white, timestamps, avatar grouping)
- [x] 6.3 Chat API routes (GET /api/messages, POST /api/messages with auth + connection check)
- [x] 6.4 Supabase Realtime subscription for live messages (postgres_changes INSERT)
- [x] 6.5 Desktop split view (connections list w-80 + chat panel)
- [x] 6.6 Message history with date separators (Today/Yesterday/date)
- [x] 6.7 (Added) Mobile full-screen chat overlay with back button
- [x] 6.8 (Added) Optimistic message sending with rollback on failure
- [x] 6.9 (Added) Empty chat state with "Start the conversation" prompt
- [x] 6.10 (Added) URL-driven chat state (?chat=userId) with router.replace
- [x] 6.11 (Added) Compact connection cards in desktop split view

### Phase 7: Safety & Reporting
- [x] 7.1 Build ReportModal component (multi-step: reason selection, details, confirmation)
- [x] 7.2 Report API route (POST /api/reports with auth, validation, duplicate check)
- [x] 7.3 Report confirmation flow (3-step: select reason → add details → success)
- [x] 7.4 (Added) Integrated ReportModal into ProfileModal (replaces toast placeholder)
- [x] 7.5 (Added) 6 report reasons with icons (fake profile, harassment, inappropriate, spam, safety, other)

### Phase 8: Dashboard & Polish
- [x] 8.1 Build dashboard page with real data (trips, stats, greeting) -- rewritten with live API data
- [x] 8.2 Toast notification system (Sonner configured) -- done in Phase 1
- [x] 8.3 Error boundaries (root + app route group) with Try Again + Dashboard buttons
- [x] 8.4 Loading states (root loading.tsx + app loading.tsx + skeleton states in all pages)
- [x] 8.5 Custom 404 not-found page
- [x] 8.6 (Added) Quick stats cards on dashboard (trips, connections, pending with ping indicator)
- [x] 8.7 (Added) Personalized greeting ("Hey, {firstName}!")
- [x] 8.8 (Added) Fixed font variable (Inter instead of Geist)
- [x] 8.9 Accessibility: aria-labels on nav, badges, send button

---

## Changes Log

| Date | What Changed | Why | Files Affected | Dependencies Added |
|------|-------------|-----|----------------|-------------------|
| Feb 15 | Created landing page in Phase 1 | Natural to build with layout setup | app/page.tsx | - |
| Feb 15 | Created dashboard page in Phase 1 | Needed to validate layout/nav works | app/(app)/dashboard/page.tsx | - |
| Feb 15 | Created all route placeholders | Ensures navigation works end-to-end | app/(app)/* pages | - |
| Feb 15 | Added TypeScript types file | Needed for type-safe development | lib/types.ts | - |
| Feb 15 | Switched from Geist to Inter font | Design doc specifies Inter as primary | app/layout.tsx | - |
| Feb 16 | Built AuthProvider context | Needed for global auth state | lib/auth-context.tsx | - |
| Feb 16 | Built multi-step onboarding | 3 steps: basic info, confirm, done | app/onboarding/page.tsx | - |
| Feb 16 | Built profile page with edit mode | View + inline edit toggle | app/(app)/profile/page.tsx | switch component |
| Feb 16 | Fixed zod v4 API compatibility | Zod v4 uses `error` instead of `invalid_type_error` | lib/validations.ts | - |
| Feb 16 | Built matching algorithm | Station proximity (±5) + time proximity (±30min) matching | lib/matching.ts | - |
| Feb 16 | Built search API | Filters trips by station/time/gender, sorts by match score | app/api/search/route.ts | - |
| Feb 16 | Built TripCard + ProfileModal | Search result cards + detailed profile view in dialog | components/trip-card.tsx, components/profile-modal.tsx | - |
| Feb 16 | Built full search page | Form, results, loading skeletons, empty states, connection sending | app/(app)/search/page.tsx | - |
| Feb 16 | Built connection API routes | GET (list with categories), POST (send with dupe check), PATCH (accept/decline) | app/api/connections/ | - |
| Feb 16 | Built full connections page | Requests tab (incoming + sent), My Connections tab, accept/decline, profile modal | app/(app)/connections/page.tsx | - |
| Feb 16 | Added pending count to nav | App layout polls /api/connections every 30s, passes pendingCount to AppShell | app/(app)/layout.tsx | - |
| Feb 16 | Fixed Suspense boundary | useSearchParams requires Suspense wrapper in Next.js 16 | app/(app)/connections/page.tsx | - |
| Feb 16 | Built messages API | GET (fetch by connection_id), POST (send with auth + connection check) | app/api/messages/route.ts | - |
| Feb 16 | Built ChatWindow component | Header, message bubbles, date separators, auto-resize input, Realtime | components/chat-window.tsx | - |
| Feb 16 | Integrated chat into connections page | Desktop split view + mobile full-screen overlay, URL-driven state | app/(app)/connections/page.tsx | - |
| Feb 16 | Built report API | POST with auth, reason validation, duplicate check | app/api/reports/route.ts | - |
| Feb 16 | Built ReportModal | Multi-step: reason → details → confirmation | components/report-modal.tsx | - |
| Feb 16 | Integrated ReportModal into ProfileModal | Replaces "coming soon" toast with full report flow | components/profile-modal.tsx | - |
| Feb 16 | Rewrote dashboard with real data | Personalized greeting, quick stats, upcoming trips from API | app/(app)/dashboard/page.tsx | - |
| Feb 16 | Added error boundaries | Root + app-level error pages with Try Again | app/error.tsx, app/(app)/error.tsx | - |
| Feb 16 | Added loading + 404 pages | Root loading, app loading, custom not-found page | app/loading.tsx, app/(app)/loading.tsx, app/not-found.tsx | - |
| Feb 16 | Fixed font variable | Changed from --font-geist-sans to --font-inter | app/layout.tsx, app/globals.css | - |
| Feb 16 | Accessibility pass | aria-labels on nav, badges, chat send button | bottom-nav, desktop-sidebar, chat-window | - |

## Decisions Made

| Decision | Reasoning | Date |
|----------|-----------|------|
| Use route group `(app)` for authenticated pages | Clean separation of public vs authenticated layouts | Feb 15 |
| Landing page at `/`, dashboard at `/dashboard` | Middleware redirects logged-in users to dashboard | Feb 15 |
| Inter font instead of Geist | Design doc specifies Inter as primary font | Feb 15 |
| Green Line includes extended Faridabad route | More complete station coverage for users | Feb 15 |
| Sonner for toasts instead of shadcn toast | Better mobile UX, simpler API, rich color support | Feb 15 |
| Simplified onboarding to 2 steps + done | Preferences step removed for MVP - can add later in settings | Feb 16 |
| Zod v4 API: `error` instead of `invalid_type_error` | Zod v4 breaking change from v3 | Feb 16 |
| Match scoring: station distance + 0.1×time diff | Prioritizes route match over time proximity | Feb 16 |
| Search handles both one-time and repeating trips | Query uses OR: date match or (is_repeating AND day-of-week match) | Feb 16 |
| Social links visible only when connected | Privacy: Instagram/Twitter shown only after connection accepted | Feb 16 |
| Only recipient can accept/decline connections | RLS + API-level check for security | Feb 16 |
| Poll for pending count every 30s | Simple approach; can upgrade to Supabase Realtime later | Feb 16 |
| Connections API returns categorized data | Single endpoint returns pending/sent/accepted arrays + pendingCount | Feb 16 |
| Chat uses URL state (?chat=userId) | Allows deep linking to specific chats, preserves state on refresh | Feb 16 |
| Optimistic message sending | Show message immediately, rollback on API failure | Feb 16 |
| Realtime deduplication | Check message ID to avoid showing duplicates from optimistic + realtime | Feb 16 |
| Mobile chat as fixed overlay | z-50 full-screen overlay hides bottom nav for immersive chat | Feb 16 |
| Duplicate report prevention | Check for existing pending report before inserting | Feb 16 |
| Report modal opens from ProfileModal | Stacked dialog pattern - report overlays profile | Feb 16 |

## Known Issues / Tech Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| Next.js 16 middleware deprecation warning | Low | "middleware" convention deprecated in favor of "proxy" - works fine for now |
| No .env.local with actual Supabase keys | Blocker for auth | Need to create Supabase project and add keys |
| Violet Line route may need verification | Low | Some stations may overlap with Magenta Line in Janakpuri area |

## Dependencies Added

| Package | Purpose | Phase |
|---------|---------|-------|
| @supabase/supabase-js | Supabase JS client | 1 |
| @supabase/ssr | Supabase SSR helpers (cookies) | 1 |
| 20 shadcn/ui components | UI component library | 1 |

## Files Created in Phase 1

```
lib/
  types.ts                    - TypeScript types for all entities
  metro-data.ts               - 300+ Delhi Metro stations across 12 lines
  utils.ts                    - cn() utility (existing)
  supabase/
    client.ts                 - Browser Supabase client
    server.ts                 - Server Supabase client
    middleware.ts              - Auth session management
    schema.sql                - Full DB schema with RLS, triggers, storage

components/
  layout/
    app-shell.tsx             - Main app wrapper with sidebar + bottom nav
    bottom-nav.tsx            - Mobile bottom tab navigation
    desktop-sidebar.tsx       - Desktop left sidebar navigation
  ui/
    (20 shadcn components)    - button, input, badge, avatar, dialog, etc.

app/
  layout.tsx                  - Root layout (Inter font, Sonner toaster)
  globals.css                 - Theme tokens + custom colors
  page.tsx                    - Landing page (public, Google sign-in)
  auth/callback/route.ts      - OAuth callback handler
  onboarding/page.tsx         - Onboarding placeholder
  (app)/
    layout.tsx                - Authenticated layout with AppShell
    dashboard/page.tsx        - Dashboard with how-it-works + empty states
    search/page.tsx           - Search placeholder
    trips/page.tsx            - My Trips placeholder
    trips/new/page.tsx        - Add Trip placeholder
    connections/page.tsx      - Connections with tabs placeholder
    profile/page.tsx          - Profile placeholder

middleware.ts                 - Next.js auth middleware
.env.local.example            - Environment variable template
```
