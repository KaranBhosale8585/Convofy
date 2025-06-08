"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  FormEvent,
} from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, SendIcon, Loader2Icon, SmileIcon } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ImageUpload from "./ImageUpload";
import { useUser } from "@clerk/nextjs";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { sendMessage, getMessagesWithUser } from "@/actions/message.action";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

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
  const [imageUrl, setImageUrl] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    if (!receiverId || (!message.trim() && !imageUrl)) return;

    setIsSending(true);
    try {
      const fullMessage = message + (imageUrl ? `\n[Image](${imageUrl})` : "");
      const res = await sendMessage(receiverId, fullMessage);

      if (!res.success) return toast.error(res.error || "Send failed");

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          content: fullMessage,
          sender: { id: currentUserId },
          receiverId,
          createdAt: new Date().toISOString(),
        },
      ]);

      setMessage("");
      setImageUrl("");
      setShowEmojiPicker(false);
      setShowImageUpload(false);
    } catch {
      toast.error("Message send failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="flex flex-col h-screen max-h-screen rounded-xl shadow-lg border overflow-hidden">
      {/* Header */}
      <ChatHeader
        receiverId={receiverId}
        setChatUser={setChatUser}
        setShowChatUsersMobile={setShowChatUsersMobile}
      />

      {/* Messages */}
      <CardContent className="flex-grow p-4 space-y-3 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isSender = msg.sender?.id === currentUserId;
            const isImage = msg.content.includes("[Image](");
            const content = isImage
              ? msg.content.match(/\[Image\]\((.*?)\)/)?.[1]
              : msg.content;

            return (
              <div
                key={msg.id}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg whitespace-pre-wrap break-words text-sm shadow ${
                    isSender
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {isImage ? (
                    <img
                      src={content}
                      alt="Sent image"
                      className="rounded-md max-w-full max-h-60 object-contain"
                    />
                  ) : (
                    <p>{content}</p>
                  )}
                  <div className="text-xs text-right mt-1 opacity-60">
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Input */}
      <CardFooter className="flex flex-col gap-2 p-4 border-t">
        {showImageUpload && (
          <div className="mb-2">
            <ImageUpload
              endpoint="chatImage"
              value={imageUrl}
              onChange={(url) => {
                setImageUrl(url);
                if (!url) setShowImageUpload(false);
              }}
            />
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-2">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={user?.imageUrl || "/avatar.png"} alt="User" />
          </Avatar>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
            rows={1}
            className="flex-grow resize-none text-sm min-h-[40px]"
            aria-label="Message input"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageUpload((prev) => !prev)}
            disabled={isSending}
            aria-label="Upload image"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={isSending}
            aria-label="Toggle emoji picker"
          >
            <SmileIcon className="w-5 h-5" />
          </Button>

          <Button
            type="submit"
            disabled={(!message.trim() && !imageUrl) || isSending}
            aria-label="Send message"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {isSending ? (
              <Loader2Icon className="w-5 h-5 animate-spin" />
            ) : (
              <SendIcon className="w-5 h-5" />
            )}
          </Button>
        </form>

        {showEmojiPicker && (
          <div className="mt-2 max-w-xs">
            <Picker data={data} onEmojiSelect={appendEmoji} theme="light" />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default MsgBox;
