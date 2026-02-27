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
- Root `vite.config.js` points to `/frontend` as root directory

### Backend Architecture (Service-Route Pattern)

The backend follows a layered architecture separating concerns:

1. **database.ts** - Direct Supabase client operations
   - Exports configured `supabase` client instance
   - Contains low-level CRUD functions for users, dates, and ratings tables
   - Functions throw errors on failure (no error wrapping here)

2. **services/** - Business logic layer
   - `userService.ts`: Handles user registration with Supabase Auth + profile creation
   - `dateService.ts`: Date idea business logic (placeholder)
   - Services orchestrate multiple database calls and apply business rules
   - Services handle Supabase Auth integration (e.g., `supabase.auth.signUp()`)

3. **routes/** - HTTP request handling
   - `users.ts`: User registration endpoint (`POST /users`)
   - `dates.ts`: Date endpoints (placeholder)
   - Routes validate request bodies and call service functions
   - Returns appropriate HTTP status codes (201 for creation, 400 for validation errors, 500 for server errors)

4. **index.ts** - Express app setup
   - Mounts routers (currently only `/users` is mounted)
   - JSON body parsing middleware
   - Server listening on port 3000

### Database Schema (Supabase)

See `backend/supabase_schema.md` and `backend/supabase_schema.sql` for full schema details.

**Key tables:**
- `users`: id (uuid), email (text), favorites (uuid[])
  - id references `auth.users(id)` in Supabase Auth
- `dates`: id, type ('venue'/'non-venue'), name, location, avg_cost, recommended_group, avg_rating, group_size, icon, description
- `ratings`: id, user_id, date_id, romance_level ('casual'/'romantic'), group_size ('single'/'double'/'group'), cost, good_bad ('good'/'bad'), first_date (boolean), review

**Authentication pattern:**
- User registration creates both Supabase Auth user AND profile row in `users` table
- User id in `users` table references Supabase Auth `auth.users(id)`

### Frontend Structure
- React 19 with React Router DOM
- Pages in `frontend/src/pages/`: Home, Login, Favorites, Profile
- Components in `frontend/src/pages/components/`: Navbar
- Global styles in `frontend/src/styles/`
- Currently uses JSX (not TypeScript)

## Environment Variables

Backend requires Supabase configuration (currently no .env.example):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous/public key

## Important Notes

### TypeScript Configuration
- Backend uses `"module": "nodenext"` with CommonJS (`"type": "commonjs"` in package.json)
- Strict mode enabled with additional type safety options
- Uses `ts-node-dev` for development with transpile-only mode

### Current Limitations
- Date routes exist but are mostly empty (only placeholder comment)
- Login and logout endpoints are TODO in users routes
- No error handling middleware yet
- No request validation middleware yet
- Frontend-backend integration not yet implemented

### Development Patterns
When adding new endpoints:
1. Define database functions in `database.ts` if needed
2. Create business logic in appropriate service file
3. Create route handler that validates input and calls service
4. Mount router in `index.ts` if new router
5. Add tests following Jest/Supertest pattern (see `users.test.ts`)
