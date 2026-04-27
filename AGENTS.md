# TBZ Booking System — Frontend Agent Reference

## Project Overview
SvelteKit 5 (runes mode) static SPA — a table booking system for a tabletop game shop (Tableraze Montpellier). Migrated from AngularJS v1.

- **Frontend**: `c:\Users\Vivien\git\tbz-booking-system-frontend`
- **Backend**: `c:\Users\Vivien\git\tbz-booking-system-backend` (Go/Gin REST API)
- **Dev server**: `http://localhost:5173` (`npm run dev`)
- **Backend**: `http://localhost:9090` (`go run ./main.go`)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit 5 (runes mode: `$state`, `$derived`, `$derived.by`, `$bindable`) |
| Styling | TailwindCSS v4 |
| UI Components | **shadcn-svelte** (always prefer over raw HTML elements) |
| Icons | lucide-svelte (`@lucide/svelte`) |
| Charts | chart.js + svelte-chartjs |
| Date handling | **date-fns** (always use, never raw `Date` manipulation) |
| Localization | Paraglide (French only, scaffold in place) |
| Adapter | `adapter-static` with `fallback: '200.html'`, SSR disabled, prerender true |

---

## User Preferences

- **Always use shadcn-svelte components** — never raw `<button>`, `<input>`, `<label>`, `<select>`, `<textarea>`, `<checkbox>`. Use `Button`, `Input`, `Label`, `Checkbox`, `Select`, `Textarea`, `Field`, `FieldLabel`, `FieldContent`, `FieldSet`, etc.
- Use `date-fns` for all date formatting, parsing, and arithmetic.
- Use `$derived.by()` for multi-line derived computations, `$derived()` for single expressions.
- Always run `npm run check` after changes.
- Prefer minimal, focused edits.

---

## Project Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts         # apiFetch() with token auth (header: accesstoken)
│   │   ├── auth.ts           # exchangeCode(), getUserInfo()
│   │   ├── bookings.ts       # CRUD + accept/refuse/cancel
│   │   ├── discord.ts        # searchUsers()
│   │   └── stats.ts          # getStatsByGame(), getStatsByGamePeriod(), getStatsByDay()
│   ├── components/
│   │   ├── BookingCard.svelte
│   │   ├── NewBookingDialog.svelte
│   │   ├── Navbar.svelte
│   │   ├── BottomNav.svelte
│   │   └── UserMenu.svelte
│   ├── components/ui/        # shadcn-svelte components (treat as library, don't modify)
│   ├── stores/
│   │   ├── auth.svelte.ts    # auth store with init() (async, rehydrates user on reload)
│   │   └── theme.svelte.ts   # dark/light theme store
│   ├── config.ts             # GAMES, GAME_LOGO_MAP, OPENING_HOURS, SHOP_HOURS, MAX_TABLES, AVG_GAME_HOURS, DISCORD_OAUTH_URL, SHOP_NAME
│   ├── types.ts              # Booking, DiscordUser, OAuthToken, GameBookingCount, WeekDayBookingCount
│   └── nav.ts                # navLinks (shared between Navbar and BottomNav)
└── routes/
    ├── +layout.svelte        # Root layout: auth guard, spinner while init, theme class on <html>
    ├── +page.svelte          # Login page (Discord OAuth button)
    ├── auth/callback/        # OAuth callback — exchanges code, stores token, redirects
    └── (app)/                # Route group — authenticated pages, uses (app)/+layout.svelte
        ├── +layout.svelte    # App shell: Navbar (desktop) + BottomNav (mobile) + <slot>
        ├── reservations/     # All active bookings, grouped by day descending
        ├── mes-reservations/ # Current user's bookings, grouped by month descending
        └── statistiques/     # Charts: bookings by game (with period filter) + by weekday
