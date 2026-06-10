"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ChevronLeftIcon, InfoIcon, MoreVerticalIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { pusherClient } from "@/lib/pusher";

interface ChatHeaderProps {
  receiver: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
  };
  setChatUser: (user: any | null) => void;
  setShowChatUsersMobile: (show: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  receiver,
  setChatUser,
  setShowChatUsersMobile,
}) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!pusherClient) return;

    const channel = pusherClient.subscribe("presence-online");

    const updateStatus = () => {
        const members = (channel as any).members;
        if (members && members.get(receiver.id)) {
            setIsOnline(true);
        } else {
            setIsOnline(false);
        }
    };

    channel.bind("pusher:subscription_succeeded", updateStatus);
    channel.bind("pusher:member_added", updateStatus);
    channel.bind("pusher:member_removed", updateStatus);

    return () => {
        pusherClient.unsubscribe("presence-online");
    };
  }, [receiver.id]);

  const handleBack = () => {
    setChatUser(null);
    setShowChatUsersMobile(true);
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-background/60 backdrop-blur-md border-b">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="lg:hidden shrink-0 -ml-2 hover:bg-muted/80 rounded-full"
          aria-label="Back to user list"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>

        <Link
          href={`/profile/${receiver.username}`}
          className="flex items-center gap-3 sm:gap-4 hover:opacity-90 transition group min-w-0"
          aria-label={`View profile of ${receiver.name}`}
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0">
            <Image
              src={receiver.image || "/avatar.png"}
              alt={receiver.name}
              fill
              className="rounded-2xl object-cover border-2 border-background shadow-sm transition-transform group-hover:scale-105"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background transition-colors duration-500 ${isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"}`} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-blue-500 transition-colors">
              {receiver.name}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600"}`} />
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" className="hover:text-blue-500 hover:bg-blue-50/10 rounded-full">
          <InfoIcon className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:text-blue-500 hover:bg-blue-50/10 rounded-full">
          <MoreVerticalIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
