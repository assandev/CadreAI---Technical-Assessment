import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FollowButton } from "@/components/FollowButton";
import { FeedPost } from "@/components/FeedPost";
import type { FeedPost as FeedPostType } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();
  const currentUserId = authData?.claims?.sub ?? null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [followersResult, followingResult, postsResult, isFollowingResult] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id),
      supabase
        .from("feed_with_authors")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),
      currentUserId && currentUserId !== profile.id
        ? supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUserId)
            .eq("following_id", profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const followersCount = followersResult.count ?? 0;
  const followingCount = followingResult.count ?? 0;
  const posts = (postsResult.data as FeedPostType[]) ?? [];
  const isFollowing = !!isFollowingResult.data;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex flex-col gap-4 mb-8 p-6 border rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold shrink-0">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.display_name}</h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
          {currentUserId && currentUserId !== profile.id && (
            <FollowButton
              currentUserId={currentUserId}
              targetUserId={profile.id}
              initialIsFollowing={isFollowing}
            />
          )}
          {currentUserId === profile.id && (
            <a
              href="/profile"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Edit profile
            </a>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}

        <div className="flex gap-5 text-sm">
          <span>
            <strong>{followersCount}</strong>{" "}
            <span className="text-muted-foreground">followers</span>
          </span>
          <span>
            <strong>{followingCount}</strong>{" "}
            <span className="text-muted-foreground">following</span>
          </span>
          <span>
            <strong>{posts.length}</strong>{" "}
            <span className="text-muted-foreground">posts</span>
          </span>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          No posts yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} userId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
