"use client";

import React, { useEffect, useState } from "react";
import { getChatUsers } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton"; // Assuming you have a Skeleton component

type User = {
  id: string;
  name: string;
  username: string;
  image?: string | null;
};

interface ChatUsersProps {
  setChatUser: (username: string) => void;
}

const ChatUsers: React.FC<ChatUsersProps> = ({ setChatUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getChatUsers();
        console.log("Fetched users:", result);
        setUsers(result);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
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
                className="flex gap-2 items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar>
                      <AvatarImage src={user.image ?? "/avatar.png"} />
                    </Avatar>
                  </Link>
                  <div
                    className="text-xs cursor-pointer"
                    onClick={() => {
                      setChatUser(user.id);
                    }}
                  >
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatUsers;
