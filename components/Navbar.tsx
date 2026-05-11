import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  return (
    <nav className="w-full border-b border-border h-14 flex items-center px-4">
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
        <Link href={isAuthenticated ? "/feed" : "/"} className="font-bold text-lg">
          Cadre
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link href="/feed" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Feed
            </Link>
            <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
