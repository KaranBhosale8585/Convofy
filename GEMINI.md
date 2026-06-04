# Project: Convofy

## Progress Tracker

### 2026-06-04
- **Project State:** Initializing project tracking and fixing core issues.
- **Tech Stack:** Next.js 15, Prisma 6, Clerk, UploadThing, Pusher, Radix UI.
- **Data Model:** Users, Posts, Comments, Likes, Follows, Messages, Notifications.
- **Changes:**
    - Refactored `sendMessage` action to include the sender object in Pusher triggers and return values for consistency.
    - Updated `ChatBox.tsx` to use the returned message from `sendMessage` for optimistic updates.
    - Refactored real-time notification triggers (`toggleLike`, `createComment`, `toggleFollow`) to use user-specific Pusher channels (`user-{userId}`).
    - Implemented `NotificationListener.tsx` as a global component in `layout.tsx` to show real-time toasts for notifications.
    - Refined `toggleFollow` action to return the new follow status and updated `FollowButton.tsx` to show appropriate toast messages.
- **Bugs Fixed:**
    - Fixed message object inconsistency that caused the "isSender" flag to be incorrect for real-time messages.
    - Fixed global notification trigger that was insecurely broadcasting to all users.
    - Fixed incorrect toast message in `FollowButton` during unfollow actions.
- **Known Issues:**
    - `pnpm build` fails with an `EPERM` error on system directories (e.g., `C:\Users\kb466\Cookies`). This appears to be an environment-specific issue as `pnpm dev` and `pnpm tsc` work correctly.

## TODO
- [ ] Investigate and resolve `pnpm build` EPERM issue if it persists in other environments.
- [ ] Add real-time updates to the Notifications page list.
- [ ] Add notification badges to the Navbar.
- [ ] Implement image compression before upload for better performance.

