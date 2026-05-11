"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { VALIDATION } from "@/types/database";

interface PostComposerProps {
  userId: string;
  onPost?: () => void;
}

export function PostComposer({ userId, onPost }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const remaining = VALIDATION.postContent.maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      setError("Post cannot be empty.");
      return;
    }
    if (trimmed.length > VALIDATION.postContent.maxLength) {
      setError(VALIDATION.postContent.errorMessage);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: userId,
        content: trimmed,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setContent("");
      onPost?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 border rounded-lg">
      <textarea
        className="w-full min-h-[80px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={VALIDATION.postContent.maxLength}
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${remaining < 20 ? "text-red-500" : "text-muted-foreground"}`}>
          {remaining} characters remaining
        </span>
        <Button type="submit" size="sm" disabled={isLoading || !content.trim()}>
          {isLoading ? "Posting..." : "Post"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
