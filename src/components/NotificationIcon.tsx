"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "lucide-react";
import { getUnreadNotificationCount } from "@/actions/notification.action";
import { pusherClient } from "@/lib/pusher";
import { usePathname } from "next/navigation";

interface NotificationIconProps {
  dbUserId: string | null;
}

const NotificationIcon = ({ dbUserId }: NotificationIconProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!dbUserId) return;

    const fetchCount = async () => {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    };

    fetchCount();

    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`user-${dbUserId}`);

    channel.bind("new-notification", () => {
      // If we are already on the notifications page, we don't need to increment the badge
      // as the page itself handles marking as read.
      if (pathname !== "/notifications") {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      pusherClient.unsubscribe(`user-${dbUserId}`);
    };
  }, [dbUserId, pathname]);

  return (
    <div className="relative">
      <BellIcon className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-background">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;
