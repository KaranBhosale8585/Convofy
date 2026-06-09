"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

import { handleActionError, type ActionResponse } from "@/lib/error-handler";

export async function getNotifications() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    return await prisma.notification.findMany({
      where: {
        userId,
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
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return []; // Return empty array to prevent UI crash in RSC
  }
}

export async function markNotificationsAsRead(notificationIds: string[]): Promise<ActionResponse> {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    return handleActionError(error, "Error marking notifications as read");
  }
}

export async function getUnreadNotificationCount() {
  try {
    const userId = await getDbUserId();
    if (!userId) return 0;

    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return 0;
  }
}