"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";

interface NotificationListenerProps {
  userId: string | null;
}

const NotificationListener = ({ userId }: NotificationListenerProps) => {
  useEffect(() => {
    if (!userId || !pusherClient) return;

    const channel = pusherClient.subscribe(`user-${userId}`);

    channel.bind("new-notification", (data: any) => {
      let message = "";
      switch (data.type) {
        case "LIKE":
          message = "Someone liked your post!";
          break;
        case "COMMENT":
          message = "Someone commented on your post!";
          break;
        case "FOLLOW":
          message = "Someone started following you!";
          break;
        default:
          message = "You have a new notification!";
      }

      toast.success(message, {
        duration: 4000,
        position: "bottom-right",
      });
    });

    return () => {
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  return null;
};

export default NotificationListener;
