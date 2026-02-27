# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Date Nite is a community-driven date idea rating application for university students (starting with BYU). Users can submit, rate, and discover date ideas based on community feedback. The application uses a REST API architecture with React frontend and Node.js/Express backend backed by Supabase.

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

1. **database.ts** - Direct Supabase client operations
   - Exports configured `supabase` client instance
   - Contains low-level CRUD functions for users, dates, and ratings tables
   - Functions throw errors on failure (no error wrapping here)

2. **services/** - Business logic layer
   - `userService.ts`: Handles user registration with Supabase Auth + profile creation, returns JWT token
   - `authService.ts`: Handles login/logout operations, generates JWT tokens
   - `dateService.ts`: Date idea business logic (placeholder)
   - Services orchestrate multiple database calls and apply business rules
   - Services handle Supabase Auth integration but return implementation-agnostic JWT tokens
   - All service functions use DTOs from `/shared/types` for type safety

3. **routes/** - HTTP request handling
   - `users.ts`: User authentication endpoints:
     - `POST /users` - User registration (returns user + JWT)
     - `POST /users/login` - User login (returns user + JWT)
     - `POST /users/logout` - User logout (requires authentication)
     - `GET /users/me` - Get current authenticated user (protected route example)
   - `dates.ts`: Date endpoints (placeholder)
   - `health.ts`: Health check endpoint (`GET /health`)
   - Routes validate request bodies and call service functions
   - Returns standardized error codes (e.g., `VALIDATION_ERROR`, `INVALID_CREDENTIALS`)
   - Returns appropriate HTTP status codes (201 for creation, 400 for validation errors, 401 for auth errors, 500 for server errors)

4. **index.ts** - Express app setup
   - Mounts routers (`/users`, `/health`)
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

### Authentication & JWT

The application uses JWT-based authentication that's independent of Supabase sessions:

**Token Flow:**
1. User registers or logs in via Supabase Auth
2. Backend verifies credentials with Supabase
3. Backend generates custom JWT token (7-day expiration)
4. Frontend stores JWT in localStorage
5. Frontend includes JWT in `Authorization: Bearer <token>` header
6. Backend middleware validates JWT (not Supabase session)

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

**Backend Import:**
```typescript
import type { RegisterUserDTO } from "@shared/user.types";
import type { LoginDTO } from "@shared/auth.types";
```

Backend tsconfig.json includes path mapping: `"@shared/*": ["../shared/types/*"]`

### Database Schema (Supabase)

See `backend/supabase_schema.md` and `backend/supabase_schema.sql` for full schema details.

**Key tables:**
- `users`: id (uuid), email (text), favorites (uuid[])
  - id references `auth.users(id)` in Supabase Auth
- `dates`: id, type ('venue'/'non-venue'), name, location, avg_cost, recommended_group, avg_rating, group_size, icon, description
- `ratings`: id, user_id, date_id, romance_level ('casual'/'romantic'), group_size ('single'/'double'/'group'), cost, good_bad ('good'/'bad'), first_date (boolean), review

**Authentication pattern:**
- User registration/login authenticates via Supabase Auth
- Backend generates custom JWT tokens (independent of Supabase sessions)
- User registration creates both Supabase Auth user AND profile row in `users` table
- User id in `users` table references Supabase Auth `auth.users(id)`
- Passwords are hashed and managed by Supabase Auth (not stored in `users` table)

### Frontend Structure
- React 19 with React Router DOM
- Pages in `frontend/src/pages/`: Home, Login, Favorites, Profile
- Components in `frontend/src/pages/components/`: Navbar
- Global styles in `frontend/src/styles/`
- Currently uses JSX (not TypeScript)

## Environment Variables

Backend requires the following environment variables in `backend/.env`:

**Supabase Configuration:**
- `SUPABASE_URL` - Supabase project URL (get from Supabase project settings)
- `SUPABASE_ANON_KEY` - Supabase anonymous/public key (get from Supabase project settings)

**JWT Configuration:**
- `JWT_SECRET` - Secret key for signing JWT tokens (use strong random string in production)
- `JWT_EXPIRES_IN` - JWT token expiration (default: "7d")

**Example `.env` file:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

**Note:** Tests require valid Supabase credentials to run successfully. Jest automatically loads environment variables via `setupTests.ts`.

## Important Notes

### TypeScript Configuration
- Backend uses `"module": "nodenext"` with CommonJS (`"type": "commonjs"` in package.json)
- Strict mode enabled with additional type safety options
- Uses `ts-node-dev` for development with transpile-only mode

### Current Limitations
- Date routes exist but are mostly empty (only placeholder comment)
- No global error handling middleware yet
- No advanced request validation middleware (only basic email/password checks)
- Frontend-backend authentication integration not yet implemented
- No username support yet (planned for future iteration)
- No refresh token mechanism (JWT tokens expire after 7 days)
- No token blacklisting for logout (logout is client-side only)

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
- Service functions should interact with Supabase Auth but return JWT tokens
- Use `authenticateToken` middleware for protected routes
- Access authenticated user via `req.user` (populated by middleware)
- Return standardized error codes for auth failures

**Testing patterns:**
- Use unique emails with timestamps to avoid conflicts: `` `test_${Date.now()}@example.com` ``
- Test both success and error cases
- Test validation errors (400 responses)
- Test authentication errors (401/403 responses)
- For protected routes, test both with and without valid tokens
