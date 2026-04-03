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
│   │   ├── pages/ (Home, Login, CreateDate, DevTools, Favorites*, Profile*)
│   │   │   └── components/ (DateCard, Sidebar, SearchBar)
│   │   ├── services/ (api.js)
│   │   ├── styles/ (9 CSS files)
│   │   ├── main.jsx
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/ (users.ts, dates.ts, ratings.ts, health.ts)
│   │   ├── services/ (userService, authService, dateService, ratingService, googlePlacesService)
│   │   ├── middleware/ (auth, errorHandler)
│   │   ├── utils/ (jwt, errorLogging, iconGenerator)
│   │   ├── database.ts
│   │   └── index.ts
│   └── config files (package.json, tsconfig.json, jest.config.js)
├── shared/types/ (user.types, auth.types, date.types, rating.types, index)
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
   - `ratingService.ts`: Rating creation, aggregation, and 24-hour cooldown enforcement
   - `googlePlacesService.ts`: Google Places API integration (search and place details)
   - Services orchestrate multiple database calls and apply business rules
   - All service functions use DTOs from `/shared/types` for type safety

3. **routes/** - HTTP request handling
   - `users.ts`: User authentication (register, login, logout, /me) and favorites (get, remove)
   - `dates.ts`: Date ideas (get all, create, search places)
   - `ratings.ts`: Rating submission and aggregate statistics
   - `health.ts`: Health check
   - Routes validate requests, return standardized errors, appropriate HTTP status codes

4. **index.ts** - Express app setup
   - Mounts routers (`/users`, `/health`, `/dates`, `/ratings`)
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
   - `iconGenerator.ts`: Emoji icon generation
     - `generateIconFromName()` - Generates emoji based on keywords in date name
     - Keyword mapping for activities, food, entertainment

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

### Dates Endpoints

The application provides endpoints for date management and Google Places integration.

**GET /dates - Get all dates** (public)
- Returns array of all date ideas from database
- No authentication required
- Response includes full date objects with ratings and metadata

**POST /dates/create - Create new date** (protected)
- Requires authentication via `authenticateToken` middleware
- Request body: `CreateDateDTO` with type, name, optional google_place_id
- Supports two date types:
  - `venue`: Requires google_place_id, fetches Google Place details
  - `non-venue`: Manual entry (picnic, stargazing, etc.)
- Auto-generates emoji icon based on name keywords via `iconGenerator`
- For venue dates: Fetches place details (location, description) from Google Places API
- Returns `CreateDateResponseDTO` with created date object

**GET /dates/search-places - Search Google Places** (public)
- Query parameters: `query` (required), `location` (optional)
- Returns `PlacesSearchResponseDTO` with array of Google Place results
- Used to find place_id before creating venue dates
- Returns 503 if Google Places API unavailable

**Error Codes:**
- `VALIDATION_ERROR` (400) - Missing required fields or invalid type
- `PLACE_ID_REQUIRED` (400) - google_place_id missing for venue date
- `PLACE_NOT_FOUND` (404) - Google Place not found with provided ID
- `PLACES_API_ERROR` (503) - Google Places service unavailable
- `DATE_CREATION_FAILED` (500) - Server error during creation

### Ratings Endpoints

The application provides endpoints for rating submission and aggregate statistics.

**POST /ratings - Create rating** (protected)
- Requires authentication via `authenticateToken` middleware
- Request body: `CreateRatingDTO` with all fields required
- 24-hour cooldown enforced: users can rate each date only once per 24 hours
- Automatically updates date's avg_cost and avg_rating after successful creation
- `first_date` boolean converted to INTEGER (0/1) for SQLite storage
- Returns `CreateRatingResponseDTO` with created rating object

**GET /ratings/averages/:dateId - Get aggregate statistics** (public)
- Path parameter: `dateId` (required)
- Optional query filters: `romance_level`, `group_size`, `first_date`
- Returns `RatingAveragesDTO` with:
  - `avgCost`: Average cost across filtered ratings
  - `avgRating`: Percentage (good ratings / total ratings * 100)
  - `totalRatings`: Count of ratings matching filters
  - `goodCount`: Count of "good" ratings
  - `badCount`: Count of "bad" ratings
- No authentication required

**Error Codes:**
- `VALIDATION_ERROR` (400) - Missing required fields or invalid enum values
- `UNAUTHORIZED` (401) - Missing or expired token (POST only)
- `DATE_NOT_FOUND` (404) - Date doesn't exist
- `DUPLICATE_RATING_COOLDOWN` (429) - User already rated this date within 24 hours
- `INVALID_FILTERS` (400) - Invalid filter values in query string
- `RATING_CREATION_FAILED` (500) - Server error during creation

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
google_place_id     TEXT              -- Google Place ID for venue dates
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
created_at      TEXT NOT NULL     -- ISO 8601 timestamp
```

**Database Notes:**
- Tables created automatically on startup
- Foreign key constraints not enforced by default in SQLite
- Database file location: `/date-nite.db` (relative to project root)

### Frontend Structure

The frontend uses React 19 with React Router DOM and JSX (not TypeScript yet).

**Pages:**
- `Home` — date discovery with search, filters, sort, and inline "+ New Date" modal
- `CreateDate` — full-page create date form (also accessible via `/create-date`)
- `Login` — authentication (register/login)
- `DevTools` — dev utilities (dev mode only)
- `Favorites` — placeholder (no UI yet)
- `Profile` — placeholder (no UI yet)

**Create date form fields:** name, type (venue/non-venue), description, location (venue only), icon picker. `avg_cost` and `recommended_group` are intentionally excluded — they are calculated from user ratings.

**Components:** DateCard (date display with StarRating), Sidebar (nav, sort, filters), SearchBar

**Services** (`frontend/src/services/api.js`):
- `checkHealth()` - Health check
- `loginUser(email, password)` - User login
- `registerUser(email, password)` - User registration
- `logoutUser()` - User logout
- `getCurrentUser()` - Fetch authenticated user (`/users/me`)
- `getDates()` - Fetch all date ideas
- `createDate(dateData)` - Create a new date idea
- `getFavorites()` - Get saved dates for current user
- `addFavorite(dateId)` - Save a date to favorites
- `removeFavorite(dateId)` - Remove a date from favorites
- `searchPlaces(query, location)` - Search Google Places
- `createRating(ratingData)` - Submit a rating
- `getRatingAverages(dateId, filters)` - Get aggregate rating stats with optional filters

**Styles:** 9 CSS files — `globals.css`, `login.css`, `layout.css`, `sidebar.css`, `dateCard.css`, `modal.css`, `create-date.css`, `home.css`, `import.css` (all loaded globally via `import.css`)

**Routing:** App.jsx defines routes (/, /home, /profile, /favorites, /create-date, /dev) with PrivateRoute wrapper for protected pages

## Environment Variables

Backend requires the following environment variables in `backend/.env`:
- `JWT_SECRET` - Secret key for JWT token signing (required)
- `JWT_EXPIRES_IN` - Token expiration time (default: "7d")
- `GOOGLE_PLACES_API_KEY` - Google Places API key for venue search and details (required for venue dates)

**Note:** Uses local SQLite database (`date-nite.db`), no additional database credentials needed.

## Key Dependencies

**Backend:** better-sqlite3 (SQLite), bcryptjs (password hashing), jsonwebtoken (JWT), cookie-parser (cookies), express, cors, dotenv, ts-node-dev, node-fetch (for Google Places API)

**Frontend:** React 19, react-router-dom, bootstrap, vite (uses native fetch API)

**Testing:** jest, ts-jest, supertest, @types/jest, @types/supertest

## Important Notes

### TypeScript Configuration
- Backend uses `"module": "nodenext"` with CommonJS (`"type": "commonjs"` in package.json)
- Strict mode enabled with additional type safety options
- Uses `ts-node-dev` for development with transpile-only mode

### Current Limitations

**Backend:**
- Favorites persistence broken: `setFavoriteDate()` and `removeFavoriteDate()` in userService.ts modify in-memory user object but never call `updateUser()` to persist changes to database
- Global error handling middleware exists (`errorHandler.ts`) but is not mounted in index.ts
- No advanced request validation middleware (only basic field checks in routes)
- No username support yet (planned for future iteration)
- No refresh token mechanism (JWT tokens expire after 7 days, no renewal)
- No token blacklisting for logout (cookie cleared client-side only, token remains valid until expiration)

**Frontend:**
- Favorites page is placeholder (empty component, no UI implementation)
- Profile page is placeholder (empty component, no UI implementation)
- No rating submission UI: Backend supports ratings but no frontend form exists
- Home page date info modal shows "Full reviews & ratings coming soon" despite backend supporting rating aggregates

**Integration:**
- Google Places API requires valid API key in environment variables
- Rate limiting not implemented (no protection against API abuse)
- No caching layer for Google Places API calls (each search hits API directly)

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

**Icon generation patterns:**
- `generateIconFromName()` automatically assigns emoji icons based on date name keywords
- Keyword categories: food (pizza, coffee), activities (hiking, movie), entertainment (arcade, bowling)
- Falls back to generic date emoji (📅) if no keywords match
- Icons stored as emoji strings in dates table `icon` column
- Manual icon override supported by providing icon in CreateDateDTO

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
