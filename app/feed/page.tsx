import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Feed } from "@/components/Feed";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/auth/login");
  }

  const userId = authData.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Feed</h1>
      <Feed userId={userId} hasProfile={!!profile} />
    </div>
  );
}
