"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser(); //POST Req

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) return existingUser;

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
    return dbUser;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
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
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getUserById(userId: string) {
  const { userId: authUserId } = await auth();
  if (!authUserId) return null;

  const user = await prisma.user.findUnique({
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

  if (!user) throw new Error("User not found");

  return user;
}


export async function getChatUsers() {
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

  // Merge both lists and remove duplicates by user ID
  const usersMap = new Map();

  followers.forEach((f) => {
    usersMap.set(f.follower.id, f.follower);
  });

  following.forEach((f) => {
    usersMap.set(f.following.id, f.following);
  });

  return Array.from(usersMap.values());
}


export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];
    // get 3 random users exclude ourselves & user that we already follow
    const randomUsers = await prisma.user.findMany({
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
    return randomUsers;
  } catch (error) {
    console.error("Error fetching random users:", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow

      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, //user being followed
            creatorId: userId, // user folowing
          },
        }),
      ]);
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}
