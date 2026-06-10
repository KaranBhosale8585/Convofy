# Convofy Change History

-- Active: 1780519780915@@127.0.0.1@5432@Convofy
# Gemini CLI Session Data - Convofy Audit & Improvements

**Session Date:** Thursday, 4 June 2026
**Focus:** Codebase Audit, Stability, UI/UX, and Code Quality.

## 1. Phase 1: Stability & Foundation
- **Fixed Build Failure:** Resolved an `EPERM` error on Windows by redirecting the `USERPROFILE` during build/lint commands.
- **ESLint Migration:** Migrated from legacy `.eslintrc.json` to ESLint 9 Flat Config (`eslint.config.mjs`).
- **Layout Refactor:** Removed `h-screen overflow-hidden` from the root layout to allow natural scrolling on the Home feed and Profile pages.
- **Navigation Fix:** Updated `MobileNavbar` to use dynamic profile links (`/profile/[username]`) instead of a hardcoded `/profile` path.

## 2. Phase 2: UI/UX & Responsiveness
- **Image Optimization:** Replaced all `<img>` tags with Next.js `<Image />` components in `PostCard`, `Notifications`, `ChatHeader`, and `ImageUpload`.
- **Dynamic Heights:** Replaced hardcoded `vh` heights with `calc()` and flexbox to prevent UI cut-offs on different screen sizes.
- **Chat Optimization:** 
    - Passed full user objects between chat components to eliminate redundant client-side API fetches in `ChatHeader`.
    - Integrated `next-themes` with the Emoji Picker to ensure theme consistency.

## 3. Phase 3: Refinement & Code Quality
- **Dead Code Removal:** Deleted the unused `UnAuthenticatedSidebar.tsx`.
- **Console Log Cleanup:** Removed all `console.log` and debug statements from server actions and components.
- **Linting & Build:** Achieved a clean state with 0 errors and 0 warnings.

## 4. Technical Notes for Future Sessions
- **Development Command:** Always use `$env:USERPROFILE="D:\Deploy\convofy"; pnpm dev` on this environment to avoid permission errors.
- **Build Command:** Use `$env:USERPROFILE="D:\Deploy\convofy"; pnpm build`.
- **Lint Command:** Use `$env:USERPROFILE="D:\Deploy\convofy"; pnpm lint`.
- **Database:** Prisma client is generated into `src/generated/prisma`. If schema changes, run `npx prisma generate`.

---
*This file is ignored by git to keep session data private to this environment.*

## 5. Session Update: June 4, 2026
- Started the session.
- Launched the application in development mode using pnpm dev.
- Identified a 500 error on the home page related to getPosts.
- Suspected PrismaClientConstructorValidationError due to potential connection string or initialization issues.
- Updated DB_URL in .env to URL-encode the password.
- Attempting to verify database connectivity.

## Session Update: June 10, 2026
- Synchronized Neon production database schema with local schema.
- Added isRead column to Message table in production.
- Verified data integrity: 5 Users, 4 Posts, 54 Messages preserved.
- Confirmed production database is now compatible with the latest application features.

## Session Update: June 10, 2026 (Part 2)
- Improved environment variable validation logging in src/lib/env.ts to show detailed field errors.
- Verified that the application starts correctly without environment validation errors.
- Identified that UPLOADTHING_SECRET and UPLOADTHING_APP_ID are optional and currently missing from .env, but do not block the app.
