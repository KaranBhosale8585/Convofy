# Project: Convofy

## Progress Tracker

### 2026-06-05
- **Project State:** Fixed chat layout and implemented unread message indicators.
- **Changes:**
    - **Fixed Chat Layout:**
        - Added `overflow-hidden` to the main grid in `src/app/messages/page.tsx` to prevent the entire page from scrolling.
        - Updated `MsgBox` in `src/components/ChatBox.tsx` to ensure the message area is scrollable while header and input remain fixed.
        - Improved auto-scroll logic in `MsgBox`.
    - **Implemented Unread Message Indicators:**
        - Added `isRead` field to the `Message` model in `prisma/schema.prisma`.
        - Created `markMessagesAsRead` and `getUnreadCounts` server actions in `src/actions/message.action.ts`.
        - Refactored `ChatUsers.tsx` to fetch initial unread counts and update them in real-time via Pusher.
        - Added visual unread badges/dots to users in the friends list.
        - Integrated "mark as read" logic when opening a conversation or receiving messages in an active chat.
- **Bugs Fixed:**
    - Fixed entire page scrolling when many messages are present.
    - Fixed linting errors (unescaped entities and `set-state-in-effect`).
    - Resolved Prisma Client file lock by terminating the dev server process.
- **Verification:**
    - `pnpm lint` passed.
    - `npx prisma generate` and `npx prisma db push` succeeded.
    - Note: `pnpm build` fails due to a system-level `EPERM` error on `C:\Users\kb466\Application Data`, which is outside project scope.

- **Next Steps:**
    - Investigate the system-level `build` EPERM issue.
    - Implement image compression before upload.
    - Add real-time "typing" indicators for chat.
    - Add "read receipts" for messages.


## TODO
- [ ] Investigate and resolve `pnpm build` EPERM issue if it persists in other environments.
- [ ] Implement image compression before upload for better performance.
- [ ] Add real-time "typing" indicators for chat.
- [ ] Add "read receipts" for messages.

