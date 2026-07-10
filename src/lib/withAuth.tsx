import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type WithAuthProps = {
  user: User;
};

export function withAuth<P extends object>(
  Component: React.ComponentType<P & WithAuthProps>
) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let mounted = true;

      const check = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        if (mounted) {
          setUser(session.user);
          setLoading(false);
        }
      };

      check();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session?.user && mounted) {
          router.replace("/login");
        } else if (session?.user && mounted) {
          setUser(session.user);
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }, [router]);

    if (loading || !user) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Verifying session...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} user={user} />;
  };
}