```

---

## Auth Flow

1. Login page → Discord OAuth redirect
2. `/auth/callback` exchanges code via backend → stores `accesstoken` in `localStorage` (key: `tbz_token`)
3. Root `+layout.svelte` calls `await auth.init()` on mount:
   - Reads token from localStorage
   - Calls `getUserInfo()` to rehydrate `auth.user`
   - If token invalid → clears storage, redirects to `/`
4. Page hidden behind `{#if ready}` to prevent flash of wrong content (spinner shown during init)
5. Auth guard in `+layout.svelte`: non-authenticated → `/`, authenticated on `/` → `/reservations`

---

## API

- Base URL from `VITE_API_BASE_URL` env var (default: `http://localhost:9090`)
- Auth header: `accesstoken: <token>` (not Bearer)
- All calls via `apiFetch<T>()` in `src/lib/api/client.ts`

### Key Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/bookings` | All active bookings |
| GET | `/api/v1/bookings/:username` | User's bookings |
| POST | `/api/v1/bookings` | Create booking |
| PUT | `/api/v1/bookings/:id/accept` | Accept (admin) |
| PUT | `/api/v1/bookings/:id/refuse?reason=` | Refuse (admin) |
| PUT | `/api/v1/bookings/:id/cancel` | Cancel (owner) |
| PUT | `/api/v1/bookings/:id/modify` | Modify (owner) |
| GET | `/api/v1/bookings/stats/game` | Bookings count per game |
| GET | `/api/v1/bookings/stats/game/period?startPeriod=&endPeriod=` | Same with date range |
| GET | `/api/v1/bookings/stats/day` | Bookings count per weekday |
| GET | `/api/discord/user/info` | Current user info |

### DateTime Format
- **Send**: `formatISO(date)` → `2026-04-28T10:00:00+02:00` (RFC3339 with offset, required by Go's `time.Time`)
- **Receive**: `2026-04-28T08:00:00Z` (UTC)
- **Display**: always use `getUTCHours()` / `getUTCMinutes()` or `Intl.DateTimeFormat` with `timeZone: 'UTC'` to avoid local timezone shift

---

## Theming

- Dark mode by default: `:root` (dark), `:root.light` (light)
- Theme class applied to `<html>` element
- shadcn token base: **zinc**, primary: **purple** via oklch
- CSS variables in `src/routes/layout.css`
- Status badge colors: `--color-status-pending/accepted/refused/canceled`

---

## Key Components

### BookingCard
Props: `booking`, `onAccept?`, `onRefuse?`, `onCancel?`
- Shows game logo, status badge, time (UTC), points, players
- Admin actions (accept/refuse) shown for admins on pending bookings
- Cancel shown for owner on pending bookings

### NewBookingDialog
Props: `open` (bindable), `onCreated?`, `bookings?` (for busy-day warning)
- Fields: game (Select), date (Calendar+Popover), time (Input), points (Input), players (debounced search), description (Textarea), reminder (Checkbox)
- Validation: ≥12h ahead, within shop hours (`SHOP_HOURS`), closed day
- Busy-day warning: counts overlapping accepted/pending bookings vs `MAX_TABLES * 0.75`
- Opening hours collapsible under time field
- Uses `formatISO()` for submission

### Auth Store (`auth.svelte.ts`)
```ts
auth.init()       // async — restores token + re-fetches user
auth.isAuthenticated
auth.user         // DiscordUser | null
auth.token
auth.setToken(t)
auth.setUser(u)
auth.logout()
```

---

## Config Constants (`src/lib/config.ts`)

| Constant | Description |
|---|---|
| `GAMES` | Static list of games with name + logo path |
| `GAME_LOGO_MAP` | Record<name, logoPath> |
| `SHOP_HOURS` | Per-weekday open/close (index 0=Mon…6=Sun), null=closed |
| `OPENING_HOURS` | Human-readable opening hours (for display) |
| `MAX_TABLES` | `4` — number of tables in the shop |
| `AVG_GAME_HOURS` | `3` — average game duration for capacity calculations |
| `SHOP_NAME` | `'Tableraze Montpellier'` |
| `DISCORD_OAUTH_URL` | Built from env vars |

---

## Known Issues / Notes

- `getStatsByDay()` occasionally fails with `conn busy` (backend DB connection pool issue, not a frontend bug)
- Time display is always UTC to avoid timezone offset issues (backend stores in UTC)
- `date-fns` `fr` locale imported as `frLocale` from `date-fns/locale`
- The `(app)` route group scopes the app shell layout without affecting URLs
- shadcn `Field` component supports `orientation="horizontal"` for inline label+input (e.g. checkbox + label)

---

## Remaining / Future Work

- Edit booking dialog (modify pending booking's date/time/game)
- Refuse with reason dialog (admin)
- PWA manifest + service worker
- AngularJS decommission once feature parity confirmed
