"use client";

import Link from "next/link";
import React from "react";
import { X } from "lucide-react";
import Image from "next/image";

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
  const handleBack = () => {
    setChatUser(null);
    setShowChatUsersMobile(true);
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-background border-b shadow-sm rounded-t-xl">
      <Link
        href={`/profile/${receiver.username}`}
        className="flex items-center gap-4 hover:opacity-90 transition flex-grow"
        aria-label={`View profile of ${receiver.name}`}
      >
        <div className="relative w-12 h-12">
          <Image
            src={receiver.image || "/avatar.png"}
            alt={receiver.name}
            fill
            className="rounded-full object-cover border"
          />
        </div>
        <div>
          <h2 className="text-base md:text-lg font-semibold text-foreground">
            {receiver.name}
          </h2>
          <p className="text-sm text-muted-foreground">@{receiver.username}</p>
        </div>
      </Link>

      <button
        onClick={handleBack}
        className="lg:hidden flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition"
        aria-label="Back to user list"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatHeader;
