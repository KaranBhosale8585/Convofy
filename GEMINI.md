# Project: Convofy

## Progress Tracker

### 2026-06-04
- **Project State:** Improving real-time features and notification system.
- **Changes:**
    - Enhanced real-time notifications to send full objects (including creator and post details) for `LIKE`, `COMMENT`, and `FOLLOW` events.
    - Updated `NotificationsPage` to dynamically update the list in real-time using Pusher.
    - Implemented `getUnreadNotificationCount` server action.
    - Created `NotificationIcon.tsx` component to display real-time unread notification badges in the Navbar.
    - Integrated `NotificationIcon` into both `DesktopNavbar` and `MobileNavbar`.
    - Refactored `sendMessage` and notification triggers to ensure consistent object structures.
- **Bugs Fixed:**
    - Fixed messaging object inconsistency.
    - Fixed insecure global notification broadcasting.
    - Fixed follow button feedback logic.
    - Fixed Prisma Client file lock issue and regenerated client.
    - Fixed stale `.next` cache causing ENOENT errors via clean restart.
- **Runtime Verification:**
    - Confirmed core routes (`/`, `/notifications`, `/messages`, `/profile/[username]`) return 200 OK.

- **Next Steps:**
    - Investigate and resolve `pnpm build` EPERM issue.
    - Implement image compression before upload.
    - Add real-time "typing" indicators for chat.
    - Add "read receipts" for messages.


## TODO
- [ ] Investigate and resolve `pnpm build` EPERM issue if it persists in other environments.
- [ ] Implement image compression before upload for better performance.
- [ ] Add real-time "typing" indicators for chat.
- [ ] Add "read receipts" for messages.

