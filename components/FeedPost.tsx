"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FeedPost as FeedPostType, CommentWithAuthor } from "@/types/database";
import { VALIDATION } from "@/types/database";

interface FeedPostProps {
  post: FeedPostType;
  userId: string | null;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function FeedPost({ post, userId }: FeedPostProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const isOtherUser = !!userId && userId !== post.user_id;

      const [likesResult, commentsResult, followResult] = await Promise.all([
        supabase.from("likes").select("id, user_id").eq("post_id", post.id),
        supabase
          .from("comments")
          .select("id, post_id, user_id, content, created_at, profiles(username, display_name)")
          .eq("post_id", post.id)
          .order("created_at", { ascending: true }),
        isOtherUser
          ? supabase.from("follows").select("id").eq("follower_id", userId!).eq("following_id", post.user_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (likesResult.data) {
        setLikeCount(likesResult.data.length);
        setIsLiked(!!userId && likesResult.data.some((l) => l.user_id === userId));
      }

      if (followResult.data) setIsFollowing(true);

      if (commentsResult.data) {
        const mapped = commentsResult.data.map((c: any) => ({
          id: c.id,
          post_id: c.post_id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          username: c.profiles?.username ?? "unknown",
          display_name: c.profiles?.display_name ?? "Unknown",
        }));
        setComments(mapped);
      }
    };

    fetchData();
  }, [post.id, userId]);

  const handleLikeToggle = async () => {
    if (!userId || isLikeLoading) return;

    setIsLikeLoading(true);
    const supabase = createClient();

    if (isLiked) {
      setIsLiked(false);
      setLikeCount((c) => c - 1);
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", userId);
    } else {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from("likes").insert({ post_id: post.id, user_id: userId });
    }

    setIsLikeLoading(false);
  };

  const handleFollowToggle = async () => {
    if (!userId || isFollowLoading) return;
    setIsFollowLoading(true);
    const supabase = createClient();
    if (isFollowing) {
      setIsFollowing(false);
      await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", post.user_id);
    } else {
      setIsFollowing(true);
      await supabase.from("follows").insert({ follower_id: userId, following_id: post.user_id });
    }
    setIsFollowLoading(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || !userId) return;
    if (trimmed.length > VALIDATION.postComment.maxLength) {
      setCommentError(VALIDATION.postComment.errorMessage);
      return;
    }

    setCommentError(null);
    setIsCommentLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, user_id: userId, content: trimmed });

    if (error) {
      setCommentError(error.message);
      setIsCommentLoading(false);
      return;
    }

    const { data } = await supabase
      .from("comments")
      .select("id, post_id, user_id, content, created_at, profiles(username, display_name)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (data) {
      const mapped = data.map((c: any) => ({
        id: c.id,
        post_id: c.post_id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        username: c.profiles?.username ?? "unknown",
        display_name: c.profiles?.display_name ?? "Unknown",
      }));
      setComments(mapped);
    }

    setNewComment("");
    setIsCommentLoading(false);
  };

  return (
    <article className="p-4 border rounded-lg flex flex-col gap-3">
      {/* Author row */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
          {post.display_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <a
            href={`/profile/${post.username}`}
            className="text-sm font-semibold hover:underline underline-offset-2"
          >
            {post.display_name}
          </a>
          <a
            href={`/profile/${post.username}`}
            className="text-xs text-muted-foreground hover:underline underline-offset-2"
          >
            @{post.username}
          </a>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {userId && userId !== post.user_id && (
            <button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors disabled:opacity-40 ${
                isFollowing
                  ? "border-muted-foreground text-muted-foreground hover:border-red-400 hover:text-red-400"
                  : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
          <span className="text-xs text-muted-foreground" suppressHydrationWarning>
            {formatRelativeTime(post.created_at)}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={handleLikeToggle}
          disabled={!userId || isLikeLoading}
          className={`flex items-center gap-1 text-sm transition-colors ${
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
          } disabled:opacity-40`}
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <span>{isLiked ? "♥" : "♡"}</span>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle comments"
        >
          <span>💬</span>
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="flex flex-col gap-3 pt-1 border-t">
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2 text-sm">
                  <span className="font-semibold shrink-0">{c.display_name}</span>
                  <span className="text-muted-foreground break-words">{c.content}</span>
                </div>
              ))}
            </div>
          )}

          {userId && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Write a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={VALIDATION.postComment.maxLength}
                disabled={isCommentLoading}
              />
              <button
                type="submit"
                disabled={isCommentLoading || !newComment.trim()}
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-40"
              >
                {isCommentLoading ? "…" : "Post"}
              </button>
            </form>
          )}
          {commentError && <p className="text-xs text-red-500">{commentError}</p>}
        </div>
      )}
    </article>
  );
}
