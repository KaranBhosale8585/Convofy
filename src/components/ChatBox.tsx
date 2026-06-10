"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  FormEvent,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Loader2Icon, SmileIcon, CheckCheckIcon, CheckIcon } from "lucide-react";
import ChatHeader from "./ChatHeader";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { sendMessage, getMessagesWithUser, markMessagesAsRead } from "@/actions/message.action";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { format } from "date-fns";
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
          setMessages(res.data ?? []);
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
    scrollToBottom(loading ? "auto" : "smooth");
  }, [messages, loading]);

  useEffect(() => {
    if (!currentUserId || !pusherClient) return;

    // Use private channel for security
    const channel = pusherClient.subscribe(`private-user-${currentUserId}`);

    const handleNewMessage = async (data: any) => {
      const { message } = data;
      // Only add to messages if it's the current active conversation
      if (
        message.senderId === receiver.id ||
        message.receiverId === receiver.id
      ) {
        setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === message.id)) {
                return prev;
            }
            return [...prev, message];
        });
        
        if (message.senderId === receiver.id) {
          await markMessagesAsRead(receiver.id);
        }
      }
    };

    const handleMessagesRead = (data: { receiverId: string }) => {
        if (data.receiverId === receiver.id) {
            setMessages((prev) => 
                prev.map(m => m.receiverId === receiver.id && !m.isRead ? { ...m, isRead: true } : m)
            );
        }
    };

    channel.bind("new-message", handleNewMessage);
    channel.bind("messages-read", handleMessagesRead);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      channel.unbind("messages-read", handleMessagesRead);
    };
  }, [receiver.id, currentUserId]);

  const appendEmoji = useCallback((emoji: { native: string }) => {
    setMessage((prev) => prev + emoji.native);
    textareaRef.current?.focus();
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!receiver.id || !message.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content: message,
      senderId: currentUserId,
      receiverId: receiver.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: { id: currentUserId },
      isTemp: true
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessage("");
    setShowEmojiPicker(false);
    textareaRef.current?.focus();

    try {
      const res = await sendMessage(receiver.id, tempMessage.content);
      if (!res.success || !res.data) {
        setMessages((prev) => prev.filter(m => m.id !== tempId));
        return toast.error(res.error || "Send failed");
      }
      // Replace temp message with actual data from server
      // BUT only if the real message isn't already there (from Pusher)
      setMessages((prev) => {
          const exists = prev.some(m => m.id === res.data.id);
          if (exists) {
              // If real message exists, just remove the temp one
              return prev.filter(m => m.id !== tempId);
          }
          // Otherwise replace temp with real
          return prev.map(m => m.id === tempId ? res.data : m);
      });
    } catch {
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      toast.error("Message send failed");
    }
  };

  return (
    <Card className="w-full h-full overflow-hidden border-none lg:border shadow-2xl rounded-none lg:rounded-3xl flex flex-col bg-background/60 backdrop-blur-md min-h-0 text-foreground">
      <div className="shrink-0 z-20">
        <ChatHeader
          receiver={receiver}
          setChatUser={setChatUser}
          setShowChatUsersMobile={setShowChatUsersMobile}
        />
      </div>

      <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth custom-scrollbar min-h-0 relative bg-muted/5 dark:bg-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <Loader2Icon className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
            </div>
            <p className="text-sm font-medium tracking-tight">Syncing conversations...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-80 animate-in fade-in zoom-in duration-500 text-foreground">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-2">
              <SmileIcon className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold">Say Hello to {receiver.name}!</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto font-medium">Start a conversation and build your realm of connection.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isSender = msg.senderId === currentUserId;
                const nextMsg = messages[index + 1];
                const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
                const prevMsg = messages[index - 1];
                const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isSender ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-4" : "mt-0.5"}`}
                  >
                    {!isSender && isLastInGroup ? (
                      <Avatar className="w-7 h-7 mr-2 self-end mb-1 border shadow-sm">
                        <AvatarImage src={receiver.image || "/avatar.png"} />
                      </Avatar>
                    ) : !isSender ? (
                      <div className="w-7 mr-2" />
                    ) : null}

                    <div className="group relative flex flex-col max-w-[80%] sm:max-w-[70%]">
                      <div
                        className={`
                          px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-200
                          ${isSender 
                            ? `bg-blue-600 text-white selection:bg-blue-400 selection:text-white
                               ${isFirstInGroup && isLastInGroup ? "rounded-2xl rounded-tr-sm" : 
                                 isFirstInGroup ? "rounded-t-2xl rounded-bl-2xl rounded-tr-sm" :
                                 isLastInGroup ? "rounded-b-2xl rounded-tl-2xl rounded-tr-sm" : 
                                 "rounded-l-2xl rounded-r-sm"}`
                            : `bg-background dark:bg-muted/50 text-foreground border border-muted/50 dark:border-gray-800
                               ${isFirstInGroup && isLastInGroup ? "rounded-2xl rounded-tl-sm" : 
                                 isFirstInGroup ? "rounded-t-2xl rounded-br-2xl rounded-tl-sm" :
                                 isLastInGroup ? "rounded-b-2xl rounded-tr-2xl rounded-tl-sm" : 
                                 "rounded-r-2xl rounded-l-sm"}`
                          }
                        `}
                      >
                        <p className="whitespace-pre-line break-words">{msg.content}</p>
                      </div>

                      {isLastInGroup && (
                        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isSender ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] font-medium text-muted-foreground opacity-70">
                            {format(new Date(msg.createdAt), "HH:mm")}
                          </span>
                          {isSender && (
                            msg.isTemp ? (
                               <Loader2Icon className="w-3 h-3 animate-spin text-muted-foreground" />
                            ) : msg.isRead ? (
                              <CheckCheckIcon className="w-3 h-3 text-blue-500" />
                            ) : (
                              <CheckIcon className="w-3 h-3 text-muted-foreground" />
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        <div ref={bottomRef} className="h-4 shrink-0" />
      </CardContent>

      <div className="shrink-0 border-t p-4 sm:p-6 bg-background/80 backdrop-blur-md z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="relative flex-1 flex items-center bg-muted/30 dark:bg-muted/20 rounded-2xl border border-transparent focus-within:border-blue-500/50 focus-within:bg-background transition-all duration-200">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="ml-1 text-muted-foreground hover:text-blue-500 rounded-full h-9 w-9 shrink-0"
            >
              <SmileIcon className="w-5 h-5" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
              className="w-full min-h-[44px] max-h-[150px] resize-none border-none bg-transparent py-3 pr-4 text-sm focus-visible:ring-0 shadow-none scrollbar-hide text-foreground placeholder:text-muted-foreground font-medium"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as any);
                }
              }}
            />

            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 lg:left-0 mb-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="shadow-2xl rounded-3xl overflow-hidden border bg-background">
                  <Picker
                    data={data}
                    onEmojiSelect={appendEmoji}
                    theme={theme === "dark" ? "dark" : "light"}
                    set="native"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="icon"
            className={`h-11 w-11 rounded-2xl shadow-lg transition-all duration-200 shrink-0 ${
              message.trim() ? "bg-blue-600 text-white hover:bg-blue-700 scale-100 hover:shadow-blue-500/20" : "bg-muted text-muted-foreground scale-95 opacity-50 font-medium"
            }`}
            disabled={!message.trim() || isSending}
          >
            <SendIcon className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default MsgBox;
