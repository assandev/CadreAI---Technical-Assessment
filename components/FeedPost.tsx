import type { FeedPost as FeedPostType } from "@/types/database";

interface FeedPostProps {
  post: FeedPostType;
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

export function FeedPost({ post }: FeedPostProps) {
  return (
    <article className="p-4 border rounded-lg flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
          {post.display_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{post.display_name}</span>
          <span className="text-xs text-muted-foreground">@{post.username}</span>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {formatRelativeTime(post.created_at)}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{post.content}</p>
    </article>
  );
}
