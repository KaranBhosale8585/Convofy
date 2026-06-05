"use client";

import React, { useEffect, useState } from "react";
import { getChatUsers, getDbUserId } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { getUnreadCounts } from "@/actions/message.action";
import { pusherClient } from "@/lib/pusher";

type User = {
  id: string;
  name: string;
  username: string;
  image?: string | null;
};

interface ChatUsersProps {
  setChatUser: (user: User | null) => void;
  activeUserId?: string;
}

const ChatUsers: React.FC<ChatUsersProps> = ({ setChatUser, activeUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [dbUserId, chatUsers, countsRes] = await Promise.all([
          getDbUserId(),
          getChatUsers(),
          getUnreadCounts(),
        ]);
        
        setCurrentUserId(dbUserId);
        setUsers(chatUsers);
        if (countsRes.success && countsRes.counts) {
          // Initial load: filter out active user's unread counts
          const filteredCounts = { ...countsRes.counts };
          if (activeUserId) delete filteredCounts[activeUserId];
          setUnreadCounts(filteredCounts);
        }
      } catch (error) {
        console.error("Error initializing ChatUsers:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [activeUserId]); // Include activeUserId to re-filter if it changes during load

  useEffect(() => {
    if (!currentUserId) return;

    const channel = pusherClient.subscribe(`user-${currentUserId}`);

    const handleNewMessage = (data: any) => {
      const { message } = data;
      // If message is NOT from the active user, increment unread count
      setUnreadCounts((prev) => {
        if (message.senderId === activeUserId) return prev;
        return {
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        };
      });
    };

    channel.bind("new-message", handleNewMessage);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusherClient.unsubscribe(`user-${currentUserId}`);
    };
  }, [currentUserId, activeUserId]);

  const handleSelectUser = (user: User) => {
    setChatUser(user);
    // Clear unread count immediately on selection
    setUnreadCounts((prev) => {
      if (!prev[user.id]) return prev;
      const newCounts = { ...prev };
      delete newCounts[user.id];
      return newCounts;
    });
  };

  return (
    <Card className="h-full flex flex-col min-h-0 shadow-lg">
      <CardHeader className="shrink-0 border-b bg-muted/20">
        <CardTitle className="text-lg font-semibold">Friends</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 min-h-0 custom-scrollbar">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
            ))
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`flex gap-2 items-center justify-between p-2 rounded-xl transition-colors cursor-pointer hover:bg-muted/50 ${
                  activeUserId === user.id ? "bg-muted" : ""
                }`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Link href={`/profile/${user.username}`} onClick={(e) => e.stopPropagation()}>
                    <Avatar className="w-10 h-10 border shadow-sm shrink-0">
                      <AvatarImage src={user.image ?? "/avatar.png"} />
                    </Avatar>
                  </Link>
                  <div className="text-xs overflow-hidden">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-muted-foreground truncate">@{user.username}</p>
                  </div>
                </div>
                
                {unreadCounts[user.id] > 0 && (
                  <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {unreadCounts[user.id] > 9 ? "9+" : unreadCounts[user.id]}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatUsers;
