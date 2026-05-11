"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/database";
import { VALIDATION } from "@/types/database";

interface ProfileFormProps {
  userId: string;
  initialProfile: Profile | null;
}

export function ProfileForm({ userId, initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialProfile?.username ?? "");
  const [displayName, setDisplayName] = useState(initialProfile?.display_name ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedUsername) return "Username is required";
    if (trimmedUsername.length < VALIDATION.username.minLength || trimmedUsername.length > VALIDATION.username.maxLength) {
      return VALIDATION.username.errorMessage;
    }
    if (!VALIDATION.username.pattern.test(trimmedUsername)) {
      return VALIDATION.username.errorMessage;
    }
    if (!trimmedDisplayName) return "Display name is required";
    if (trimmedDisplayName.length > VALIDATION.displayName.maxLength) {
      return VALIDATION.displayName.errorMessage;
    }
    if (bio && bio.length > VALIDATION.bio.maxLength) {
      return VALIDATION.bio.errorMessage;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: userId,
        username: username.trim(),
        display_name: displayName.trim(),
        bio: bio.trim() || null,
      });

      if (upsertError) {
        if (upsertError.message.includes("unique") || upsertError.code === "23505") {
          setError("That username is already taken.");
        } else {
          setError(upsertError.message);
        }
        return;
      }

      setSuccess(true);
      router.push("/feed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{initialProfile ? "Edit Profile" : "Create Profile"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={VALIDATION.username.maxLength}
            />
            <p className="text-xs text-muted-foreground">3–30 characters, letters, numbers, underscores</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={VALIDATION.displayName.maxLength}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio <span className="text-muted-foreground">(optional)</span></Label>
            <textarea
              id="bio"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tell people a bit about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={VALIDATION.bio.maxLength}
            />
            <p className="text-xs text-muted-foreground">{bio.length}/{VALIDATION.bio.maxLength}</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">Profile saved!</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
