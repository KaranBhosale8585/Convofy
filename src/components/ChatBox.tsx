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
import { useTheme } from "next-themes";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { sendMessage, getMessagesWithUser, markMessagesAsRead } from "@/actions/message.action";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface MsgBoxProps {
  receiver: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
  };
  currentUserId: string;
  setChatUser: (user: any | null) => void;
  setShowChatUsersMobile: (show: boolean) => void;
}

const MsgBox: React.FC<MsgBoxProps> = ({
  receiver,
  currentUserId,
  setChatUser,
  setShowChatUsersMobile,
}) => {
  const { user } = useUser();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await getMessagesWithUser(receiver.id);
        if (res.success) {
          setMessages(res.messages ?? []);
          // Mark as read when opening
          await markMessagesAsRead(receiver.id);
        } else {
          toast.error(res.error || "Failed to load messages");
        }
      } catch {
        toast.error("Error fetching messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [receiver.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`user-${currentUserId}`);

    const handleNewMessage = async (data: any) => {
      const { message } = data;
      if (
        message.senderId === receiver.id ||
        message.receiverId === receiver.id
      ) {
        setMessages((prev) => [...prev, message]);

        // If message is from the receiver, mark as read immediately
        if (message.senderId === receiver.id) {
          await markMessagesAsRead(receiver.id);
        }
      }
    };

    channel.bind("new-message", handleNewMessage);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusherClient.unsubscribe(`user-${currentUserId}`);
    };
  }, [receiver.id, currentUserId]);

  const appendEmoji = useCallback((emoji: { native: string }) => {
    setMessage((prev) => prev + emoji.native);
    textareaRef.current?.focus();
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!receiver.id || !message.trim()) return;

    setIsSending(true);
    try {
      const res = await sendMessage(receiver.id, message);

      if (!res.success || !res.message) return toast.error(res.error || "Send failed");

      setMessages((prev) => [...prev, res.message]);

      setMessage("");
      setShowEmojiPicker(false);
    } catch {
      toast.error("Message send failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full h-full overflow-hidden border shadow-xl rounded-2xl flex flex-col bg-background/50 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="shrink-0">
        <ChatHeader
          receiver={receiver}
          setChatUser={setChatUser}
          setShowChatUsersMobile={setShowChatUsersMobile}
        />
        <Separator />
      </div>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2 text-muted-foreground">
            <Loader2Icon className="w-6 h-6 animate-spin" />
            <p className="text-xs">Summoning messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-60">
            <p className="text-2xl">👋</p>
            <p className="text-sm font-medium">No messages yet.</p>
            <p className="text-xs text-muted-foreground">Don&apos;t be shy, say hi!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isSender = msg.sender?.id === currentUserId;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] px-4 py-2 rounded-2xl border shadow-sm text-sm leading-relaxed ${
                      isSender
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-muted/50 border-muted dark:border-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">{msg.content}</p>
                    <span className={`block text-[10px] text-right mt-1 opacity-60 ${isSender ? "text-blue-100" : ""}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} className="h-2" />
      </CardContent>

      {/* Chat Input */}
      <CardFooter className="shrink-0 border-t p-4 sm:px-6 bg-background/80 backdrop-blur-md">
        <form onSubmit={handleSend} className="w-full flex items-center gap-3">
          {/* Avatar (Hidden on small screens to save space) */}
          <Avatar className="hidden sm:flex w-9 h-9 border shadow-sm shrink-0">
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
              className="w-full min-h-[40px] max-h-[120px] resize-none text-sm rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as any);
                }
              }}
              aria-label="Message input"
            />

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-4 z-50">
                <div className="shadow-2xl rounded-2xl overflow-hidden border">
                  <Picker
                    data={data}
                    onEmojiSelect={appendEmoji}
                    theme={theme === "dark" ? "dark" : "light"}
                    set="native"
                  />
                </div>
              </div>
            )}

            {/* Emoji Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              disabled={isSending}
              className="text-muted-foreground hover:text-blue-500 hover:bg-blue-50/10 transition shrink-0"
            >
              <SmileIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            className="h-10 w-10 sm:w-auto sm:px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shrink-0"
            disabled={!message.trim() || isSending}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <SendIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default MsgBox;
