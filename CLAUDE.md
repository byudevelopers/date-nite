# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Date Nite is a community-driven date idea rating application for university students (starting with BYU). Users can submit, rate, and discover date ideas based on community feedback. The application uses a REST API architecture with React frontend and Node.js/Express backend backed by SQLite, with JWT-based authentication.

## Development Commands

### Frontend
```bash
# Run frontend dev server (serves from /frontend directory)
npm run dev

# Build frontend for production
npm run build

# Preview production build
npm run preview
```

### Backend
```bash
cd backend

# Run backend dev server with auto-reload on port 3000
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server
npm start

# Run tests
npm test
```

### Testing
- Backend uses Jest with ts-jest for testing
- Test files follow pattern `**/*.test.ts`
- Run specific test: `cd backend && npm test -- <test-file-name>`

## Architecture

### Monorepo Structure
This repository contains both frontend and backend in separate directories at the root level:
- `/frontend` - React application (JSX, not TypeScript yet)
- `/backend` - Express API server (TypeScript with CommonJS)
- `/shared` - Shared TypeScript types/DTOs used by both frontend and backend
- Root `vite.config.js` points to `/frontend` as root directory

### Project File Structure
```
date-nite/
├── frontend/
│   ├── src/
│   │   ├── pages/ (Home, Login, DevTools, Favorites*, Profile*, DateInfo*)
│   │   │   └── components/ (Navbar, DateCard, Sidebar, SearchBar)
│   │   ├── services/ (api.js)
│   │   ├── styles/ (9 CSS files)
│   │   ├── main.jsx
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/ (users.ts, dates.ts, health.ts)
│   │   ├── services/ (userService, authService, dateService)
│   │   ├── middleware/ (auth, errorHandler)
│   │   ├── utils/ (jwt, errorLogging)
│   │   ├── database.ts
│   │   └── index.ts
│   └── config files (package.json, tsconfig.json, jest.config.js)
├── shared/types/ (user.types, auth.types, index)
├── date-nite.db (gitignored, created at runtime)
└── config files (package.json, vite.config.js, CLAUDE.md)

* = placeholder/incomplete
```

### Backend Architecture (Service-Route Pattern)

The backend follows a layered architecture separating concerns:

1. **database.ts** - SQLite database operations using better-sqlite3
   - Exports configured database instance with auto-creation of tables on startup
   - Contains low-level CRUD functions for users, dates, and ratings tables
   - Functions throw errors on failure (no error wrapping here)
   - Important: `createUser()` expects pre-hashed passwords
   - Rating helper functions: `getRatingsByDateId()` for aggregate calculations, `getRecentRatingByUser()` for cooldown checks

