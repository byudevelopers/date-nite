# Date Nite 🗓️

Date Nite is a community-driven date idea rating application designed to help university students discover high-quality date ideas. The platform enables users to submit both at-home and local venue date ideas, rate their experiences, and browse community-recommended dates to keep their dating life fresh and exciting.

## Overview

Starting with the BYU community, Date Nite aims to solve the common challenge of falling into repetitive date patterns by providing a curated, user-rated collection of date ideas. Users can share their experiences, rate dates they've tried, and discover new ideas based on community feedback.

## Features

### Current Features (In Development)
- **Date Idea Submission**: Users can submit date ideas as either venue-based or at-home activities
- **Rating System**: Simple thumbs-up/thumbs-down rating with date context (casual/romantic, single/double/triple+)
- **Browse Date Ideas**: View community-submitted date ideas (available without login)
- **User Authentication**: Custom authentication system for submitting and rating dates
- **Favorites List**: Save favorite date ideas for future reference

### Planned Features (Post-MVP)
- **Random Date Generator**: Get spontaneous date suggestions
- **Advanced Filtering**: Filter by cost, location, date type, and rating
- **Sorting Options**: Sort by popularity, average rating, and balance score
- **Cost Calculation**: Dynamic cost estimates based on user ratings
- **First Date Flagging**: Identify which dates are suitable for first dates

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js with TypeScript
- **API**: REST API
- **Database**: SQL (under evaluation)
- **Server**: Express

## Project Structure

This is a monorepo containing both frontend and backend code in a single repository.

## Roadmap

### Milestone 1: March 5, 2026 (Halfway Point)
**Backend:**
- User endpoints (registration, login, authentication)
- Create date endpoint

**Frontend:**
- Complete UI frames with CSS
- Minimum functionality implementation

### Milestone 2: April 9, 2026 (MVP Demo)
**Backend:**
- All user endpoints operational
- Full CRUD operations for date ideas
- Rating submission endpoints
- Favorites functionality

**Frontend:**
- Login and home/discovery pages
- Date submission and rating interface
- Review page functionality
- Favorites page

## Getting Started

### Prerequisites
- Node.js (version TBD)
- npm or yarn
- SQL database setup

### Installation
```bash
# Clone the repository
git clone https://github.com/byudevelopers/date-nite.git

# Navigate to project directory
cd date-nite

# Install dependencies
npm install

# Set up environment variables
# (Create .env file with required configuration)

# Run development server
npm run dev
```

## Repository Layout

This is the industry standard for page file organization. We will need to make some file modifications to adhere to this idea.

```
date-nite/
│
├── client/                        # Frontend React application
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │       ├── images/
│   │       └── icons/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── common/           # Shared components (Button, Input, etc.)
│   │   │   ├── DateCard.tsx
│   │   │   ├── RatingButton.tsx
│   │   │   └── Header.tsx
│   │   ├── pages/                # Page-level components
│   │   │   ├── Login.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── DateSubmission.tsx
│   │   │   ├── ReviewPage.tsx
│   │   │   └── Favorites.tsx
│   │   ├── context/              # React context for state management
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useAuth.ts
│   │   ├── services/             # API integration layer
│   │   │   ├── api.ts            # Axios configuration
│   │   │   ├── authService.ts
│   │   │   └── dateService.ts
│   │   ├── styles/               # CSS/styling files
│   │   │   ├── globals.css
│   │   │   └── components/
│   │   ├── utils/                # Utility functions
│   │   │   └── helpers.ts
│   │   ├── types/                # Frontend-specific TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                       # Backend Express application
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── controllers/          # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── dateController.ts
│   │   │   └── ratingController.ts
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── models/               # Database models/schemas
│   │   │   ├── User.ts
│   │   │   ├── DateIdea.ts
│   │   │   └── Rating.ts
│   │   ├── routes/               # API route definitions
│   │   │   ├── index.ts          # Route aggregator
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── dateRoutes.ts
│   │   │   └── ratingRoutes.ts
│   │   ├── services/             # Business logic layer
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── dateService.ts
│   │   │   └── ratingService.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   ├── types/                # Backend-specific TypeScript types
│   │   │   └── index.ts
│   │   ├── app.ts                # Express app configuration
│   │   └── server.ts             # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── shared/                        # Shared code between frontend and backend
│   ├── src/
│   │   ├── types/                # Shared TypeScript interfaces
│   │   │   ├── User.ts
│   │   │   ├── DateIdea.ts
│   │   │   ├── Rating.ts
│   │   │   └── index.ts
│   │   ├── constants/            # Shared constants
│   │   │   └── index.ts
│   │   └── utils/                # Shared utility functions
│   │       └── validation.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
│   └── workflows/
│       └── ci.yml                # CI/CD pipeline
│
├── node_modules/
├── package.json                   # Root package.json with workspaces
├── tsconfig.json                  # Base TypeScript config
├── .eslintrc.json                 # Linting configuration
├── .prettierrc                    # Code formatting rules
├── .gitignore
└── README.md
```

## API Documentation 

API documentation will be added as endpoints are developed.

## Contributing

This project is currently being developed by the BYU Developers Club. For team members, join our [Slack workspace](https://join.slack.com/t/byudevelopers/shared_invite/zt-3o8345jzq-lRrFfRCoWSozHO_FhWeCrg) for collaboration and updates.

### Contributing Guidelines
- Follow TypeScript best practices
- Write clear, descriptive commit messages
- Test your code before submitting pull requests
- Keep components modular and reusable

## Future Plans

After the initial MVP launch targeting BYU students, Date Nite plans to expand to other university communities and eventually broader audiences.

***

**Questions or feedback?** Reach out through the BYU Developers Club Slack channel.

***
