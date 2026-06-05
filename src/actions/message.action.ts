"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import {pusherServer} from "@/lib/pusher";

export async function sendMessage(receiverId: string, content: string) {
  try {
    const senderId = await getDbUserId();
    if (!senderId) return { success: false, error: "Unauthorized" };
    if (!content)
      return { success: false, error: "Message content is required" };
    if (!receiverId)
      return { success: false, error: "Receiver ID is required" };

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    await pusherServer.trigger(
      `user-${receiverId}`,
      "new-message",
      {
        message: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          senderId: message.senderId,
          receiverId: message.receiverId,
          sender: message.sender,
          isRead: message.isRead,
        },
      }
    );
    return { success: true, message };
  } catch (error) {
    console.error("Failed to send message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function getMessagesWithUser(otherUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    return { success: true, messages };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function markMessagesAsRead(senderId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return { success: false, error: "Failed to mark messages as read" };
  }
}

export async function getUnreadCounts() {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const unreadMessages = await prisma.message.groupBy({
      by: ["senderId"],
      where: {
        receiverId: userId,
        isRead: false,
      },
      _count: {
        id: true,
      },
    });

    const counts = unreadMessages.reduce((acc, curr) => {
      acc[curr.senderId] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return { success: true, counts };
  } catch (error) {
    console.error("Failed to fetch unread counts:", error);
    return { success: false, error: "Failed to fetch unread counts" };
  }
}
