"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { handleActionError, type ActionResponse } from "@/lib/error-handler";
import { safeTrigger } from "@/lib/pusher";

export async function syncUser(): Promise<ActionResponse> {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return { success: false, error: "Unauthorized" };

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) return { success: true, data: existingUser };

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });
    return { success: true, data: dbUser };
  } catch (error) {
    return handleActionError(error, "Error syncing user");
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    return await prisma.user.findUnique({
      where: { clerkId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in getUserByClerkId:", error);
    return null;
  }
}

export async function getDbUserId() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const user = await getUserByClerkId(clerkId);
    return user?.id ?? null;
  } catch (error) {
    console.error("Error in getDbUserId:", error);
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) return null;

    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}


export async function getChatUsers() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    // Get followers (users who follow me)
    const followers = await prisma.follows.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Get following (users I follow)
    const following = await prisma.follows.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    const usersMap = new Map();
    followers.forEach((f) => usersMap.set(f.follower.id, f.follower));
    following.forEach((f) => usersMap.set(f.following.id, f.following));

    return Array.from(usersMap.values());
  } catch (error) {
    console.error("Error in getChatUsers:", error);
    return [];
  }
}


export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];
    // get 3 random users exclude ourselves & user that we already follow
    return await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          { NOT: { followers: { some: { followerId: userId } } } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: { select: { followers: true } },
      },
      take: 3,
    });
  } catch (error) {
    console.error("Error fetching random users:", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string): Promise<ActionResponse> {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Unauthorized" };
    if (userId === targetUserId) return { success: false, error: "You cannot follow yourself" };

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
      revalidatePath("/");
      return { success: true, data: { followed: false } };
    } else {
      const [follow, notification] = await prisma.$transaction(async (tx) => {
        const newFollow = await tx.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        });

        const newNotification = await tx.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId,
            creatorId: userId,
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
          },
        });

        return [newFollow, newNotification];
      });

      await safeTrigger(`private-user-${targetUserId}`, "new-notification", notification);
      revalidatePath("/");
      return { success: true, data: { followed: true } };
    }
  } catch (error) {
    return handleActionError(error, "Error toggling follow");
  }
}
