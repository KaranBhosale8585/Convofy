# Project: Convofy

## Progress Tracker

### 2026-06-05
- **Project State:** Successfully rebuilt chat layout architecture and restored scrolling/input visibility.
- **Changes:**
    - **Rebuilt Chat Layout Architecture:**
        - **Root Cause Identified:** The previous layout used `flex-1` on the message container without `min-h-0`. In flexbox, this causes the child to expand to fit its content rather than scrolling, pushing siblings (like the input box) out of the visible area.
        - **Refactored `src/app/messages/page.tsx`:** Changed the main layout from `grid` to `flex` for better height control. Added `min-h-0` to children to ensure they respect the viewport constraints.
        - **Updated `src/components/ChatBox.tsx`:** Added `min-h-0` to `CardContent` to trigger proper `overflow-y-auto` behavior. Ensured the `Card` has `h-full` and `overflow-hidden` to contain the chat UI.
        - **Updated `src/components/ChatUsers.tsx`:** Added `min-h-0` to `CardContent` to ensure the friends list scrolls independently.
        - **Mobile Improvements:** Ensured only one column (Users or Chat) is visible at a time on mobile, filling the available viewport height.
    - **Implemented Unread Message Indicators:** (Carried over and verified)
        - Added `isRead` field to the `Message` model.
        - Created `markMessagesAsRead` and `getUnreadCounts` server actions.
        - Refactored `ChatUsers.tsx` to handle real-time unread counts via Pusher.
- **Bugs Fixed:**
    - Fixed broken message scrolling.
    - Fixed missing/hidden chat input box.
    - Fixed entire page scrolling when many messages are present.
    - Resolved layout breakage on different screen sizes.
- **Verification:**
    - `pnpm lint` passed.
    - `pnpm dev` runs without errors.
    - `pnpm build` fails due to external system-level `EPERM` error (not related to project code).
- **Manual Testing Results:**
    - Chat opens correctly on desktop and mobile.
    - Header and Input remain fixed at top and bottom.
    - Messages area scrolls correctly and auto-scrolls to bottom on new messages.
    - Unread badges work as expected.

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

