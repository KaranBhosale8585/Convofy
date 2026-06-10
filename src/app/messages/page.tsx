"use client";

import React, { useEffect, useState } from "react";
import ChatUsers from "@/components/ChatUsers";
import MsgBox from "@/components/ChatBox";
import { getDbUserId } from "@/actions/user.action";
import { MessageSquareIcon } from "lucide-react";

type ChatUser = {
  id: string;
  name: string;
  username: string;
  image?: string | null;
};

const HomePage: React.FC = () => {
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [showChatUsersMobile, setShowChatUsersMobile] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getDbUserId();
      setDbUserId(id);
    };
    fetchUserId();
  }, []);

  // Sync mobile view state when chat user changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowChatUsersMobile(!chatUser);
  }, [chatUser]);

  return (
    <div className="flex gap-0 lg:gap-6 h-[calc(100vh-80px)] lg:h-[calc(100vh-120px)] overflow-hidden transition-all duration-300">
      {/* Sidebar - Friends List */}
      <div
        className={`
          ${showChatUsersMobile ? "flex w-full" : "hidden"}
          lg:flex lg:w-[320px] xl:w-[380px] h-full flex-col min-h-0 shrink-0
          transition-all duration-300 ease-in-out
        `}
      >
        <ChatUsers setChatUser={setChatUser} activeUserId={chatUser?.id} />
      </div>

      {/* Main Chat Area */}
      <div
        className={`
          ${showChatUsersMobile ? "hidden" : "flex w-full"}
          lg:flex lg:flex-1 h-full flex-col min-h-0 overflow-hidden
          transition-all duration-300 ease-in-out
        `}
      >
        {chatUser && dbUserId ? (
          <MsgBox
            receiver={chatUser}
            setChatUser={setChatUser}
            setShowChatUsersMobile={setShowChatUsersMobile}
            currentUserId={dbUserId}
          />
        ) : (
          <div className="flex items-center justify-center h-full border-none lg:border rounded-3xl shadow-none lg:shadow-sm bg-muted/20 backdrop-blur-sm p-4">
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 max-w-sm">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-blue-500/10 border-4 border-blue-500/20 text-blue-500">
                <MessageSquareIcon className="w-10 h-10" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 border-4 border-background animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">Your Conversations</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {dbUserId ? (
                    "Select a friend from the list to start messaging. Your encrypted realm of connection is ready."
                  ) : (
                    "Initializing your secure messaging environment..."
                  )}
                </p>
              </div>
              {dbUserId && (
                <div className="pt-4 flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-muted text-[10px] uppercase font-bold tracking-wider text-muted-foreground">End-to-End</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Real-time</span>
                  <span className="px-3 py-1 rounded-full bg-muted text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Secure</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
