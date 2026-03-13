# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Date Nite is a community-driven date idea rating application for university students (starting with BYU). Users can submit, rate, and discover date ideas based on community feedback. The application uses a REST API architecture with React frontend and Node.js/Express backend backed by SQLite.

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

### Backend Architecture (Service-Route Pattern)

The backend follows a layered architecture separating concerns:

1. **database.ts** - SQLite database operations using better-sqlite3
   - Database file location: `date-nite.db` in project root
   - Initializes schema on startup (creates tables if not exist)
   - Contains low-level CRUD functions for users, dates, and ratings tables
   - Functions throw errors on failure (no error wrapping here)
   - Important: `createUser()` expects pre-hashed passwords
   - Rating helper functions: `getRatingsByDateId()` for aggregate calculations, `getRecentRatingByUser()` for cooldown checks

2. **services/** - Business logic layer
   - `userService.ts`: Handles user registration with bcrypt password hashing (10 rounds), generates UUIDs with crypto.randomUUID(), returns JWT token
   - `authService.ts`: Handles login/logout operations, verifies passwords with bcrypt.compare(), generates JWT tokens
   - `dateService.ts`: Date idea business logic including fetchDateById(), fetchAllDates(), createDateService() with Google Places integration for venue dates and automatic icon generation
   - `googlePlacesService.ts`: Google Places API integration with searchGooglePlaces() (Text Search API v1) and fetchGooglePlace() (Place Details), returns place data including name, address, types, editorial summary, rating, and price level
   - `ratingService.ts`: Rating business logic including createRatingService() with 24-hour cooldown enforcement and automatic date average updates, and getAveragesForDate() for filtered aggregate statistics
   - Services orchestrate multiple database calls and apply business rules
   - All service functions use DTOs from `/shared/types` for type safety

3. **routes/** - HTTP request handling
   - `users.ts`: User authentication endpoints:
     - `POST /users` - User registration (returns user + JWT)
     - `POST /users/login` - User login (returns user + JWT)
     - `POST /users/logout` - User logout (requires authentication)
     - `GET /users/me` - Get current authenticated user (protected route example)
   - `dates.ts`: Date endpoints:
     - `GET /dates` - Fetch all date ideas
     - `GET /dates/search-places?query=&location=` - Search Google Places (no auth required)
     - `POST /dates` - Create new date idea (requires authentication, integrates with Google Places for venue dates)
   - `ratings.ts`: Rating endpoints:
     - `POST /ratings` - Create new rating (requires authentication, enforces 24-hour cooldown, auto-updates date averages)
     - `GET /ratings/averages/:dateId` - Get filtered aggregate statistics (public, supports romance_level, group_size, first_date filters)
   - `health.ts`: Health check endpoint (`GET /health`)
   - Routes validate request bodies and call service functions
   - Returns standardized error codes (e.g., `VALIDATION_ERROR`, `INVALID_CREDENTIALS`)
   - Returns appropriate HTTP status codes (201 for creation, 400 for validation errors, 401 for auth errors, 429 for rate limiting, 500 for server errors)

4. **index.ts** - Express app setup
   - Mounts routers (`/users`, `/dates`, `/ratings`, `/health`)
   - CORS middleware configured for frontend origin
   - JSON body parsing middleware
   - Server listening on port 3000

5. **middleware/** - Request processing middleware
   - `auth.ts`: JWT token verification middleware
     - `authenticateToken()` - Validates JWT from `Authorization: Bearer <token>` header
     - Adds decoded user payload to `req.user` for use in route handlers
     - Returns 401 for missing/expired tokens, 403 for invalid tokens

6. **utils/** - Utility functions
   - `jwt.ts`: JWT token signing and verification
     - `signToken()` - Creates JWT with user ID and email
     - `verifyToken()` - Validates and decodes JWT tokens
   - `iconGenerator.ts`: Emoji icon generation for date ideas
     - Maps keywords (name and Google Place types) to appropriate emojis
     - Default emoji: ❤️

### Authentication & JWT

The application uses local JWT-based authentication with bcrypt password hashing:

**Token Flow:**
1. User registers with email/password
2. Backend hashes password with bcrypt (10 rounds)
3. Backend stores user with hashed password in SQLite
4. Backend generates custom JWT token (7-day expiration)
5. Frontend stores JWT in localStorage
6. Frontend includes JWT in `Authorization: Bearer <token>` header
7. Backend middleware validates JWT

**Password Security:**
- Registration: Passwords hashed with `bcrypt.hash(password, 10)` before storage
- Login: Passwords verified with `bcrypt.compare(password, stored_hash)`
- Passwords never stored in plaintext
- User IDs are UUIDs generated with `crypto.randomUUID()` (not from external auth service)

**Response Format:**
```typescript
{
  user: {
    id: string,
    email: string,
    favorites: string[]
  },
  accessToken: string  // JWT token
}
```

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

*Registration:*
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

*Login:*
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

*Protected Route (with token):*
```bash
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

*Logout:*
```bash
curl -X POST http://localhost:3000/users/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

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

**User Types** (`user.types.ts`):
- `User` - User entity with id, email, favorites
- `RegisterUserDTO` - Registration request (email, password)
- `RegisterResponseDTO` - Registration response (user, accessToken)

**Auth Types** (`auth.types.ts`):
- `LoginDTO` - Login request (email, password)
- `LoginResponseDTO` - Login response (user, accessToken)
- `LogoutResponseDTO` - Logout response
- `JWTPayload` - JWT token payload structure
- `AuthErrorCode` - Standard error code types

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

The application uses SQLite with better-sqlite3. Database file: `date-nite.db` in project root. Schema is initialized automatically on application startup (see `backend/src/database.ts`).

**Key tables:**
- `users`:
  - id (TEXT) - UUID generated with crypto.randomUUID()
  - email (TEXT UNIQUE NOT NULL)
  - favorites (TEXT NOT NULL) - JSON string array of date IDs
  - password_hash (TEXT NOT NULL) - bcrypt hash of user password
- `dates`:
  - id (TEXT PRIMARY KEY)
  - type (TEXT) - 'venue' or 'non-venue'
  - name (TEXT)
  - location (TEXT)
  - avg_cost (REAL)
  - recommended_group (TEXT)
  - avg_rating (REAL)
  - group_size (TEXT)
  - icon (TEXT) - emoji icon
  - description (TEXT)
  - google_place_id (TEXT) - Google Place ID for venue-type dates
- `ratings`:
  - id (TEXT PRIMARY KEY)
  - user_id (TEXT)
  - date_id (TEXT)
  - romance_level (TEXT) - 'casual' or 'romantic'
  - group_size (TEXT) - 'single', 'double', or 'group'
  - cost (REAL)
  - good_bad (TEXT) - 'good' or 'bad'
  - first_date (INTEGER) - 0 or 1 (boolean)
  - created_at (TEXT NOT NULL) - ISO 8601 date string for 24-hour cooldown enforcement

**Authentication pattern:**
- Local authentication only (no external auth service)
- Passwords hashed with bcrypt (10 rounds) and stored in users.password_hash
- User IDs are self-generated UUIDs (crypto.randomUUID())
- JWT tokens generated and verified by backend for session management

### Frontend Structure
- React 19 with React Router DOM
- Pages in `frontend/src/pages/`: Home, Login, Favorites, Profile
- Components in `frontend/src/pages/components/`: Navbar
- Global styles in `frontend/src/styles/`
- Currently uses JSX (not TypeScript)

## Environment Variables

Backend requires the following environment variables in `backend/.env`:

**JWT Configuration:**
- `JWT_SECRET` - Secret key for signing JWT tokens (use strong random string in production)
- `JWT_EXPIRES_IN` - JWT token expiration (default: "7d")

**Google Places API Configuration:**
- `GOOGLE_PLACES_API_KEY` - Google Places API key (required for venue date features and place search)

**Example `.env` file:**
```env
# JWT Configuration (REQUIRED)
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Google Places API (REQUIRED for venue date features)
GOOGLE_PLACES_API_KEY=your-google-api-key
```

**Note:** Jest automatically loads environment variables via `setupTests.ts` if it exists.

## Important Notes

### TypeScript Configuration
- Backend uses `"module": "nodenext"` with CommonJS (`"type": "commonjs"` in package.json)
- Strict mode enabled with additional type safety options
- Uses `ts-node-dev` for development with transpile-only mode

### Current Limitations
- No global error handling middleware yet
- No advanced request validation middleware (only basic email/password checks)
- Frontend-backend authentication integration not yet implemented
- No username support yet (planned for future iteration)
- No refresh token mechanism (JWT tokens expire after 7 days)
- No token blacklisting for logout (logout is client-side only)
- Google Places API has rate limits and costs per request
- Icon generation uses simple keyword matching (could be enhanced with ML/AI)
- Venue dates depend on Google Places API availability

### Development Patterns

**When adding new endpoints:**
1. Define DTOs in `/shared/types/` for request/response types
2. Define database functions in `database.ts` if needed
3. Create business logic in appropriate service file (use DTOs for parameters and return types)
4. Create route handler that:
   - Validates input using DTO types
   - Returns standardized error codes
   - Calls service functions
   - Handles errors appropriately
5. Mount router in `index.ts` if new router
6. Add tests following Jest/Supertest pattern (see `users.test.ts` and `auth.test.ts`)

**Authentication patterns:**
- Hash passwords with bcrypt before storing: `bcrypt.hash(password, 10)`
- Verify passwords during login: `bcrypt.compare(password, stored_hash)`
- Generate UUIDs for user IDs: `crypto.randomUUID()`
- Use `authenticateToken` middleware for protected routes
- Access authenticated user via `req.user` (populated by middleware)
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
