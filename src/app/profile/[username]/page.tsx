// No "use client" here
import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  updateProfile,
  isFollowing,
} from "@/actions/profile.action";
import ProfilePageClient from "./ProfilePageClient";
import { notFound } from "next/navigation";

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}

export default ProfilePageServer;
