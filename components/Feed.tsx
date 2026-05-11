"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FeedPost } from "@/components/FeedPost";
import { PostComposer } from "@/components/PostComposer";
import type { FeedPost as FeedPostType } from "@/types/database";

interface FeedProps {
  userId: string | null;
  hasProfile: boolean;
}

export function Feed({ userId, hasProfile }: FeedProps) {
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("feed_with_authors")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("Failed to load posts. Please try again.");
        return;
      }

      setPosts((data as FeedPostType[]) ?? []);
    } catch {
      setError("Something went wrong loading the feed.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <div className="flex flex-col gap-4">
      {userId && hasProfile && (
        <PostComposer userId={userId} onPost={fetchFeed} />
      )}

      {userId && !hasProfile && (
        <div className="p-4 border rounded-lg text-sm text-muted-foreground text-center">
          <a href="/profile" className="underline underline-offset-4">
            Set up your profile
          </a>{" "}
          to start posting.
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-2 w-16 bg-muted rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 border rounded-lg text-sm text-red-500 text-center">
          {error}
          <button
            onClick={fetchFeed}
            className="block mx-auto mt-2 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No posts yet. Be the first to share something!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