2. **services/** - Business logic layer
   - `userService.ts`: User registration and favorite date operations
   - `authService.ts`: Login, JWT generation, cookie handling
   - `dateService.ts`: Date idea business logic
   - Services orchestrate multiple database calls and apply business rules
   - All service functions use DTOs from `/shared/types` for type safety

3. **routes/** - HTTP request handling
   - `users.ts`: User authentication (register, login, logout, /me) and favorites (get, remove)
   - `dates.ts`: Date ideas (get all)
   - `health.ts`: Health check
   - Routes validate requests, return standardized errors, appropriate HTTP status codes

4. **index.ts** - Express app setup
   - Mounts routers (`/users`, `/health`)
   - CORS middleware configured for frontend origin with credentials support
   - JSON body parsing and cookie parser middleware
   - Server listening on port 3000

5. **middleware/** - Request processing middleware
   - `auth.ts`: JWT token verification middleware
     - `authenticateToken()` - Validates JWT from httpOnly cookie
     - Adds decoded user payload to `req.user` for use in route handlers
     - Returns 401 for missing/expired tokens, 403 for invalid tokens
   - `errorHandler.ts`: Global error handling middleware (available but not currently mounted)

6. **utils/** - Utility functions
   - `jwt.ts`: JWT token signing and verification
     - `signToken()` - Creates JWT with user ID and email (7-day expiration)
     - `verifyToken()` - Validates and decodes JWT tokens
   - `errorLogging.ts`: Error logging utility
     - `logServerError()` - Structured error logging with timestamp and context

### Authentication & JWT

The application uses cookie-based JWT authentication with bcrypt password hashing:

**Token Flow:**
1. User registers/logs in via backend API
2. Backend validates credentials (bcrypt) and generates JWT (7-day expiration)
3. JWT stored in httpOnly cookie; user object in localStorage
4. Browser sends cookie automatically; middleware validates JWT

**Response Format:** See Shared Types section for RegisterResponseDTO/LoginResponseDTO structure.

**Error Codes:**
- `VALIDATION_ERROR` (400) - Missing required fields
- `INVALID_CREDENTIALS` (401) - Wrong email/password
- `UNAUTHORIZED` (401) - Missing or expired token
- `TOKEN_EXPIRED` (401) - JWT token has expired
- `TOKEN_INVALID` (403) - Malformed JWT token
- `REGISTRATION_FAILED` (500) - Server error during registration
- `LOGIN_FAILED` (500) - Server error during login

**Protected Routes:**
Use the `authenticateToken` middleware to protect routes:
```typescript
router.get("/me", authenticateToken, async (req, res) => {
  // req.user contains decoded JWT payload
  res.json({ user: req.user });
});
```

**API Usage Examples:**
```bash
# Registration (sets httpOnly cookie)
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' -c cookies.txt

# Login, protected routes, and logout use -c (set cookie) or -b (use cookie)
POST /users/login -d '{"email":"...","password":"..."}' -c cookies.txt
GET /users/me -b cookies.txt
POST /users/logout -b cookies.txt
```

**Frontend API Pattern:** Frontend uses `credentials: 'include'` in fetch requests for cookie-based auth.

*Create Rating:*
```bash
curl -X POST http://localhost:3000/ratings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date_id": "date-uuid",
    "romance_level": "romantic",
    "group_size": "double",
    "cost": 50.00,
    "good_bad": "good",
    "first_date": true
  }'
```

*Get Rating Averages (with filters):*
```bash
curl "http://localhost:3000/ratings/averages/date-uuid?romance_level=romantic&group_size=double&first_date=true"
```

### Shared Types (DTOs)

Located in `/shared/types/`, these TypeScript interfaces are used by both frontend and backend:

**User Types:** User, RegisterUserDTO, RegisterResponseDTO
**Auth Types:** LoginDTO, LoginResponseDTO, LogoutResponseDTO, JWTPayload, AuthErrorCode

**Date Types** (`date.types.ts`):
- `Date` - Date idea entity
- `GooglePlace` - Google Place data structure
- `PlacesSearchResponseDTO` - Response from place search
- `CreateDateDTO` - Date creation request (includes google_place_id for venue dates)
- `CreateDateResponseDTO` - Date creation response
- `DateErrorCode` - Standard error codes (PLACE_NOT_FOUND, PLACES_API_ERROR, etc.)

**Rating Types** (`rating.types.ts`):
- `Rating` - Rating entity with id, user_id, date_id, romance_level, group_size, cost, good_bad, first_date, created_at
- `CreateRatingDTO` - Rating creation request (all fields required except review)
- `CreateRatingResponseDTO` - Rating creation response
- `RatingAveragesDTO` - Aggregate statistics with filters applied
- `RatingErrorCode` - Standard error codes (VALIDATION_ERROR, DATE_NOT_FOUND, DUPLICATE_RATING_COOLDOWN, etc.)

**Backend Import:**
```typescript
import type { RegisterUserDTO } from "@shared/user.types";
import type { LoginDTO } from "@shared/auth.types";
import type { CreateRatingDTO, RatingAveragesDTO } from "@shared/rating.types";
```

Backend tsconfig.json includes path mapping: `"@shared/*": ["../shared/types/*"]`

### Database Schema (SQLite)

The application uses SQLite with better-sqlite3 for local database storage. The database file (`date-nite.db`) is created automatically at runtime in the project root directory and is gitignored.

**users table:**
```sql
id              TEXT PRIMARY KEY
email           TEXT UNIQUE NOT NULL
favorites       TEXT              -- JSON array of date ids
password_hash   TEXT NOT NULL     -- bcrypt hashed
```

**dates table:**
```sql
id                  TEXT PRIMARY KEY
type                TEXT              -- 'venue' or 'non-venue'
name                TEXT
location            TEXT
avg_cost            REAL
recommended_group   TEXT
avg_rating          REAL
group_size          TEXT
icon                TEXT              -- emoji or URL
description         TEXT
```

**ratings table:**
```sql
id              TEXT PRIMARY KEY
user_id         TEXT              -- References users(id)
date_id         TEXT              -- References dates(id)
romance_level   TEXT              -- 'casual' or 'romantic'
group_size      TEXT              -- 'single', 'double', or 'group'
cost            REAL
good_bad        TEXT              -- 'good' or 'bad'
first_date      INTEGER           -- 0 or 1 (boolean)
review          TEXT
```

**Database Notes:**
- Tables created automatically on startup
- Foreign key constraints not enforced by default in SQLite
- Database file location: `/date-nite.db` (relative to project root)

### Frontend Structure

The frontend uses React 19 with React Router DOM and JSX (not TypeScript yet).

**Pages:** Main discovery (Home), authentication (Login), dev tools (DevTools), placeholders (Favorites, Profile, DateInfo)

**Components:** Navbar (navigation/logout), DateCard (date display with StarRating), Sidebar (filters), SearchBar

**Services** (`frontend/src/services/`):
- `api.js` - API wrapper functions:
  - `checkHealth()` - Health check endpoint
  - `loginUser(email, password)` - User login
  - `registerUser(email, password)` - User registration
  - `logoutUser()` - User logout
  - `getDates()` - Fetch all date ideas

**Styles:** 9 CSS files covering globals, pages (home, login), components (navbar, sidebar, dateCard, modal), and utilities (layout, import)

**Routing:** App.jsx defines routes (/, /home, /profile, /favorites, /dev) with PrivateRoute wrapper for protected pages

## Environment Variables

Backend requires `JWT_SECRET` and `JWT_EXPIRES_IN` (default: "7d") in `backend/.env`.

**Note:** Uses local SQLite database (`date-nite.db`), no external credentials needed.

## Key Dependencies

**Backend:** better-sqlite3 (SQLite), bcryptjs (password hashing), jsonwebtoken (JWT), cookie-parser (cookies), express, cors, dotenv, ts-node-dev

**Frontend:** React 19, react-router-dom, bootstrap, vite

**Testing:** jest, ts-jest, supertest

## Important Notes

### TypeScript Configuration
- Backend uses `"module": "nodenext"` with CommonJS (`"type": "commonjs"` in package.json)
- Strict mode enabled with additional type safety options
- Uses `ts-node-dev` for development with transpile-only mode

### Current Limitations
- `/dates` router exists but is not mounted in `index.ts` (endpoint not accessible)
- Favorites page frontend is a placeholder (not implemented)
- Profile page frontend is a placeholder (not implemented)
- Set/remove favorite service functions are incomplete or don't persist to database
- No date submission functionality yet
- No rating submission functionality yet
- Global error handling middleware exists (`errorHandler.ts`) but is not mounted
- No advanced request validation middleware (only basic email/password checks)
- No username support yet (planned for future iteration)
- No refresh token mechanism (JWT tokens expire after 7 days)
- No token blacklisting for logout (cookie is cleared client-side only)

### Development Patterns

**When adding new endpoints:**
1. Define DTOs in `/shared/types/` for request/response types
2. Define database functions in `database.ts` if needed (SQLite operations with better-sqlite3)
3. Create business logic in appropriate service file (use DTOs for parameters and return types)
4. Create route handler that:
   - Validates input using DTO types
   - Returns standardized error codes
   - Calls service functions
   - Handles errors appropriately
5. Mount router in `index.ts` if new router
6. Add tests following Jest/Supertest pattern (see `users.test.ts` and `auth.test.ts`)

**Authentication patterns:**
- Use bcrypt for password hashing (10 rounds) during registration
- Use bcrypt comparison for password verification during login
- Set httpOnly cookies with JWT tokens after successful authentication
- Use `authenticateToken` middleware for protected routes
- Access authenticated user via `req.user` (populated from cookie by middleware)
- Return standardized error codes for auth failures

**Google Places integration patterns:**
- For venue dates, require `google_place_id` in CreateDateDTO
- Use `searchGooglePlaces()` to find places before date creation
- `fetchGooglePlace()` retrieves details for a specific place_id
- Handle `PLACES_API_ERROR` (503) when Google API is unavailable
- Store `google_place_id` in dates table for future reference
- Icon generation happens automatically via `iconGenerator` utility

**Rating patterns:**
- Ratings require authentication (use `authenticateToken` middleware)
- 24-hour cooldown enforced: users can only rate each date once per 24 hours
- `first_date` field is boolean in API/DTOs but stored as INTEGER (0/1) in SQLite
- Service layer automatically converts boolean to 0/1 when creating, and back to boolean in response
- Creating a rating automatically recalculates and updates `avg_cost` and `avg_rating` on the dates table
- `avg_rating` is percentage: (count of good ratings / total ratings) * 100
- Use `getAveragesForDate()` with optional filters (romance_level, group_size, first_date) for aggregate statistics
- Return 429 status code for `DUPLICATE_RATING_COOLDOWN` errors
- `created_at` stored as ISO 8601 string (use `new Date().toISOString()`)
- Database helper `getRecentRatingByUser()` checks for ratings within specified hours using SQLite datetime functions

**Testing patterns:**
- Use unique emails with timestamps to avoid conflicts: `` `test_${Date.now()}@example.com` ``
- For rating tests, create unique dates for each test to avoid 24-hour cooldown conflicts
- Test both success and error cases
- Test validation errors (400 responses)
- Test authentication errors (401/403 responses)
- For protected routes, test both with and without valid tokens
- Test rate limiting (429 responses for ratings within 24-hour window)
