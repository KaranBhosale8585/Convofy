"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { ArrowLeft, X } from "lucide-react"; // ✅ Lucide icon import

interface ChatUsersProps {
  receiverId: string | null;
  setChatUser: (userId: string | null) => void;
  setShowChatUsersMobile: (show: boolean) => void;
}

const ChatHeader: React.FC<ChatUsersProps> = ({
  receiverId,
  setChatUser,
  setShowChatUsersMobile,
}) => {
  const [user, setUser] = useState<{
    name: string;
    username: string;
    image: string;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!receiverId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/user/${receiverId}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [receiverId]);

  const handleBack = () => {
    setChatUser(null);
    setShowChatUsersMobile(true);
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-background border-b shadow-sm rounded-t-xl">
      {loading ? (
        <div className="flex items-center gap-4 animate-pulse">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ) : user ? (
        <>
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-4 hover:opacity-90 transition flex-grow"
            aria-label={`View profile of ${user.name}`}
          >
            <img
              src={user.image || "/avatar.png"}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </Link>

          <button
            onClick={handleBack}
            className="lg:hidden flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition"
            aria-label="Back to user list"
          >
            <X className="w-6 h-6" />
          </button>
        </>
      ) : (
        <p className="text-sm text-red-500">⚠️ User not found</p>
      )}
    </div>
  );
};

export default ChatHeader;
