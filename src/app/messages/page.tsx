"use client";

import React, { useEffect, useState } from "react";
import ChatUsers from "@/components/ChatUsers";
import MsgBox from "@/components/ChatBox";
import { getDbUserId } from "@/actions/user.action";

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
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)] lg:h-[calc(100vh-140px)] overflow-hidden min-h-[500px]">
      <div
        className={`
          ${showChatUsersMobile ? "flex" : "hidden"}
          lg:flex lg:w-1/3 xl:w-1/4 h-full flex-col min-h-0
        `}
      >
        <ChatUsers setChatUser={setChatUser} activeUserId={chatUser?.id} />
      </div>

      <div
        className={`
          ${showChatUsersMobile ? "hidden" : "flex"}
          lg:flex lg:flex-1 h-full flex-col min-h-0
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
          <div className="flex items-center justify-center h-full border rounded-2xl shadow-md bg-gradient-to-br from-muted/40 to-background p-2">
            <div className="text-center space-y-2 animate-fade-in px-4">
              <p className="text-3xl mb-4">💬</p>
              <h3 className="text-xl font-semibold">Your Messages</h3>
              <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed max-w-sm mx-auto">
                {dbUserId ? (
                  <>
                    Select someone from the list to start a conversation. 
                    Your realm of connection awaits! ✨
                  </>
                ) : (
                  <>
                    🧙‍♂️ Preparing your chat realm...
                    <br />
                    Hold tight while we summon your session!
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
