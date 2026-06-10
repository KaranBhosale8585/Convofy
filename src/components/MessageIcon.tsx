"use client";

import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { getUnreadCounts } from "@/actions/message.action";
import { pusherClient } from "@/lib/pusher";
import { usePathname } from "next/navigation";

interface MessageIconProps {
  dbUserId: string | null;
}

const MessageIcon = ({ dbUserId }: MessageIconProps) => {
  const [unreadUsersCount, setUnreadUsersCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!dbUserId) return;

    const fetchCounts = async () => {
      const res = await getUnreadCounts();
      if (res.success && res.data) {
        setUnreadUsersCount(Object.keys(res.data).length);
      }
    };

    fetchCounts();

    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`private-user-${dbUserId}`);

    const handleChatUpdate = (data: any) => {
        // Only increment if we are not on the messages page (where it would be marked read)
        // and if the message is coming TO us
        if (pathname !== "/messages" && data.receiverId === dbUserId) {
            // We fetch again to get accurate unique user count 
            // OR we could manage a local set of user IDs. 
            // Re-fetching is simpler and ensures consistency.
            fetchCounts();
        }
    };

    const handleUnreadUpdate = () => {
        fetchCounts();
    };

    channel.bind("chat-update", handleChatUpdate);
    channel.bind("unread-update", handleUnreadUpdate);

    return () => {
      if (pusherClient) {
        channel.unbind("chat-update", handleChatUpdate);
        channel.unbind("unread-update", handleUnreadUpdate);
      }
    };
  }, [dbUserId, pathname]);

  return (
    <div className="relative">
      <MessagesSquare className="w-4 h-4" />
      {unreadUsersCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white ring-2 ring-background">
          {unreadUsersCount > 9 ? "9+" : unreadUsersCount}
        </span>
      )}
    </div>
  );
};

export default MessageIcon;
