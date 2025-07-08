# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
BadAssPoet is a Next.js 15 application combining poetry, music, and file management with Supabase backend and Synology NAS integration.

## Commands
```bash
# Development
npm run dev              # Start development server (port 3000)
npm run dev:env          # Create .env.local and start dev server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run setup-db         # Create database tables
npm run create-env       # Generate .env.local file

# Code Quality
npm run lint             # Run ESLint
```

## Architecture

### Core Technologies
- **Frontend**: Next.js 15.3.2 (App Router), React 19.1.0, TypeScript, Tailwind CSS v4, Styled Components
- **Backend**: Supabase (PostgreSQL + Auth), Synology NAS API integration
- **State Management**: React Context for authentication

### Key Directories
- `/src/app/` - Next.js app router pages and API routes
- `/src/components/` - Reusable React components
- `/src/context/` - React Context providers (AuthContext)
- `/src/lib/` - Utility functions and Supabase client
- `/sql/` - Database migrations and functions

### Critical Files
- `src/lib/supabase.ts` - Supabase client configuration
- `src/context/AuthContext.tsx` - Authentication state management
- `src/app/api/synology/*` - File storage API endpoints
- `create-env.js` - Environment variable setup script

### Authentication System
- Username-based authentication (no email)
- Custom `usernames` table tracks availability
- Admin role management via `users` table
- RLS policies enforce access control

### Synology NAS Integration
API routes handle file operations:
- `/api/synology/list` - List files
- `/api/synology/download` - Download files
- `/api/synology/upload` - Upload files
- `/api/synology/delete` - Delete files

### Database Schema
Key tables:
- `users` - User profiles with admin status
- `usernames` - Username availability tracking
- `examples` - Content storage
- `user_roles` - Role-based access control

### Development Notes
- No testing framework currently configured
- Environment variables required (use `npm run create-env`)
- Static export generates `out/` directory
- Audio player uses tape-style controls for poetry readings
- Lyrics displayed as subtle background watermark