"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { getChatUsers, getDbUserId } from "@/actions/user.action";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { getUnreadCounts } from "@/actions/message.action";
import { pusherClient } from "@/lib/pusher";
import { SearchIcon, UserPlusIcon } from "lucide-react";
import { Input } from "./ui/input";
import { formatDistanceToNow } from "date-fns";

type User = {
  id: string;
  name: string;
  username: string;
  image?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
};

interface ChatUsersProps {
  setChatUser: (user: User | null) => void;
  activeUserId?: string;
}

const ChatUsers: React.FC<ChatUsersProps> = ({ setChatUser, activeUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Use refs to avoid stale closures in Pusher callbacks
  const activeUserIdRef = useRef(activeUserId);
  useEffect(() => {
    activeUserIdRef.current = activeUserId;
  }, [activeUserId]);

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
        if (countsRes.success && countsRes.data) {
          const filteredCounts = { ...countsRes.data };
          if (activeUserIdRef.current) delete filteredCounts[activeUserIdRef.current];
          setUnreadCounts(filteredCounts);
        }
      } catch (error) {
        console.error("Error initializing ChatUsers:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!currentUserId || !pusherClient) return;

    // Presence Channel for online status
    const presenceChannel = pusherClient.subscribe("presence-online");

    presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
        const online = new Set<string>();
        members.each((member: any) => online.add(member.id));
        setOnlineUsers(online);
    });

    // If already subscribed (shared channel), initialize immediately
    if ((presenceChannel as any).subscribed) {
        const online = new Set<string>();
        (presenceChannel as any).members.each((member: any) => online.add(member.id));
        Promise.resolve().then(() => setOnlineUsers(online));
    }

    presenceChannel.bind("pusher:member_added", (member: any) => {
        setOnlineUsers((prev) => new Set(prev).add(member.id));
    });

    presenceChannel.bind("pusher:member_removed", (member: any) => {
        setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(member.id);
            return next;
        });
    });

    // Private channel for messages and updates
    const userChannel = pusherClient.subscribe(`private-user-${currentUserId}`);

    userChannel.bind("chat-update", (data: any) => {
        const { senderId, receiverId, lastMessage, timestamp, userData } = data;
        const otherId = senderId === currentUserId ? receiverId : senderId;

        setUsers((prev) => {
            const next = [...prev];
            const index = next.findIndex(u => u.id === otherId);
            
            if (index !== -1) {
                // Update existing user
                const user = { ...next[index], lastMessage, lastMessageAt: timestamp };
                next.splice(index, 1);
                next.unshift(user);
            } else if (userData) {
                // Add new user if they sent us a message (userData is provided)
                // OR if we sent them a message and we need their basic info
                // Note: userData is usually only for the recipient to see the sender
                // If current user is sender, we should ideally already have receiver info from the UI interaction
                if (senderId !== currentUserId) {
                    const newUser = {
                        ...userData,
                        lastMessage,
                        lastMessageAt: timestamp
                    };
                    next.unshift(newUser);
                }
            }
            return next;
        });

        // Update unread count if chat is not active
        if (senderId !== currentUserId && senderId !== activeUserIdRef.current) {
            setUnreadCounts((prev) => ({
                ...prev,
                [senderId]: (prev[senderId] || 0) + 1,
            }));
        }
    });

    userChannel.bind("unread-update", (data: { senderId: string }) => {
        setUnreadCounts((prev) => {
            const next = { ...prev };
            delete next[data.senderId];
            return next;
        });
    });

    userChannel.bind("messages-read", (data: { receiverId: string }) => {
        // If the other person read our messages, we don't need to do anything in sidebar
        // But if WE are the ones who read messages (triggered from another tab)
        // the unread-update event already handles it.
    });

    return () => {
      if (pusherClient) {
        presenceChannel.unbind("pusher:subscription_succeeded");
        presenceChannel.unbind("pusher:member_added");
        presenceChannel.unbind("pusher:member_removed");
        userChannel.unbind("chat-update");
        userChannel.unbind("unread-update");
        // We do NOT unsubscribe from shared channels here, as other components 
        // (ChatBox, Notifications) are sharing this subscription.
      }
    };
  }, [currentUserId]); // Only resubscribe if currentUserId changes

  const handleSelectUser = (user: User) => {
    setChatUser(user);
    setUnreadCounts((prev) => {
      if (!prev[user.id]) return prev;
      const newCounts = { ...prev };
      delete newCounts[user.id];
      return newCounts;
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [users, searchQuery]);

  return (
    <Card className="h-full flex flex-col min-h-0 shadow-xl border rounded-3xl bg-background/60 backdrop-blur-md overflow-hidden">
      {/* Header with Search */}
      <div className="p-6 pb-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Chats</h2>
          <button className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <UserPlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="relative group">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-9 bg-muted/40 border-none rounded-2xl h-10 text-sm focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <CardContent className="flex-1 overflow-y-auto px-3 py-4 min-h-0 custom-scrollbar text-foreground">
        <div className="space-y-1">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3 items-center p-3">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-lg" />
                </div>
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 opacity-50">
              <SearchIcon className="w-8 h-8" />
              <p className="text-sm font-medium">No conversations found</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isActive = activeUserId === user.id;
              const unreadCount = unreadCounts[user.id] || 0;
              const isOnline = onlineUsers.has(user.id);

              return (
                <div
                  key={user.id}
                  className={`
                    group flex gap-3 items-center p-3 rounded-2xl transition-all duration-200 cursor-pointer relative
                    ${isActive ? "bg-blue-600/10 dark:bg-blue-500/10" : "hover:bg-muted/60"}
                  `}
                  onClick={() => handleSelectUser(user)}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                  )}

                  <div className="relative shrink-0">
                    <Link href={`/profile/${user.username}`} onClick={(e) => e.stopPropagation()}>
                      <Avatar className={`w-12 h-12 border-2 transition-transform group-hover:scale-105 ${isActive ? "border-blue-500 shadow-sm" : "border-transparent"}`}>
                        <AvatarImage src={user.image ?? "/avatar.png"} className="object-cover" />
                      </Avatar>
                    </Link>
                    {/* Real Online Status Indicator */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm transition-colors duration-500 ${isOnline ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 text-foreground">
                      <p className={`font-semibold truncate text-sm ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}>
                        {user.name}
                      </p>
                      {user.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(user.lastMessageAt), { addSuffix: false }).replace('about ', '').replace('less than a minute', 'now')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate font-medium ${unreadCount > 0 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                            {user.lastMessage || `@${user.username}`}
                        </p>
                        {unreadCount > 0 && (
                            <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-lg shadow-blue-600/20 animate-in zoom-in shrink-0">
                            {unreadCount > 9 ? "9+" : unreadCount}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatUsers;
