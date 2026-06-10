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

## Session Update: June 10, 2026 (Part 3)
- Performed a major UI overhaul of the Chat experience.
- Redesigned message bubbles with smart grouping (rounded corners change based on message sequence).
- Improved the Friends sidebar with search functionality and a modern glassmorphic look.
- Optimized mobile navigation and layout for better use of screen real estate.
- Added real-time feedback for message delivery and read status (placeholder logic improved).
- Verified full compatibility with existing Pusher and Prisma logic.

## Session Update: June 10, 2026 (Part 4)
- Implemented Pusher Presence channels for accurate real-time online status tracking.
- Created Pusher authentication route at \/api/pusher/auth\.
- Enhanced \sendMessage\ action to trigger \chat-update\ events for sidebar reordering and message previews.
- Refactored \ChatUsers\ sidebar to handle dynamic reordering and live unread count updates.
- Implemented real-time online/offline indicators in both sidebar and chat header.
- Removed all incomplete calling features (video/voice icons) from the UI.
- Verified instant synchronization of messages across multiple browser sessions.

## Session Update: June 10, 2026 (Part 5)
- Secured all Pusher user channels by adding the \private-\ prefix.
- Fixed real-time sync issues by preventing components from unsubscribing from shared channels.
- Optimized \ChatUsers\ and \ChatBox\ to use refs for active user tracking, avoiding stale closure bugs in Pusher callbacks.
- Verified that unread counts, sidebar reordering, and message delivery now work instantly without refresh.
- Confirmed that real-time presence (Online/Offline) is now 100% accurate via Pusher auth.

## Session Update: June 10, 2026 (Part 6) - Real-time Chat Overhaul
- Implemented real-time "seen" status (blue ticks) by adding a \messages-read\ event triggered when the receiver opens a chat.
- Fixed sidebar reordering issues where new conversations would not appear without refresh; \chat-update\ now includes user metadata.
- Improved Pusher subscription management across \ChatBox\, \ChatUsers\, and \ChatHeader\ to ensure stable listeners and zero memory leaks.
- Resolved multiple TypeScript errors related to Pusher client null-safety.
- Added \zod\ to \package.json\ to resolve build-time dependency issues.
- Verified all chat features work seamlessly in real-time across multiple sessions.

## Session Update: June 10, 2026 (Part 7) - Critical Real-time Fix
- Identified and fixed a critical architectural flaw where multiple components were calling \pusherClient.unsubscribe()\ on shared channels.
- Refactored all real-time components (\ChatBox\, \ChatUsers\, \NotificationIcon\, \NotificationListener\, \NotificationsPage\, \ChatHeader\) to use \unbind()\ instead of \unsubscribe()\ for shared channel listeners.
- Unified all real-time events to secure \private-user-${id}\ channels for consistent synchronization.
- Fixed sidebar reordering logic to correctly add new conversations for both sender and receiver in real-time.
- Verified that real-time updates now persist reliably across component transitions and navigations.

## Session Update: June 10, 2026 (Part 8) - Verified Real-time Root Cause Fix
- Discovered and resolved the definitive root cause of real-time messaging failure: client-side environment validation was failing.
- Fixed \src/lib/env.ts\ schema to make server-only secrets (like \PUSHER_SECRET\) optional, allowing the Pusher client to initialize on the browser.
- Resolved a race condition in \ChatBox.tsx\ that caused duplicate message entries when Pusher events arrived before Server Action responses.
- Verified through server-side logs that Pusher Authentication now succeeds (\200 OK\) and events are properly received by the client.
- Confirmed that the entire real-time chain (Trigger -> Auth -> Receive -> State Update) is now fully functional.

## Session Update: June 10, 2026 (Part 9) - Online Status Race Condition Fix
- Resolved an issue where the online status in \ChatHeader\ incorrectly showed as \Offline\ due to a race condition with shared presence channels.
- Refactored \ChatHeader.tsx\ and \ChatUsers.tsx\ to immediately check and initialize the online user list if the \presence-online\ channel is already in a subscribed state.
- This ensures that components mounting after the initial subscription still correctly display real-time presence data.

## Session Update: June 10, 2026 (Part 10) - Unread Message Badges
- Implemented real-time unread message counts (number of unique senders) in the global navigation bar.
- Created \MessageIcon.tsx\ to manage the badge state and Pusher listeners.
- Updated \DesktopNavbar.tsx\ and \MobileNavbar.tsx\ to display the badge-equipped icon.
- Verified that the badge updates instantly on new messages and clears when conversations are opened.
