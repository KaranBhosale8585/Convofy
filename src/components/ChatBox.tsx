"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  FormEvent,
} from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Loader2Icon, SmileIcon } from "lucide-react";
import ChatHeader from "./ChatHeader";
import { useUser } from "@clerk/nextjs";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { sendMessage, getMessagesWithUser } from "@/actions/message.action";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface MsgBoxProps {
  receiverId: string;
  currentUserId: string;
  setChatUser: (userId: string | null) => void;
  setShowChatUsersMobile: (show: boolean) => void;
}

const MsgBox: React.FC<MsgBoxProps> = ({
  receiverId,
  currentUserId,
  setChatUser,
  setShowChatUsersMobile,
}) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await getMessagesWithUser(receiverId);
      res.success
        ? setMessages(res.messages ?? [])
        : toast.error(res.error || "Failed to load messages");
    } catch {
      toast.error("Error fetching messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`user-${currentUserId}`);

    const handleNewMessage = (data: any) => {
      const { message } = data;
      if (
        message.senderId === receiverId ||
        message.receiverId === receiverId
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    channel.bind("new-message", handleNewMessage);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusherClient.unsubscribe(`user-${currentUserId}`);
    };
  }, [receiverId, currentUserId]);

  const appendEmoji = useCallback((emoji: { native: string }) => {
    setMessage((prev) => prev + emoji.native);
    textareaRef.current?.focus();
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!receiverId || !message.trim()) return;

    setIsSending(true);
    try {
      const res = await sendMessage(receiverId, message);

      if (!res.success) return toast.error(res.error || "Send failed");

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          content: message,
          sender: { id: currentUserId },
          receiverId,
          createdAt: new Date().toISOString(),
        },
      ]);

      setMessage("");
      setShowEmojiPicker(false);
    } catch {
      toast.error("Message send failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full h-full max-h-screen overflow-hidden border shadow-xl rounded-2xl flex flex-col">
      {/* Chat Header */}
      <ChatHeader
        receiverId={receiverId}
        setChatUser={setChatUser}
        setShowChatUsersMobile={setShowChatUsersMobile}
      />
      <Separator />

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isSender = msg.sender?.id === currentUserId;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-full sm:max-w-sm px-4 py-2 rounded-2xl border shadow-sm text-sm leading-relaxed ${
                    isSender
                      ? "bg-blue-500 text-white"
                      : "border-muted dark:border-gray-700"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span className="block text-[10px] text-right mt-1 opacity-60">
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </CardContent>

      {/* Chat Input */}
      <CardFooter className="border-t p-4 sm:px-6 bg-background">
        <form onSubmit={handleSend} className="w-full flex items-center gap-3">
          {/* Avatar */}
          <Avatar className="w-10 h-10 border shadow-sm shrink-0">
            <AvatarImage
              src={user?.imageUrl || "/avatar.png"}
              alt="User avatar"
            />
          </Avatar>

          {/* Message + Emoji Button */}
          <div className="relative flex-1 flex items-center gap-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              className="w-full resize-none text-sm rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              rows={1}
              aria-label="Message input"
            />

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <Picker data={data} onEmojiSelect={appendEmoji} theme="light" />
              </div>
            )}

            {/* Emoji Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              disabled={isSending}
              className="text-muted-foreground hover:text-blue-500 transition"
            >
              <SmileIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            disabled={!message.trim() || isSending}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
  
};

export default MsgBox;
