"use client";

import React, { useEffect, useState } from "react";
import ChatUsers from "@/components/ChatUsers";
import MsgBox from "@/components/ChatBox";
import { getDbUserId } from "@/actions/user.action";

const HomePage: React.FC = () => {
  const [chatUser, setChatUser] = useState<string | null>(null);
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
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-160px)]">
      <div
        className={`
          ${showChatUsersMobile ? "block" : "hidden"}
          lg:block lg:col-span-4 sticky top-0 h-full overflow-y-auto
        `}
      >
        <ChatUsers setChatUser={setChatUser} />
      </div>

      <div
        className={`
          ${showChatUsersMobile ? "hidden" : "block"}
          lg:block lg:col-span-6 h-full
          flex flex-col
        `}
      >
        {chatUser && dbUserId ? (
          <>
            <MsgBox
              receiverId={chatUser}
              setChatUser={setChatUser}
              setShowChatUsersMobile={setShowChatUsersMobile}
              currentUserId={dbUserId}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full border rounded-2xl shadow-md bg-gradient-to-br from-muted/40 to-background p-2">
            <div className="text-center space-y-2 animate-fade-in">
              <p className="text-xl">💬</p>
              <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed">
                {dbUserId ? (
                  <>
                    🤔 Still quiet in here...
                    <br />
                    Select someone from the list and start the convo magic! ✨
                  </>
                ) : (
                  <>
                    🧙‍♂️ Preparing your chat realm...
                    <br />
                    Hold tight while we summon your session from the cloud!
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
