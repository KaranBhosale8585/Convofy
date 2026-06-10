"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";
import { motion, AnimatePresence } from "framer-motion";

const MAX_CHARACTERS = 500;

const CreatePost = () => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setContent(value);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleDiscard = () => {
    setContent("");
    setImageUrl("");
    setShowImageUpload(false);
    toast.success("Draft discarded");
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;
    setIsPosting(true);

    try {
      const result = await createPost(content, imageUrl);
      if (result?.success) {
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        toast.success("Post created successfully");
      } else {
        toast.error(result?.error || "Failed to create post");
      }
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const charCount = content.length;
  const isNearLimit = charCount > MAX_CHARACTERS * 0.8;
  const isAtLimit = charCount >= MAX_CHARACTERS;

  return (
    <Card className="mb-6 overflow-hidden border-none shadow-sm ring-1 ring-border/50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10 ring-2 ring-background">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <div className="flex-1 min-w-0">
              <Textarea
                ref={textareaRef}
                placeholder="What's on your mind?"
                className="min-h-[60px] resize-none border-none focus-visible:ring-0 p-0 text-base bg-transparent"
                value={content}
                onChange={handleTextareaChange}
                disabled={isPosting}
              />
            </div>
          </div>

          <AnimatePresence>
            {(showImageUpload || imageUrl) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border rounded-xl p-4 bg-muted/30">
                  <ImageUpload
                    endpoint="postImage"
                    value={imageUrl}
                    onChange={(url) => {
                      setImageUrl(url);
                      if (!url) setShowImageUpload(false);
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                onClick={() => setShowImageUpload(!showImageUpload)}
                disabled={isPosting}
              >
                <ImageIcon className="size-4 mr-2" />
                <span>Photo</span>
              </Button>
              
              {(content || imageUrl) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                  onClick={handleDiscard}
                  disabled={isPosting}
                >
                  <XIcon className="size-4 mr-2" />
                  <span>Discard</span>
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span 
                className={`text-xs font-medium transition-colors ${
                  isAtLimit ? "text-destructive" : isNearLimit ? "text-yellow-500" : "text-muted-foreground/60"
                }`}
              >
                {charCount}/{MAX_CHARACTERS}
              </span>
              
              <Button
                className="flex items-center h-9 px-4 rounded-full font-medium"
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || isPosting}
              >
                {isPosting ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    <span>Posting</span>
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4 mr-2" />
                    <span>Post</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
