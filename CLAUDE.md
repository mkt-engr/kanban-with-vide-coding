# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Kanban board application built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Prisma with PostgreSQL. The application uses the @dnd-kit/sortable library for drag-and-drop functionality and shadcn/ui components.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm start build

# Start production server
npm start

# Run linting
npm run lint
```

## Database Commands

The project uses Prisma with PostgreSQL. Docker Compose is configured for local development:

```bash
# Start PostgreSQL database
docker-compose up -d

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Architecture

### Database Schema
- **Board**: Kanban boards with title, description, and timestamps
- **Column**: Board columns with title, position, color, and board relationship
- **Task**: Individual tasks with title, description, position, priority (LOW/MEDIUM/HIGH/URGENT), due date, completion status, and column relationship

### Project Structure
- `app/`: Next.js App Router directory structure
  - `layout.tsx`: Root layout with Geist fonts
  - `page.tsx`: Main page (currently default Next.js template)
  - `globals.css`: Global Tailwind CSS styles
- `lib/utils.ts`: Utility functions including cn() for class merging
- `prisma/`: Database schema and migrations
- `public/`: Static assets

### Key Technologies
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React version
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Utility-first CSS framework
- **Prisma**: Database ORM
- **PostgreSQL**: Database
- **shadcn/ui**: UI component library (configured with new-york style)
- **@dnd-kit/sortable**: Drag and drop functionality
- **lucide-react**: Icon library

### Configuration
- shadcn/ui is configured with new-york style, CSS variables, and path aliases
- TypeScript path mapping: `@/*` maps to project root
- ESLint is configured with Next.js rules
- Tailwind CSS is configured for the project

## Database Connection

The application expects a `DATABASE_URL` environment variable for PostgreSQL connection. For local development, use the provided Docker Compose setup with these default credentials:
- Database: kanban-app
- User: user
- Password: password
- Port: 5432