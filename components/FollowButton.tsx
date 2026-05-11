"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ currentUserId, targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const supabase = createClient();
    if (isFollowing) {
      setIsFollowing(false);
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", targetUserId);
    } else {
      setIsFollowing(true);
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: targetUserId });
    }
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-4 py-1.5 rounded-full text-sm border transition-colors disabled:opacity-40 ${
        isFollowing
          ? "border-muted-foreground text-muted-foreground hover:border-red-400 hover:text-red-400"
          : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
