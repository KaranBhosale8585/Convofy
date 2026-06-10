"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

import { handleActionError, type ActionResponse } from "@/lib/error-handler";
import { safeTrigger } from "@/lib/pusher";

export async function createPost(content: string, image: string): Promise<ActionResponse> {
  try {
    const userId = await getDbUserId();

    if (!userId) return { success: false, error: "Unauthorized" };
    if (!content.trim() && !image) return { success: false, error: "Content or image is required" };

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        image,
        authorId: userId,
      },
    });

    await safeTrigger("notifications", "new-notification", {
      post: {
        id: post.id,
        content: post.content,
        image: post.image,
        createdAt: post.createdAt,
        authorId: post.authorId,
      },
    });
    revalidatePath("/");
    return { success: true, data: post };
  } catch (error) {
    return handleActionError(error, "Failed to create post");
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.error("Error in getPosts:", error);
    // Returning empty array instead of throwing might be safer for some RSCs, 
    // but throwing allows Next.js error boundaries to catch it.
    // Given the audit goal, we keep throwing but ensure it's handled in the UI.
    throw new Error("Failed to fetch posts");
  }
}

export async function toggleLike(postId: string): Promise<ActionResponse> {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    // check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) return { success: false, error: "Post not found" };

    if (existingLike) {
      // unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // like and create notification (only if liking someone else's post)
      const [newLike, notification] = await prisma.$transaction(async (tx) => {
        const like = await tx.like.create({
          data: {
            userId,
            postId,
          },
        });

        let newNotification = null;
        if (post.authorId !== userId) {
          newNotification = await tx.notification.create({
            data: {
              type: "LIKE",
              userId: post.authorId, // recipient (post author)
              creatorId: userId, // person who liked
              postId,
            },
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
              post: {
                select: {
                  id: true,
                  content: true,
                  image: true,
                },
              },
            },
          });
        }

        return [like, newNotification];
      });

      if (notification) {
        await safeTrigger(`private-user-${post.authorId}`, "new-notification", notification);
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return handleActionError(error, "Failed to toggle like");
  }
}

export async function createComment(postId: string, content: string): Promise<ActionResponse> {
  try {
    const userId = await getDbUserId();

    if (!userId) return { success: false, error: "Unauthorized" };
    if (!content.trim()) return { success: false, error: "Content is required" };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) return { success: false, error: "Post not found" };

    // Create comment and notification in a transaction
    const [comment, notification] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      let newNotification = null;
      if (post.authorId !== userId) {
        newNotification = await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            post: {
              select: {
                id: true,
                content: true,
                image: true,
              },
            },
            comment: {
              select: {
                id: true,
                content: true,
                createdAt: true,
              },
            },
          },
        });
      }

      return [newComment, newNotification];
    });

    if (notification) {
      await safeTrigger(`private-user-${post.authorId}`, "new-notification", notification);
    }

    revalidatePath(`/`);
    return { success: true, data: comment };
  } catch (error) {
    return handleActionError(error, "Failed to create comment");
  }
}

export async function deletePost(postId: string): Promise<ActionResponse> {
  try {
    const userId = await getDbUserId();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) return { success: false, error: "Post not found" };
    if (post.authorId !== userId)
      return { success: false, error: "Unauthorized - no delete permission" };

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/"); // purge the cache
    return { success: true };
  } catch (error) {
    return handleActionError(error, "Failed to delete post");
  }
}
