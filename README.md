# Bookaholic

Bookaholic is a full-stack social reading platform that combines book discovery, reading tracking, personalized shelves, anonymous discussions, and AI-based recommendations. The app is designed for readers who want to save books, monitor progress, engage with a book community, and discover what to read next.

## Overview

The project is split into two main parts:

- Frontend: a React + TypeScript single-page app with an Instagram-inspired reading feed and marketplace-like discovery experience.
- Backend: a Node.js + Express API with Prisma ORM, PostgreSQL, Redis, JWT auth, rate limiting, AI recommendations, and push-notification support.
- Infrastructure: PostgreSQL and Redis are provisioned with Docker Compose.

## Architecture

The application follows a layered architecture:

- Frontend client communicates with the backend API over REST endpoints.
- Backend validates requests, authenticates users, interacts with Prisma and Redis, and exposes API routes grouped by functionality.
- Prisma is used for database access and schema management.
- Redis supports caching, job queues, and future session / rate-limiting helpers.
- PostgreSQL stores persistent application data such as users, shelves, books, reviews, reading logs, forum threads, and goals.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Lucide React icons
- Canvas Confetti for celebratory interactions
- CSS-based UI styling with component-driven layout and modal flows

### Backend

- Node.js
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- Redis
- JWT-based authentication
- Helmet, CORS, cookie parsing, Morgan
- Express rate limiting
- OpenAI integration for AI recommendations
- Web Push for notification support
- Socket.IO support is included in dependencies for real-time or event-driven features
- Zod for validation

### Database

- PostgreSQL 16 via Docker
- Prisma schema with models for:
  - users
  - refresh tokens
  - push subscriptions
  - books
  - shelves
  - reviews
  - threads
  - posts
  - reading logs
  - goals

### DevOps / Infra

- Docker Compose
- PostgreSQL container on port 5432
- Redis container on port 6379
- Environment-based configuration for secrets and runtime settings

## Project Structure

```text
bookaholic/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── jobs/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── utils/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── seed.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Database Schema Summary

The database is managed through Prisma and designed for a reading-social platform.

### Core entities

- User
  - unique username-style identifier (`biDanh`)
  - password hash and recovery hash
  - streak tracking
  - avatar metadata and preferences
  - relations to shelves, reviews, reading logs, goals, and refresh tokens

- Book
  - cover, title, authors, description, categories, rating metadata
  - page count, published date
  - relation to shelves, reviews, threads, and reading logs

- Shelf
  - linked to user and book
  - supports types such as `WANT_TO_READ`, `CURRENTLY_READING`, `READ`, `DID_NOT_FINISH`, and `CUSTOM`
  - tracks progress and status timestamps

- Review
  - user book reviews with rating and content
  - spoiler flag and anonymous settings

- ReadingLog
  - tracks pages read, duration, start/end pages, notes, timestamps

- Goal
  - yearly reading goals with progress tracking and status

- Thread / Post
  - privacy-preserving discussion system with hashed author identities and display aliases
  - spoiler-aware content and thread metadata

### Privacy-oriented design

The forum and request handling intentionally minimize tracking by:

- anonymizing forum member identities using HMAC-derived aliases
- removing IP-related headers in the privacy shield middleware
- avoiding direct user identity linkage in public thread content

## Backend Functionality

The backend exposes modular API groups under `/api/v1`, including:

- Auth
- Books
- Shelves
- Forum
- AI
- Reading logs
- Analytics

This includes:

- user authentication and token management
- reading and book-related CRUD operations
- social/book community features
- anonymized discussion threads
- AI-driven recommendation endpoints
- push notifications and reminder infrastructure
- health checks and runtime bootstrap

## Frontend Features

The frontend is a social reading interface inspired by Instagram-style layouts.

Key UI areas include:

- Home feed
- Explore / discovery view
- Reading quote / reels-like view
- Shelves management
- Forum discussions
- Profile view
- Story viewer and post creation modals
- Auth modal and theme selection
- Reading log and progress tracking modals

## Setup and Running

### 1. Start infrastructure services

From the project root:

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 2. Configure backend environment

Copy the example environment file and update values:

```bash
cd backend
cp .env.example .env
```

Then fill in the necessary secrets, especially:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FORUM_ANONYMOUS_SECRET`
- `OPENAI_API_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Set up Prisma

```bash
cd backend
npx prisma generate
npx prisma db push
```

Optional migrations:

```bash
npm run db:migrate
```

### 5. Start backend

```bash
cd backend
npm run dev
```

The server starts on port `4000` by default.

### 6. Install frontend dependencies

```bash
cd frontend
npm install
```

### 7. Start frontend

```bash
cd frontend
npm run dev
```

The frontend runs via Vite, typically on `http://localhost:5173`.

## Useful Scripts

### Backend package scripts

- `npm run dev` → start the TypeScript dev server with hot reload
- `npm run build` → compile TypeScript
- `npm run start` → run the production build
- `npm run db:migrate` → Prisma migration workflow
- `npm run db:push` → push schema changes to PostgreSQL
- `npm run db:generate` → generate Prisma client
- `npm run db:seed` → seed the database
- `npm run db:studio` → open Prisma Studio

### Frontend package scripts

- `npm run dev` → start Vite dev server
- `npm run build` → build production bundle
- `npm run lint` → run Oxc/oxlint checks
- `npm run preview` → preview the production build locally

## Security and Privacy Notes

Bookaholic includes a privacy-focused middleware layer and forum anonymity controls:

- request IP headers are scrubbed
- public thread authors use one-way HMAC-derived aliases instead of real user identity
- secure headers are enabled with Helmet
- CORS is configured for trusted origins
- rate limiting is applied to sensitive routes

## Summary

Bookaholic is a full-stack reading application that brings together:

- reading-list management,
- social book discovery,
- anonymous discussion forums,
- AI recommendations,
- progress tracking,
- and privacy-conscious community features.

It combines a modern React frontend, a TypeScript Express backend, Prisma-managed PostgreSQL storage, and Redis-powered infrastructure in a single cohesive application.

## License

The project is currently configured with an ISC license in the backend package metadata, but the repository should be reviewed before commercial or public distribution beyond personal use.
